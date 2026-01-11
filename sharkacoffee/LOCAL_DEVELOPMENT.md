# Sharka Coffee - 本地开发指南

## ⚠️ 重要：不能直接双击打开 HTML 文件

由于使用了 JSON 数据文件和 fetch API，必须通过 HTTP 服务器运行网站。

## 🚀 快速启动

### 方法 1: 使用启动脚本（推荐）

**Windows:**
```bash
双击运行 start-server.bat
```

**Mac/Linux:**
```bash
chmod +x start-server.sh
./start-server.sh
```

然后在浏览器中访问：
- 首页: http://localhost:8000/index.html
- 产品详情: http://localhost:8000/product-detail.html?id=mg-beancounter

### 方法 2: 手动启动 Python 服务器

在项目目录下运行：

```bash
# Python 3
python -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

### 方法 3: 使用 Node.js (如果安装了)

```bash
# 安装 http-server (一次性)
npm install -g http-server

# 启动服务器
http-server -p 8000
```

### 方法 4: 使用 VS Code

1. 安装 "Live Server" 扩展
2. 右键点击 index.html
3. 选择 "Open with Live Server"

## 🔧 其他错误修复

### 字体文件错误

如果看到字体文件错误，可以忽略或者：
1. 下载对应的字体文件放入 `assets/fonts/calibre/` 目录
2. 或在 CSS 中注释掉字体引用

### jQuery 错误

这些错误通常是因为某些jQuery插件在特定元素不存在时报错，一般不影响主要功能。

## 📝 开发工作流

1. 运行本地服务器 `start-server.bat`
2. 在浏览器中打开 http://localhost:8000
3. 编辑代码后刷新浏览器查看效果
4. 按 Ctrl+C 停止服务器

## 🌐 部署到 GitHub Pages

GitHub Pages 会自动提供 HTTP 服务器，所以部署后不会有这些问题：

```bash
git add .
git commit -m "Update website"
git push origin main
```

然后访问：`https://你的用户名.github.io/sharkacoffee/`

## 💡 提示

- **开发时**: 使用本地服务器 (http://localhost:8000)
- **生产环境**: GitHub Pages 自动处理 (https://...)
- **不要**: 直接双击 HTML 文件 (file://)
