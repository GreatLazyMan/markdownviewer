import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FileEntry } from '@/types/file'
import { fsAdapter } from '@/adapters'

export const useFiletreeStore = defineStore('filetree', () => {
  const root = ref<FileEntry | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 打开目录
  async function openDirectory() {
    isLoading.value = true
    error.value = null
    try {
      const entry = await fsAdapter.openDirectory()
      root.value = entry
    } catch (e: unknown) {
      console.error('openDirectory 失败:', e)
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      isLoading.value = false
    }
  }

  // 清空文件树
  function clear() {
    root.value = null
  }

  return { root, isLoading, error, openDirectory, clear }
})
