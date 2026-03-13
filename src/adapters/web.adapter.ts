import type { FileEntry } from '@/types/file'
import type { FileSystemAdapter } from './types'

// FileHandle 缓存，用于后续写入
const fileHandleCache = new Map<string, FileSystemFileHandle>()

// 递归读取目录条目
async function readDirEntry(
  handle: FileSystemDirectoryHandle,
  path: string,
): Promise<FileEntry> {
  const children: FileEntry[] = []

  const iter = (handle as any).entries() as AsyncIterable<[string, FileSystemHandle]>
  for await (const [name, entry] of iter) {
    if (name.startsWith('.')) continue
    const childPath = `${path}/${name}`
    if (entry.kind === 'directory') {
      const subDir = await readDirEntry(entry as FileSystemDirectoryHandle, childPath)
      children.push(subDir)
    } else {
      fileHandleCache.set(childPath, entry as FileSystemFileHandle)
      children.push({ name, path: childPath, isDirectory: false })
    }
  }

  children.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return { name: handle.name, path, isDirectory: true, children }
}

// 降级方案：通过 <input type="file" webkitdirectory> 选择目录
function openDirectoryFallback(): Promise<FileEntry | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.setAttribute('webkitdirectory', '')
    input.setAttribute('multiple', '')
    input.style.display = 'none'
    document.body.appendChild(input)

    input.onchange = () => {
      document.body.removeChild(input)
      const files = Array.from(input.files ?? [])
      if (files.length === 0) {
        resolve(null)
        return
      }

      // 从 webkitRelativePath 重建目录树
      // 格式: "rootDir/subDir/file.md"
      const rootName = files[0].webkitRelativePath.split('/')[0]
      const nodeMap = new Map<string, FileEntry>()
      const root: FileEntry = { name: rootName, path: rootName, isDirectory: true, children: [] }
      nodeMap.set(rootName, root)

      for (const file of files) {
        const parts = file.webkitRelativePath.split('/')
        // 跳过隐藏文件和目录
        if (parts.some(p => p.startsWith('.'))) continue

        // 确保所有父目录节点存在
        for (let i = 1; i < parts.length - 1; i++) {
          const dirPath = parts.slice(0, i + 1).join('/')
          if (!nodeMap.has(dirPath)) {
            const dirEntry: FileEntry = {
              name: parts[i],
              path: dirPath,
              isDirectory: true,
              children: [],
            }
            nodeMap.set(dirPath, dirEntry)
            const parentPath = parts.slice(0, i).join('/')
            nodeMap.get(parentPath)?.children?.push(dirEntry)
          }
        }

        // 添加文件节点，用 File 对象模拟 FileHandle
        const filePath = file.webkitRelativePath
        const parentPath = parts.slice(0, -1).join('/')
        // 将 File 对象包装成兼容 FileSystemFileHandle 的对象存入缓存
        fileHandleCache.set(filePath, {
          kind: 'file',
          name: file.name,
          getFile: async () => file,
          createWritable: async () => {
            throw new Error('webkitdirectory 模式不支持写入，请使用 Chrome/Edge')
          },
        } as unknown as FileSystemFileHandle)

        nodeMap.get(parentPath)?.children?.push({
          name: file.name,
          path: filePath,
          isDirectory: false,
        })
      }

      // 对每层子节点排序
      function sortChildren(entry: FileEntry) {
        if (!entry.children) return
        entry.children.sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
          return a.name.localeCompare(b.name)
        })
        entry.children.forEach(sortChildren)
      }
      sortChildren(root)

      resolve(root)
    }

    input.oncancel = () => {
      document.body.removeChild(input)
      resolve(null)
    }

    input.click()
  })
}

export const webAdapter: FileSystemAdapter = {
  async openDirectory(): Promise<FileEntry | null> {
    // 优先使用 File System Access API（Chrome/Edge 86+）
    if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' })
        return await readDirEntry(dirHandle, dirHandle.name)
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') return null
        throw e
      }
    }
    // 降级到 <input webkitdirectory>（Firefox/Safari）
    return openDirectoryFallback()
  },

  async readFile(path: string): Promise<string> {
    const handle = fileHandleCache.get(path)
    if (!handle) throw new Error(`文件未找到: ${path}`)
    const file = await handle.getFile()
    return await file.text()
  },

  async writeFile(path: string, content: string): Promise<void> {
    const handle = fileHandleCache.get(path)
    if (!handle) throw new Error(`文件未找到: ${path}`)
    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
  },
}
