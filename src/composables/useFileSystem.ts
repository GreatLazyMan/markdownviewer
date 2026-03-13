import { fsAdapter } from '@/adapters'
import { useTabsStore } from '@/stores/tabs.store'
import { useFiletreeStore } from '@/stores/filetree.store'
import { useSettingsStore } from '@/stores/settings.store'

export function useFileSystem() {
  const tabsStore = useTabsStore()
  const filetreeStore = useFiletreeStore()
  const settingsStore = useSettingsStore()

  // 打开目录
  async function openDirectory() {
    await filetreeStore.openDirectory()
    if (filetreeStore.root) {
      settingsStore.setLastDirectory(filetreeStore.root.path)
    }
  }

  // 打开文件到标签页
  async function openFile(path: string, name: string) {
    // 如果已打开，直接激活
    const existing = tabsStore.tabs.find(t => t.path === path)
    if (existing) {
      tabsStore.setActiveTab(existing.id)
      return
    }
    const content = await fsAdapter.readFile(path)
    tabsStore.openTab(path, name, content)
  }

  // 保存当前标签页
  async function saveFile(tabId?: string) {
    const id = tabId ?? tabsStore.activeTabId
    if (!id) return
    const tab = tabsStore.tabs.find(t => t.id === id)
    if (!tab || !tab.isDirty) return
    await fsAdapter.writeFile(tab.path, tab.content)
    tabsStore.markSaved(id)
  }

  // 保存所有未保存标签页
  async function saveAll() {
    for (const tab of tabsStore.dirtyTabs) {
      await fsAdapter.writeFile(tab.path, tab.content)
      tabsStore.markSaved(tab.id)
    }
  }

  return { openDirectory, openFile, saveFile, saveAll }
}
