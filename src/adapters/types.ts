import type { FileEntry } from '@/types/file'

// 文件系统适配器统一接口
export interface FileSystemAdapter {
  // 打开目录选择器，返回根目录条目
  openDirectory(): Promise<FileEntry | null>
  // 读取文件内容
  readFile(path: string): Promise<string>
  // 写入文件内容
  writeFile(path: string, content: string): Promise<void>
}
