# i18n 多语言实施指南

## ✅ 已完成的工作

1. **创建了 i18n 配置文件** (`assets/js/i18n.js`)
   - 包含所有中英文翻译
   - 支持嵌套的翻译键（如 `nav.home`）

2. **创建了语言切换脚本** (`assets/js/lang-switcher.js`)
   - 自动检测浏览器语言
   - 使用 localStorage 记住用户选择
   - 动态切换页面语言
   - 自动更新产品链接

3. **重构了 index.html**
   - 所有文本都添加了 `data-i18n` 属性
   - 语言切换按钮改为使用 `data-lang-toggle` 属性
   - 集成了 i18n 脚本

## 🎯 核心优势

✅ **单一HTML文件** - 不再需要维护 index.html 和 index_cn.html 两个文件
✅ **自动语言检测** - 根据浏览器语言自动显示对应语言
✅ **记忆用户偏好** - 使用 localStorage 保存用户选择
✅ **即时切换** - 点击切换按钮立即生效，无需刷新
✅ **SEO友好** - 使用标准的 HTML lang 属性
✅ **易于维护** - 所有翻译集中在一个配置文件

## 📝 如何将此方案应用到其他页面

### 步骤1：在 HTML 的 `<head>` 中添加 i18n 脚本

```html
<!-- 在其他 CSS 后面，</head> 之前添加 -->
<script src="assets/js/i18n.js"></script>
```

### 步骤2：为需要翻译的元素添加 `data-i18n` 属性

```html
<!-- 原来的写法 -->
<h1>Products</h1>
<a href="product.html">MG-BEANCOUNTER</a>

<!-- 新的写法 -->
<h1 data-i18n="nav.products">Products</h1>
<a href="product.html" data-i18n="products.beancounter">MG-BEANCOUNTER</a>
```

### 步骤3：修改语言切换按钮

```html
<!-- 原来的写法 -->
<a href="index_cn.html">>中文<</a>

<!-- 新的写法 -->
<a href="#" data-lang-toggle data-i18n="nav.language">>中文<</a>
```

### 步骤4：在 `</body>` 之前添加语言切换脚本

```html
<!-- 在所有其他脚本之后，</body> 之前添加 -->
<script src="assets/js/lang-switcher.js"></script>
```

## 📄 产品详情页面示例

### 对于 mg_beancounter_details.html 和 mg_beancounter_details_cn.html

你现在可以：
1. 将中文内容添加到 `i18n.js` 中
2. 修改一个 HTML 文件（如 mg_beancounter_details.html）
3. 删除 mg_beancounter_details_cn.html

### 添加产品详情页翻译到 i18n.js

```javascript
// 在 i18n.translations.en 中添加
productDetails: {
  mgBeancounter: {
    title: 'MG-BEANCOUNTER Bean Doser',
    description: '...',
    features: {
      feature1: '...',
      feature2: '...'
    }
  }
}

// 在 i18n.translations.zh 中添加
productDetails: {
  mgBeancounter: {
    title: 'MG-分豆器',
    description: '...',
    features: {
      feature1: '...',
      feature2: '...'
    }
  }
}
```

## 🔧 链接自动更新

语言切换脚本会自动处理产品详情页链接：
- 英文模式：指向 `mg_beancounter_details.html`
- 中文模式：指向 `mg_beancounter_details_cn.html`

如果你将产品详情页也改为单一文件（推荐），则不需要此功能，可以删除 `lang-switcher.js` 中的 `updateProductLinks` 方法。

## 📋 完整的页面迁移清单

对于每个页面：

- [ ] 打开 HTML 文件
- [ ] 在 `<head>` 中添加 `<script src="assets/js/i18n.js"></script>`
- [ ] 为所有需要翻译的文本元素添加 `data-i18n="翻译键"` 属性
- [ ] 将语言切换链接改为 `<a href="#" data-lang-toggle data-i18n="nav.language">`
- [ ] 在 `</body>` 前添加 `<script src="assets/js/lang-switcher.js"></script>`
- [ ] 在 `i18n.js` 中添加对应的翻译内容
- [ ] 测试页面语言切换功能
- [ ] 删除对应的 `_cn.html` 文件

## 🎨 高级用法

### 1. 翻译 HTML 属性（如 placeholder、title）

```html
<input 
  type="text" 
  placeholder="Search" 
  data-i18n="search.placeholder"
  data-i18n-attr="placeholder">
```

### 2. 编程方式切换语言

```javascript
// 获取当前语言
const currentLang = window.langSwitcher.getCurrentLanguage();

// 设置语言
window.langSwitcher.setLanguage('zh'); // 或 'en'

// 监听语言变化事件
document.addEventListener('languageChanged', (e) => {
  console.log('Language changed to:', e.detail.language);
});
```

### 3. 添加新的翻译

在 `assets/js/i18n.js` 的 `translations` 对象中添加：

```javascript
en: {
  newSection: {
    title: 'New Title',
    subtitle: 'New Subtitle'
  }
},
zh: {
  newSection: {
    title: '新标题',
    subtitle: '新副标题'
  }
}
```

然后在 HTML 中使用：

```html
<h1 data-i18n="newSection.title">New Title</h1>
```

## 🚀 下一步建议

1. **逐步迁移**：先完成主要页面（index、产品详情），再处理其他页面
2. **测试兼容性**：在不同浏览器中测试语言切换功能
3. **清理旧文件**：迁移完成后删除所有 `*_cn.html` 文件
4. **更新链接**：确保所有内部链接指向新的单一页面
5. **SEO优化**：考虑添加 `<link rel="alternate" hreflang="..." />` 标签

## 🐛 常见问题

**Q: 页面刷新后语言重置了？**
A: 检查 localStorage 是否被禁用，或者浏览器隐私模式可能阻止存储。

**Q: 某些文本没有翻译？**
A: 检查是否添加了 `data-i18n` 属性，以及翻译键是否在 `i18n.js` 中存在。

**Q: 如何设置默认语言？**
A: 在 `lang-switcher.js` 中修改 `DEFAULT_LANG` 常量。

**Q: 能否支持更多语言？**
A: 可以！在 `i18n.js` 中添加新语言对象（如 `ja`、`ko`），并更新 `SUPPORTED_LANGS` 数组。

## 📞 技术支持

如有问题，请检查浏览器控制台的错误信息。确保：
1. 所有脚本文件路径正确
2. `i18n.js` 在 `lang-switcher.js` 之前加载
3. 翻译键与 HTML 中的 `data-i18n` 属性匹配

---

**当前状态：** ✅ index.html 已完成迁移并可以测试
**建议下一步：** 在浏览器中打开 index.html 测试语言切换功能
