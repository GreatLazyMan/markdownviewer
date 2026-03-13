// 标签页类型
export interface Tab {
  id: string
  path: string
  name: string
  content: string
  savedContent: string
  isDirty: boolean
}
