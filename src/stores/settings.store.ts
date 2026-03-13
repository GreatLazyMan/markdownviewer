import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

type Theme = 'light' | 'dark'

export const useSettingsStore = defineStore('settings', () => {
  // 从 localStorage 恢复主题
  const savedTheme = localStorage.getItem('theme') as Theme | null
  const theme = ref<Theme>(savedTheme ?? 'light')

  // 上次打开的目录路径
  const lastDirectory = ref<string | null>(
    localStorage.getItem('lastDirectory')
  )

  // 监听主题变化，同步到 DOM 和 localStorage
  watch(theme, (val) => {
    document.documentElement.classList.toggle('dark', val === 'dark')
    localStorage.setItem('theme', val)
  }, { immediate: true })

  // 监听目录变化，持久化
  watch(lastDirectory, (val) => {
    if (val) localStorage.setItem('lastDirectory', val)
    else localStorage.removeItem('lastDirectory')
  })

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setLastDirectory(path: string) {
    lastDirectory.value = path
  }

  return { theme, lastDirectory, toggleTheme, setLastDirectory }
})
