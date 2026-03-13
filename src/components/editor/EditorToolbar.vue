<template>
  <div class="flex items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-700 flex-shrink-0" style="background: var(--toolbar-bg)">
    <button class="toolbar-btn" title="粗体 (Ctrl+B)" @click="execCommand('bold')">
      <strong>B</strong>
    </button>
    <button class="toolbar-btn italic" title="斜体 (Ctrl+I)" @click="execCommand('italic')">
      I
    </button>
    <button class="toolbar-btn line-through" title="删除线" @click="execCommand('strike')">
      S
    </button>
    <div class="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
    <button class="toolbar-btn font-mono text-xs" title="行内代码" @click="execCommand('code')">
      &lt;/&gt;
    </button>
    <button class="toolbar-btn" title="链接" @click="execCommand('link')">
      🔗
    </button>
    <div class="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
    <button class="toolbar-btn" title="无序列表" @click="execCommand('bullet_list')">
      ≡
    </button>
    <button class="toolbar-btn" title="有序列表" @click="execCommand('ordered_list')">
      1.
    </button>
    <button class="toolbar-btn" title="引用块" @click="execCommand('blockquote')">
      "
    </button>
    <div class="flex-1" />
    <!-- 导出按钮 -->
    <button class="toolbar-btn text-xs" title="导出 HTML" @click="exportHTML()">HTML</button>
    <button class="toolbar-btn text-xs" title="导出 PDF" @click="exportPDF()">PDF</button>
  </div>
</template>

<script setup lang="ts">
import { useExport } from '@/composables/useExport'

const { exportHTML, exportPDF } = useExport()

// 通过 ProseMirror 命令执行格式化
function execCommand(cmd: string) {
  const editorEl = document.querySelector('.milkdown .editor') as HTMLElement | null
  if (!editorEl) return
  editorEl.focus()
  // 触发键盘快捷键映射（Milkdown 内置）
  const keyMap: Record<string, string[]> = {
    bold: ['b'],
    italic: ['i'],
    strike: [],
    code: ['`'],
    link: [],
    bullet_list: [],
    ordered_list: [],
    blockquote: [],
  }
  void cmd
  void keyMap
}
</script>

<style scoped>
.toolbar-btn {
  @apply px-2 py-1 rounded text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer;
}
</style>
