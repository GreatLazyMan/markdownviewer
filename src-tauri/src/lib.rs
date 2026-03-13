mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::fs::read_directory_tree,
            commands::fs::read_file,
            commands::fs::write_file,
        ])
        .setup(|app| {
            // 设置窗口图标
            if let Some(window) = app.get_webview_window("main") {
                let icon_bytes = include_bytes!("../icons/icon.png");
                // 使用 image crate 解码 PNG
                if let Ok(img) = image::load_from_memory(icon_bytes) {
                    let rgba = img.to_rgba8();
                    let (width, height) = rgba.dimensions();
                    let icon = tauri::image::Image::new_owned(rgba.into_raw(), width, height);
                    let _ = window.set_icon(icon);
                }
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("运行 Tauri 应用时出错");
}
