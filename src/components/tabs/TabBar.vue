<template>
  <div
    class="flex items-center overflow-x-auto border-b border-gray-200 dark:border-gray-700 flex-shrink-0"
    style="background: var(--tab-bg)"
  >
    <TabItem
      v-for="tab in tabs"
      :key="tab.id"
      :tab="tab"
      :is-active="tab.id === activeTabId"
      @activate="tabsStore.setActiveTab(tab.id)"
      @close="handleClose(tab.id)"
    />
    <!-- 空白填充区 -->
    <div class="flex-1 h-full min-h-[36px]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTabsStore } from '@/stores/tabs.store'
import { useFileSystem } from '@/composables/useFileSystem'
import TabItem from './TabItem.vue'

const tabsStore = useTabsStore()
const { saveFile } = useFileSystem()

const tabs = computed(() => tabsStore.tabs)
const activeTabId = computed(() => tabsStore.activeTabId)

async function handleClose(id: string) {
  const tab = tabsStore.tabs.find(t => t.id === id)
  if (tab?.isDirty) {
    const confirmed = window.confirm(`"${tab.name}" 有未保存的更改，是否保存？`)
    if (confirmed) await saveFile(id)
  }
  tabsStore.closeTab(id)
}
</script>
