import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
import type { FileEntry } from '@/types/file'
import type { FileSystemAdapter } from './types'

export const tauriAdapter: FileSystemAdapter = {
  async openDirectory(): Promise<FileEntry | null> {
    // 调用 Tauri 对话框选择目录
    const selected = await open({
      directory: true,
      multiple: false,
    })
    if (!selected || typeof selected !== 'string') return null

    // 调用 Rust 命令递归读取目录树
    const tree = await invoke<FileEntry>('read_directory_tree', { path: selected })
    return tree
  },

  async readFile(path: string): Promise<string> {
    return await invoke<string>('read_file', { path })
  },

  async writeFile(path: string, content: string): Promise<void> {
    await invoke('write_file', { path, content })
  },
}
