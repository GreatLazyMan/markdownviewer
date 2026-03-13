use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

// 文件条目结构，与前端 FileEntry 对应
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub children: Option<Vec<FileEntry>>,
}

/// 递归读取目录树，只显示 .md 文件和包含 .md 文件的目录
#[tauri::command]
pub fn read_directory_tree(path: String) -> Result<FileEntry, String> {
    let p = Path::new(&path);
    if !p.exists() {
        return Err(format!("路径不存在: {}", path));
    }
    read_entry(p).map_err(|e| e.to_string())
}

fn read_entry(path: &Path) -> std::io::Result<FileEntry> {
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    let path_str = path.to_string_lossy().to_string();

    if path.is_dir() {
        let mut children: Vec<FileEntry> = fs::read_dir(path)?
            .filter_map(|e| e.ok())
            .filter(|e| {
                // 跳过隐藏文件（以 . 开头）
                !e.file_name().to_string_lossy().starts_with('.')
            })
            .filter_map(|e| read_entry(&e.path()).ok())
            .collect();

        // 目录优先，再按名称排序
        children.sort_by(|a, b| {
            if a.is_directory != b.is_directory {
                b.is_directory.cmp(&a.is_directory)
            } else {
                a.name.to_lowercase().cmp(&b.name.to_lowercase())
            }
        });

        Ok(FileEntry {
            name,
            path: path_str,
            is_directory: true,
            children: Some(children),
        })
    } else {
        // 只返回 .md 和 .markdown 文件
        let name_lower = name.to_lowercase();
        if name_lower.ends_with(".md") || name_lower.ends_with(".markdown") {
            Ok(FileEntry {
                name,
                path: path_str,
                is_directory: false,
                children: None,
            })
        } else {
            Err(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                "Not a markdown file",
            ))
        }
    }
}

/// 读取文件内容
#[tauri::command]
pub fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("读取文件失败 {}: {}", path, e))
}

/// 写入文件内容
#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    // 确保父目录存在
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("创建目录失败: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("写入文件失败 {}: {}", path, e))
}
