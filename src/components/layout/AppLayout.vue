<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 主体区域：侧边栏 + 编辑区 + 大纲 -->
    <div class="flex flex-1 overflow-hidden">
      <!-- 左侧边栏 -->
      <aside
        class="flex-shrink-0 border-r border-gray-200 dark:border-gray-700 overflow-hidden relative"
        :style="{ width: sidebarWidth + 'px' }"
      >
        <FileTree />

        <!-- 拖动手柄 -->
        <div
          class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
          @mousedown="startResizeLeft"
        ></div>
      </aside>

      <!-- 中间：标签栏 + 编辑器 -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <TabBar />
        <EditorContainer class="flex-1 overflow-hidden" />
      </div>

      <!-- 右侧大纲 -->
      <aside
        v-if="showOutline && !outlineCollapsed"
        class="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden relative"
        :style="{ width: outlineWidth + 'px' }"
      >
        <Outline />

        <!-- 拖动手柄 -->
        <div
          class="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-500 transition-colors"
          @mousedown="startResizeRight"
        ></div>
      </aside>

      <!-- 收起状态的大纲按钮 -->
      <div
        v-if="showOutline && outlineCollapsed"
        class="flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center"
        style="width: 32px;"
      >
        <button
          @click="outlineCollapsed = false"
          class="px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 text-base"
          title="展开大纲"
        >
          ☰
        </button>
      </div>
    </div>

    <!-- 状态栏 -->
    <StatusBar />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import FileTree from '@/components/filetree/FileTree.vue'
import TabBar from '@/components/tabs/TabBar.vue'
import EditorContainer from '@/components/editor/EditorContainer.vue'
import Outline from '@/components/outline/Outline.vue'
import StatusBar from './StatusBar.vue'
import { useTabsStore } from '@/stores/tabs.store'

const tabsStore = useTabsStore()

const sidebarWidth = ref(240)
const outlineWidth = ref(240)
const outlineCollapsed = ref(false)
const minWidth = 100
const maxWidth = 600

// 只有当前标签是 .md 文件时才显示大纲
const showOutline = computed(() => {
  const activeTab = tabsStore.activeTab
  return activeTab && activeTab.name.endsWith('.md')
})

let isResizing = false
let startX = 0
let startWidth = 0
let resizeTarget: 'left' | 'right' = 'left'

const startResizeLeft = (e: MouseEvent) => {
  isResizing = true
  resizeTarget = 'left'
  startX = e.clientX
  startWidth = sidebarWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const startResizeRight = (e: MouseEvent) => {
  isResizing = true
  resizeTarget = 'right'
  startX = e.clientX
  startWidth = outlineWidth.value
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing) return

  const delta = e.clientX - startX
  let newWidth: number

  if (resizeTarget === 'left') {
    newWidth = startWidth + delta
  } else {
    // 右侧边栏向左拖动是减小宽度
    newWidth = startWidth - delta
  }

  // 限制宽度范围
  if (newWidth >= minWidth && newWidth <= maxWidth) {
    if (resizeTarget === 'left') {
      sidebarWidth.value = newWidth
    } else {
      outlineWidth.value = newWidth
    }
  }
}

const stopResize = () => {
  isResizing = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''

  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 监听大纲切换事件
const handleToggleOutline = () => {
  outlineCollapsed.value = true
}

onMounted(() => {
  window.addEventListener('toggle-outline', handleToggleOutline)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  window.removeEventListener('toggle-outline', handleToggleOutline)
})
</script>
