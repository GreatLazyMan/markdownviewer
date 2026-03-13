<template>
  <AppLayout />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useFileSystem } from '@/composables/useFileSystem'
import { useTabsStore } from '@/stores/tabs.store'

const { saveFile, saveAll } = useFileSystem()
const tabsStore = useTabsStore()

// 全局快捷键处理
async function handleKeydown(e: KeyboardEvent) {
  const ctrl = e.ctrlKey || e.metaKey

  // Ctrl+S 保存当前文件
  if (ctrl && e.key === 's' && !e.shiftKey) {
    e.preventDefault()
    await saveFile()
  }

  // Ctrl+Shift+S 保存所有
  if (ctrl && e.shiftKey && e.key === 'S') {
    e.preventDefault()
    await saveAll()
  }

  // Ctrl+W 关闭当前标签
  if (ctrl && e.key === 'w') {
    e.preventDefault()
    const id = tabsStore.activeTabId
    if (id) {
      const tab = tabsStore.tabs.find(t => t.id === id)
      if (tab?.isDirty) {
        const confirmed = window.confirm(`"${tab.name}" 有未保存的更改，是否保存？`)
        if (confirmed) await saveFile(id)
      }
      tabsStore.closeTab(id)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
