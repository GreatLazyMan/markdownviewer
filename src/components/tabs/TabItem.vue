<template>
  <div
    class="flex items-center gap-1.5 px-3 py-1.5 border-r border-gray-200 dark:border-gray-700 cursor-pointer select-none text-sm max-w-[180px] group flex-shrink-0"
    :class="[
      isActive
        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        : 'bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
    ]"
    @click="$emit('activate')"
  >
    <!-- 未保存状态圆点 -->
    <span
      v-if="tab.isDirty"
      class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"
      title="未保存"
    />

    <!-- 文件名 -->
    <span class="truncate flex-1">{{ tab.name }}</span>

    <!-- 关闭按钮 -->
    <button
      class="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      :class="{ 'opacity-100': tab.isDirty }"
      title="关闭"
      @click.stop="$emit('close')"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Tab } from '@/types/tab'

defineProps<{
  tab: Tab
  isActive: boolean
}>()

defineEmits<{
  activate: []
  close: []
}>()
</script>
