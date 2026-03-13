// 文件条目类型
export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  children?: FileEntry[]
}
