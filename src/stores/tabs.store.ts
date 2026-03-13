import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { nanoid } from 'nanoid'
import type { Tab } from '@/types/tab'

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([])
  const activeTabId = ref<string | null>(null)

  const activeTab = computed(() =>
    tabs.value.find(t => t.id === activeTabId.value) ?? null
  )

  const dirtyTabs = computed(() =>
    tabs.value.filter(t => t.isDirty)
  )

  // 打开或激活标签页
  function openTab(path: string, name: string, content: string) {
    const existing = tabs.value.find(t => t.path === path)
    if (existing) {
      activeTabId.value = existing.id
      return existing
    }
    const tab: Tab = {
      id: nanoid(),
      path,
      name,
      content,
      savedContent: content,
      isDirty: false,
    }
    tabs.value.push(tab)
    activeTabId.value = tab.id
    return tab
  }

  // 更新标签内容（编辑器回调）
  function updateContent(id: string, content: string) {
    const tab = tabs.value.find(t => t.id === id)
    if (!tab) return
    tab.content = content
    tab.isDirty = content !== tab.savedContent
  }

  // 标记已保存
  function markSaved(id: string) {
    const tab = tabs.value.find(t => t.id === id)
    if (!tab) return
    tab.savedContent = tab.content
    tab.isDirty = false
  }

  // 关闭标签页
  function closeTab(id: string) {
    const idx = tabs.value.findIndex(t => t.id === id)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    // 激活相邻标签
    if (activeTabId.value === id) {
      const next = tabs.value[idx] ?? tabs.value[idx - 1]
      activeTabId.value = next?.id ?? null
    }
  }

  // 激活标签
  function setActiveTab(id: string) {
    activeTabId.value = id
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    dirtyTabs,
    openTab,
    updateContent,
    markSaved,
    closeTab,
    setActiveTab,
  }
})
