# Markdownviewer

基于 Tauri 2 + Vue 3 + Milkdown 的 WYSIWYG Markdown 编辑器，同时支持桌面客户端和 Web 部署。

## 特性

- 📝 **所见即所得** - 类 Typora 的 Markdown 编辑体验
- 🖥️ **双端支持** - 同一套代码，桌面端（Tauri）和 Web 端均可运行
- 📁 **目录管理** - 直接打开本地文件夹，树形展示文件结构
- 🎨 **主题切换** - 内置亮色/暗色主题
- 💾 **自动保存** - 编辑内容实时同步，支持 Ctrl+S 手动保存
- 📑 **多标签页** - 同时打开多个文件，保留编辑历史
- 📤 **导出功能** - 支持导出为 HTML 和 PDF

## 技术栈

- **桌面框架**: Tauri 2.x (Rust)
- **前端**: Vue 3 + TypeScript + Vite
- **编辑器**: Milkdown (基于 ProseMirror)
- **状态管理**: Pinia
- **样式**: Tailwind CSS

## 快速开始

### Web 端

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 `http://localhost:1420`，点击右上角图标切换工作目录。

**浏览器兼容性**:
- Chrome/Edge 86+ - 完整支持（File System Access API，可读写）
- Firefox/Safari - 降级模式（通过 `<input webkitdirectory>` 选择目录，仅可读）

### 桌面端

```bash
# 安装 Rust 工具链（首次运行）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 启动 Tauri 开发模式
npm run tauri dev

# 构建桌面应用
npm run tauri build
```

### 一键安装（推荐）

使用 Makefile 自动编译、安装并创建桌面图标：

```bash
# 完整安装（编译 + 安装到 ~/tools/bin + 创建桌面图标）
make

# 单独执行各步骤
make build      # 仅构建 release 版本
make install    # 仅安装二进制文件到 /home/xiaodong/tools/bin/
make desktop    # 仅创建桌面启动图标

# 清理和卸载
make clean      # 清理构建文件
make uninstall  # 卸载应用和桌面图标
```

安装后可直接从桌面图标启动应用。

## 使用说明

### 打开文件夹

1. 点击左侧边栏右上角的 **切换工作目录** 图标（双向箭头）
2. 选择本地文件夹
3. 文件树会显示该目录下的所有文件（隐藏文件自动过滤）

### 编辑文件

- **Markdown 文件** (`.md`) - 使用 Milkdown 所见即所得编辑器
- **其他文件** - 使用纯文本编辑器（等宽字体）

### 快捷键

- `Ctrl+S` / `Cmd+S` - 保存当前文件
- `Ctrl+Shift+S` / `Cmd+Shift+S` - 保存所有文件
- `Ctrl+W` / `Cmd+W` - 关闭当前标签页

### 导出

点击编辑器工具栏右侧的按钮：
- **HTML** - 导出为独立 HTML 文件（包含样式）
- **PDF** - 调用浏览器打印功能生成 PDF

## 项目结构

```
markdownviewer/
├── src/
│   ├── adapters/          # 文件系统适配层（抹平 Tauri/Web 差异）
│   ├── components/        # Vue 组件
│   ├── composables/       # 组合式函数
│   ├── stores/            # Pinia 状态管理
│   ├── styles/            # 全局样式
│   └── types/             # TypeScript 类型定义
├── src-tauri/             # Rust 后端（Tauri）
│   ├── src/commands/      # Tauri 命令（文件读写）
│   └── capabilities/      # 权限配置
└── dist/                  # 构建输出
```

## 架构亮点

### 文件系统适配层

通过统一接口 `FileSystemAdapter` 抹平平台差异：

- **Tauri 端**: 调用 Rust 命令 (`invoke`) 访问本地文件系统
- **Web 端**:
  - 优先使用 File System Access API（Chrome/Edge）
  - 降级到 `<input webkitdirectory>`（Firefox/Safari）

### 编辑器实例管理

- 每个标签页对应一个 Milkdown 实例
- 切换标签时通过 `display: none` 隐藏 DOM，而非销毁实例
- 保留完整的撤销/重做历史

### 主题系统

- 通过 `document.documentElement.classList` 切换 `dark` class
- CSS 变量 + Tailwind 暗色模式
- 设置持久化到 `localStorage`

## 开发

```bash
# 类型检查
npx vue-tsc --noEmit

# 代码格式化
npm run format

# Rust 格式化
cd src-tauri && cargo fmt
```

## 许可证

MIT
