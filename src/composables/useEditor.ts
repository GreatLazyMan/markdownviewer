import { ref, onUnmounted } from 'vue'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { history } from '@milkdown/plugin-history'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { useTabsStore } from '@/stores/tabs.store'

// Tauri 环境检测
const isTauri = '__TAURI_INTERNALS__' in window

// 每个标签页对应一个编辑器实例
const editorInstances = new Map<string, Editor>()

export function useEditor() {
  const tabsStore = useTabsStore()
  const isCreating = ref(false)

  // 为指定标签创建编辑器实例，挂载到 DOM 元素
  async function createEditor(tabId: string, el: HTMLElement): Promise<Editor> {
    // 如果已存在实例，先销毁
    const existing = editorInstances.get(tabId)
    if (existing) {
      await existing.destroy()
      editorInstances.delete(tabId)
    }

    const tab = tabsStore.tabs.find(t => t.id === tabId)
    if (!tab) throw new Error(`标签页不存在: ${tabId}`)

    // 获取文件所在目录（用于解析相对路径）
    const fileDir = tab.path.substring(0, tab.path.lastIndexOf('/'))

    isCreating.value = true
    try {
      const editor = await Editor.make()
        .config(ctx => {
          ctx.set(rootCtx, el)
          ctx.set(defaultValueCtx, tab.content)
          // 监听内容变化
          ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
            tabsStore.updateContent(tabId, markdown)
          })
        })
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener)
        .create()

      // 图片路径处理函数
      const processImages = async () => {
        const images = el.querySelectorAll('img')

        images.forEach(async (img) => {
          const src = img.getAttribute('src')
          if (!src || src.startsWith('http') || src.startsWith('data:') || src.startsWith('asset://') || src.startsWith('https://asset.localhost')) {
            return
          }

          // 解析相对路径为绝对路径
          let absolutePath = src
          if (!src.startsWith('/')) {
            // 处理 ./ 和 ../
            const parts = src.split('/')
            const dirParts = fileDir.split('/')

            for (const part of parts) {
              if (part === '..') {
                dirParts.pop()
              } else if (part !== '.') {
                dirParts.push(part)
              }
            }
            absolutePath = dirParts.join('/')
          }

          console.log('图片路径转换:', src, '->', absolutePath)

          // Tauri 环境使用 convertFileSrc
          if (isTauri) {
            try {
              const { convertFileSrc } = await import('@tauri-apps/api/core')
              const assetUrl = convertFileSrc(absolutePath)
              console.log('convertFileSrc 输出:', assetUrl)
              img.src = assetUrl
            } catch (e) {
              console.error('convertFileSrc 失败:', e)
              // 降级：手动构建 asset URL
              img.src = `https://asset.localhost${absolutePath}`
              console.log('使用降级 URL:', img.src)
            }
          } else {
            // Web 环境提示
            img.alt = `${img.alt || src} (Web 模式无法显示本地图片)`
            img.style.border = '2px dashed #ccc'
          }
        })
      }

      // 为标题添加 ID（用于锚点跳转）
      const processHeadings = () => {
        const headings = el.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach(heading => {
          const h = heading as HTMLElement
          const text = h.textContent || ''

          // 生成 ID：移除所有标点符号（包括中文标点）、转小写、空格转连字符
          const id = text
            .toLowerCase()
            .replace(/[^\w\u4e00-\u9fa5\s]/g, '') // 只保留字母、数字、中文、空格
            .trim()
            .replace(/\s+/g, '-')

          if (id) {
            h.id = id
            // 添加平滑滚动样式
            h.style.scrollMarginTop = '20px'
          }
        })
      }

      // 不使用 MutationObserver，只在初始化时处理一次
      setTimeout(() => {
        processHeadings()
      }, 500)

      // 处理锚点链接点击（在滚动容器内滚动）
      const handleAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')

        // 只处理锚点链接，其他点击不干预
        if (!link) return

        const href = link.getAttribute('href')
        if (!href || !href.startsWith('#')) return

        // 只有确认是锚点链接才阻止默认行为
        e.preventDefault()
        const id = href.substring(1)

        scrollToHeadingById(id)
      }

      // 滚动到指定 ID 的标题
      const scrollToHeadingById = (id: string) => {
        // 先尝试精确匹配
        let targetElement = el.querySelector(`[id="${id}"]`)

        // 如果找不到，尝试模糊匹配（移除标点符号后比较）
        if (!targetElement) {
          const normalizeId = (str: string) => str.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '')
          const normalizedSearchId = normalizeId(id)

          const allHeadings = el.querySelectorAll('h1, h2, h3, h4, h5, h6')
          for (const heading of allHeadings) {
            const h = heading as HTMLElement
            const headingId = h.id
            const headingText = h.textContent || ''

            // 比较 ID 或文本内容（都移除标点符号）
            if (normalizeId(headingId) === normalizedSearchId ||
                normalizeId(headingText) === normalizedSearchId) {
              targetElement = h
              break
            }
          }
        }

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }

      // 监听来自大纲的点击事件
      const handleOutlineClick = (e: Event) => {
        const customEvent = e as CustomEvent
        const id = customEvent.detail?.id
        if (id) {
          scrollToHeadingById(id)
        }
      }

      window.addEventListener('outline-click', handleOutlineClick)

      // 恢复点击事件监听器以支持锚点跳转
      el.addEventListener('click', handleAnchorClick, false)

      // 不使用 MutationObserver，只在初始化时处理一次图片
      setTimeout(() => {
        processImages()
      }, 500)

      editorInstances.set(tabId, editor)
      return editor
    } finally {
      isCreating.value = false
    }
  }

  // 销毁指定标签的编辑器实例
  async function destroyEditor(tabId: string) {
    const editor = editorInstances.get(tabId)
    if (editor) {
      await editor.destroy()
      editorInstances.delete(tabId)
    }
  }

  // 获取实例（用于工具栏命令）
  function getEditor(tabId: string): Editor | undefined {
    return editorInstances.get(tabId)
  }

  // 组件卸载时清理所有实例
  onUnmounted(async () => {
    for (const [id, editor] of editorInstances) {
      await editor.destroy()
      editorInstances.delete(id)
    }
  })

  return { createEditor, destroyEditor, getEditor, isCreating }
}
