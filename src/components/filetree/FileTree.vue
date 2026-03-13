<template>
  <div class="flex flex-col h-full overflow-hidden" style="background: var(--sidebar-bg)">
    <!-- 顶部操作栏 -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
      <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {{ root?.name ?? '文件' }}
      </span>
      <button
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded text-lg"
        title="切换工作目录"
        @click="handleOpenDirectory"
      >
        📁
      </button>
    </div>

    <!-- 文件树内容 -->
    <div class="flex-1 overflow-y-auto py-1">
      <!-- 加载中 -->
      <div v-if="isLoading" class="px-4 py-2 text-sm text-gray-400">加载中...</div>

      <!-- 错误提示 -->
      <div v-else-if="error" class="px-4 py-2 text-sm text-red-500">{{ error }}</div>

      <!-- 空状态 -->
      <div v-else-if="!root" class="px-4 py-8 text-center text-sm text-gray-400">
        <p>点击右上角图标</p>
        <p>切换工作目录</p>
      </div>

      <!-- 文件树 -->
      <template v-else>
        <FileTreeNode
          v-for="child in root.children"
          :key="child.path"
          :entry="child"
          :depth="0"
          :active-path="activePath"
          @open-file="handleOpenFile"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFiletreeStore } from '@/stores/filetree.store'
import { useTabsStore } from '@/stores/tabs.store'
import { useFileSystem } from '@/composables/useFileSystem'
import type { FileEntry } from '@/types/file'
import FileTreeNode from './FileTreeNode.vue'

const filetreeStore = useFiletreeStore()
const tabsStore = useTabsStore()
const { openDirectory, openFile } = useFileSystem()

const root = computed(() => filetreeStore.root)
const isLoading = computed(() => filetreeStore.isLoading)
const error = computed(() => filetreeStore.error)
const activePath = computed(() => tabsStore.activeTab?.path ?? null)

async function handleOpenDirectory() {
  await openDirectory()
}

async function handleOpenFile(entry: FileEntry) {
  await openFile(entry.path, entry.name)
}
</script>
