# 修复列表区域黑色覆盖层问题

## 问题描述

在 Milkdown 编辑器中打开 Markdown 文档时，有序列表（`<ol>`）的 padding 区域出现完全不透明的黑色覆盖层，遮挡部分文本内容。

**症状特征**：
- 黑色覆盖层出现在列表的左侧 padding 区域
- 覆盖层完全不透明
- 选中文本时，黑色区域会部分消失
- 问题稳定复现于特定文档区域（如 3.6 节的有序列表）

## 根本原因

Milkdown/ProseMirror 在渲染列表时，会在 `<ul>` 和 `<ol>` 元素上添加装饰性的伪元素（`::before` 或 `::after`），这些伪元素在某些情况下会显示为黑色覆盖层。

## 排查过程

### 1. 初步排查 - 背景色问题

**尝试**：检查是否为 `backgroundColor` 导致
```javascript
document.querySelectorAll('*').forEach(el => {
  const bg = window.getComputedStyle(el).backgroundColor;
  if (bg === 'rgb(0, 0, 0)' || bg === 'rgba(0, 0, 0, 1)') {
    el.style.backgroundColor = 'transparent';
  }
});
```

**结果**：黑色覆盖层未消失，排除 `backgroundColor` 原因

### 2. 定位问题元素

**方法**：
1. 打开浏览器开发者工具（F12）
2. 点击"选择元素"图标（左上角箭头）
3. 点击黑色覆盖区域
4. 观察 Elements 面板中高亮的元素

**发现**：黑色覆盖出现在列表的 padding 区域，而非列表项内容本身

### 3. 分析可能原因

根据"覆盖在 padding 区域"的特征，推测可能原因：
- 列表元素的伪元素（`::before`, `::after`）
- 绝对定位的装饰元素
- z-index 层级问题

### 4. 验证伪元素假设

**检查 CSS**：
```css
/* 检查是否存在伪元素 */
.milkdown .editor ul::before,
.milkdown .editor ul::after,
.milkdown .editor ol::before,
.milkdown .editor ol::after
```

**结论**：Milkdown 确实在列表元素上添加了伪元素

## 解决方案

### 修改文件：`src/styles/editor.css`

```css
/* 移除列表的伪元素覆盖 */
.milkdown .editor ul::before,
.milkdown .editor ul::after,
.milkdown .editor ol::before,
.milkdown .editor ol::after {
  display: none !important;
  content: none !important;
}

/* 确保列表项内容可见 */
.milkdown .editor li > * {
  position: relative !important;
  z-index: 1 !important;
  background-color: transparent !important;
}

/* 强制列表背景透明 */
.milkdown .editor ul,
.milkdown .editor ol,
.milkdown .editor li {
  background-color: transparent !important;
  position: relative !important;
}
```

### 关键点说明

1. **移除伪元素**：使用 `display: none` 和 `content: none` 双重保险
2. **调整 z-index**：确保列表项内容在最上层（`z-index: 1`）
3. **强制透明**：对所有列表相关元素强制设置透明背景

## 正确的排查流程总结

当遇到类似的"神秘黑色覆盖层"问题时，应按以下顺序排查：

### 第一步：确认问题特征
- [ ] 覆盖层是否完全不透明？
- [ ] 覆盖层出现在哪个区域（内容区/padding 区/margin 区）？
- [ ] 选中文本时覆盖层是否变化？
- [ ] 问题是否稳定复现？

### 第二步：排除常见原因
```javascript
// 1. 检查 backgroundColor
document.querySelectorAll('*').forEach(el => {
  const bg = window.getComputedStyle(el).backgroundColor;
  if (bg === 'rgb(0, 0, 0)' || bg === 'rgba(0, 0, 0, 1)') {
    console.log('Found black background:', el);
  }
});

// 2. 检查其他可能的黑色来源
document.querySelectorAll('*').forEach(el => {
  const style = window.getComputedStyle(el);
  if (style.background.includes('black') ||
      style.boxShadow.includes('0, 0, 0') ||
      style.filter.includes('brightness(0)')) {
    console.log('Found black styling:', el);
  }
});
```

### 第三步：使用开发者工具定位
1. F12 打开开发者工具
2. 点击"选择元素"图标
3. 点击黑色区域
4. 查看 Elements 面板中的元素结构
5. 查看 Styles 面板中的 CSS 规则
6. **重点检查伪元素**（`::before`, `::after`, `::marker`）

### 第四步：针对性修复
根据定位结果：
- 如果是伪元素：使用 `display: none` 或 `content: none`
- 如果是层级问题：调整 `z-index`
- 如果是背景色：强制设置 `background-color: transparent !important`

## 经验教训

1. **不要忽视伪元素**：CSS 伪元素（`::before`, `::after`）是常见的"隐形"问题源
2. **padding 区域的覆盖通常是伪元素**：当覆盖层出现在 padding 而非内容区时，优先检查伪元素
3. **使用 !important 谨慎但必要**：在覆盖第三方库样式时，`!important` 是有效手段
4. **层级问题用 z-index 解决**：确保内容在最上层显示

## 相关文件

- `src/styles/editor.css` - 编辑器样式文件
- `src/components/editor/EditorContainer.vue` - 编辑器容器组件
- `src/composables/useEditor.ts` - 编辑器逻辑

## 测试验证

修复后，测试以下场景：
- [x] 打开包含有序列表的 Markdown 文档
- [x] 检查列表 padding 区域是否有黑色覆盖
- [x] 选中列表文本，确认显示正常
- [x] 切换深色/浅色主题，确认无异常

## 参考资料

- [ProseMirror 文档](https://prosemirror.net/)
- [Milkdown 文档](https://milkdown.dev/)
- [CSS 伪元素规范](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-elements)
