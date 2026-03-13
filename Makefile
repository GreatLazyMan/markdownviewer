.PHONY: all build install desktop clean

# 变量定义
APP_NAME = markdownviewer
BIN_DIR = /home/xiaodong/tools/bin
DESKTOP_DIR = $(HOME)/Desktop
DESKTOP_FILE = $(APP_NAME).desktop
BUILD_DIR = src-tauri/target/release

all: build install desktop

# 构建 Tauri 应用
build:
	@echo "正在构建 Tauri 应用..."
	npm run tauri build

# 安装二进制文件
install:
	@echo "正在安装二进制文件到 $(BIN_DIR)..."
	@mkdir -p $(BIN_DIR)
	@if [ -f "$(BUILD_DIR)/$(APP_NAME)" ]; then \
		cp $(BUILD_DIR)/$(APP_NAME) $(BIN_DIR)/; \
		chmod +x $(BIN_DIR)/$(APP_NAME); \
		echo "安装成功: $(BIN_DIR)/$(APP_NAME)"; \
	else \
		echo "错误: 找不到编译后的二进制文件"; \
		exit 1; \
	fi

# 创建桌面图标
desktop:
	@echo "正在创建桌面图标..."
	@echo "[Desktop Entry]" > $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Version=1.0" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Type=Application" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Name=Markdownviewer" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Comment=WYSIWYG Markdown 编辑器" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Exec=$(BIN_DIR)/$(APP_NAME)" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Icon=$(shell pwd)/src-tauri/icons/icon.png" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Terminal=false" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "Categories=Utility;TextEditor;" >> $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@chmod +x $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@gio set $(DESKTOP_DIR)/$(DESKTOP_FILE) metadata::trusted true 2>/dev/null || true
	@echo "桌面图标创建成功: $(DESKTOP_DIR)/$(DESKTOP_FILE)"

# 清理构建文件
clean:
	@echo "正在清理构建文件..."
	npm run tauri clean
	@rm -f $(BIN_DIR)/$(APP_NAME)
	@rm -f $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "清理完成"

# 卸载
uninstall:
	@echo "正在卸载..."
	@rm -f $(BIN_DIR)/$(APP_NAME)
	@rm -f $(DESKTOP_DIR)/$(DESKTOP_FILE)
	@echo "卸载完成"
