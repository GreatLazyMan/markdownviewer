import { tauriAdapter } from './tauri.adapter'
import { webAdapter } from './web.adapter'
import type { FileSystemAdapter } from './types'

// Tauri 2.x 官方推荐的环境检测方式
const isTauri = '__TAURI_INTERNALS__' in window

export const fsAdapter: FileSystemAdapter = isTauri ? tauriAdapter : webAdapter

export type { FileSystemAdapter }
