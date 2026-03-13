import { useTabsStore } from '@/stores/tabs.store'

export function useExport() {
  const tabsStore = useTabsStore()

  // 导出为 HTML
  function exportHTML() {
    const tab = tabsStore.activeTab
    if (!tab) return

    const editorEl = document.querySelector('.milkdown .editor')
    if (!editorEl) return

    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules).map(r => r.cssText).join('\n')
        } catch {
          return ''
        }
      })
      .join('\n')

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>${tab.name}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="milkdown"><div class="editor">${editorEl.innerHTML}</div></div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tab.name.replace(/\.md$/, '') + '.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 导出为 PDF（使用浏览器打印）
  function exportPDF() {
    window.print()
  }

  return { exportHTML, exportPDF }
}
