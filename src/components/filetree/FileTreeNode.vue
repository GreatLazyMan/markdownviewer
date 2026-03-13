<template>
  <!-- 递归文件树节点 -->
  <div class="file-tree-node">
    <div
      class="flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer select-none text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      :class="{ 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300': isActive }"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="handleClick"
    >
      <!-- 目录展开/折叠图标 -->
      <span v-if="entry.isDirectory" class="text-gray-400 w-4 flex-shrink-0">
        {{ isOpen ? '▾' : '▸' }}
      </span>
      <!-- 文件图标占位 -->
      <span v-else class="w-4 flex-shrink-0 text-gray-400">·</span>

      <!-- 文件/目录名 -->
      <span class="truncate">{{ entry.name }}</span>
    </div>

    <!-- 子节点（目录展开时显示） -->
    <template v-if="entry.isDirectory && isOpen && entry.children">
      <FileTreeNode
        v-for="child in entry.children"
        :key="child.path"
        :entry="child"
        :depth="depth + 1"
        :active-path="activePath"
        @open-file="$emit('open-file', $event)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FileEntry } from '@/types/file'

const props = defineProps<{
  entry: FileEntry
  depth: number
  activePath: string | null
}>()

const emit = defineEmits<{
  'open-file': [entry: FileEntry]
}>()

const isOpen = ref(false)

const isActive = computed(
  () => !props.entry.isDirectory && props.entry.path === props.activePath
)

function handleClick() {
  if (props.entry.isDirectory) {
    isOpen.value = !isOpen.value
  } else {
    emit('open-file', props.entry)
  }
}
</script>
