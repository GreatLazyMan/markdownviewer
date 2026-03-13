<template>
  <div class="flex items-center justify-between px-3 py-1 text-xs border-t border-gray-200 dark:border-gray-700 flex-shrink-0" style="background: var(--statusbar-bg); color: var(--statusbar-text)">
    <div class="flex items-center gap-3">
      <!-- 当前文件路径 -->
      <span v-if="activeTab" class="truncate max-w-xs" :title="activeTab.path">
        {{ activeTab.path }}
      </span>
      <span v-else>就绪</span>
    </div>
    <div class="flex items-center gap-3">
      <!-- 未保存数量 -->
      <span v-if="dirtyCount > 0" class="text-blue-500">
        {{ dirtyCount }} 个未保存
      </span>
      <!-- 主题切换 -->
      <button
        class="hover:text-gray-700 dark:hover:text-gray-200"
        :title="theme === 'dark' ? '切换到亮色' : '切换到暗色'"
        @click="toggleTheme"
      >
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>
      <!-- 运行环境标识 -->
      <span class="opacity-50">{{ isTauri ? 'Desktop' : 'Web' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTabsStore } from '@/stores/tabs.store'
import { useSettingsStore } from '@/stores/settings.store'

const tabsStore = useTabsStore()
const settingsStore = useSettingsStore()

const activeTab = computed(() => tabsStore.activeTab)
const dirtyCount = computed(() => tabsStore.dirtyTabs.length)
const theme = computed(() => settingsStore.theme)
const isTauri = '__TAURI_INTERNALS__' in window

function toggleTheme() {
  settingsStore.toggleTheme()
}
</script>
