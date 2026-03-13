<template>
  <div class="flex flex-col h-full overflow-hidden">
    <EditorToolbar v-if="activeTab && isMarkdown(activeTab.name)" />

    <!-- 空状态 -->
    <div
      v-if="!activeTab"
      class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600"
    >
      <div class="text-center">
        <p class="text-lg mb-2">打开文件开始编辑</p>
        <p class="text-sm">从左侧文件树选择文件</p>
      </div>
    </div>

    <!-- 编辑器容器 -->
    <div class="flex-1 overflow-hidden relative">
      <template v-for="tab in tabs" :key="tab.id">
        <!-- Markdown 文件：Milkdown 编辑器 -->
        <div
          v-if="isMarkdown(tab.name)"
          v-show="tab.id === activeTabId"
          :ref="el => setEditorRef(tab.id, el as HTMLElement)"
          class="absolute inset-0 overflow-y-auto"
        />
        <!-- 非 Markdown 文件：纯文本 textarea -->
        <textarea
          v-else
          v-show="tab.id === activeTabId"
          class="absolute inset-0 w-full h-full p-6 resize-none outline-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          :value="tab.content"
          @input="tabsStore.updateContent(tab.id, ($event.target as HTMLTextAreaElement).value)"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useTabsStore } from '@/stores/tabs.store'
import { useEditor } from '@/composables/useEditor'
import EditorToolbar from './EditorToolbar.vue'
import '@/styles/editor.css'

const tabsStore = useTabsStore()
const { createEditor, destroyEditor } = useEditor()

const tabs = computed(() => tabsStore.tabs)
const activeTabId = computed(() => tabsStore.activeTabId)
const activeTab = computed(() => tabsStore.activeTab)

function isMarkdown(name: string) {
  return name.endsWith('.md')
}

const editorRefs = new Map<string, HTMLElement>()
const initializedTabs = new Set<string>()

function setEditorRef(tabId: string, el: HTMLElement | null) {
  if (el) editorRefs.set(tabId, el)
  else editorRefs.delete(tabId)
}

async function initEditor(tabId: string) {
  const tab = tabsStore.tabs.find(t => t.id === tabId)
  if (!tab || !isMarkdown(tab.name)) return
  if (initializedTabs.has(tabId)) return
  const el = editorRefs.get(tabId)
  if (!el) return
  initializedTabs.add(tabId)
  await createEditor(tabId, el)
}

watch(tabs, async (newTabs) => {
  for (const tab of newTabs) {
    if (isMarkdown(tab.name) && !initializedTabs.has(tab.id)) {
      await nextTick()
      await initEditor(tab.id)
    }
  }
}, { deep: false })

watch(activeTabId, async (id) => {
  if (!id) return
  await nextTick()
  await initEditor(id)
})

watch(tabs, (newTabs, oldTabs) => {
  if (!oldTabs) return
  const newIds = new Set(newTabs.map(t => t.id))
  for (const tab of oldTabs) {
    if (!newIds.has(tab.id)) {
      destroyEditor(tab.id)
      initializedTabs.delete(tab.id)
      editorRefs.delete(tab.id)
    }
  }
})

onMounted(async () => {
  if (activeTabId.value) {
    await nextTick()
    await initEditor(activeTabId.value)
  }
})

onUnmounted(() => {
  for (const tabId of initializedTabs) {
    destroyEditor(tabId)
  }
  initializedTabs.clear()
})
</script>
