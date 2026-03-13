<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">文档大纲</h3>
      <button
        @click="toggleOutline"
        class="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 text-lg font-bold"
        title="收起大纲"
      >
        ×
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-2 py-2">
      <div v-if="headings.length === 0" class="text-sm text-gray-400 dark:text-gray-600 px-2 py-4">
        暂无标题
      </div>

      <div v-else class="space-y-1">
        <div
          v-for="(heading, index) in headings"
          :key="index"
          :style="{ paddingLeft: (heading.level - 1) * 12 + 'px' }"
          class="text-sm py-1 px-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :class="{
            'text-gray-900 dark:text-gray-100': heading.level <= 2,
            'text-gray-700 dark:text-gray-300': heading.level === 3,
            'text-gray-600 dark:text-gray-400': heading.level >= 4
          }"
          @click="scrollToHeading(heading.id)"
        >
          {{ heading.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTabsStore } from '@/stores/tabs.store'

interface Heading {
  level: number
  text: string
  id: string
}

const tabsStore = useTabsStore()
const headings = ref<Heading[]>([])

// 提取标题
const extractHeadings = () => {
  const activeTab = tabsStore.activeTab
  if (!activeTab || !activeTab.name.endsWith('.md')) {
    headings.value = []
    return
  }

  const content = activeTab.content
  const lines = content.split('\n')
  const result: Heading[] = []
  let inCodeBlock = false

  for (const line of lines) {
    // 检测代码块边界
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }

    // 跳过代码块内的内容
    if (inCodeBlock) {
      continue
    }

    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()

      // 生成 ID（与 useEditor.ts 中的逻辑一致）
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')

      if (id) {
        result.push({ level, text, id })
      }
    }
  }

  headings.value = result
}

// 滚动到指定标题
const scrollToHeading = (id: string) => {
  // 触发自定义事件，让编辑器容器处理滚动
  window.dispatchEvent(new CustomEvent('outline-click', { detail: { id } }))
}

// 切换大纲显示/隐藏
const toggleOutline = () => {
  window.dispatchEvent(new CustomEvent('toggle-outline'))
}

// 监听活动标签和内容变化
watch(() => tabsStore.activeTabId, extractHeadings)
watch(() => tabsStore.activeTab?.content, extractHeadings)

onMounted(() => {
  extractHeadings()
})
</script>
