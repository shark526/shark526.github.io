# 产品数据管理系统使用指南

## 🎉 完成的工作

我已经成功将产品详情页面改造为**通用模板 + JSON数据管理**的架构，现在你只需要维护一个 JSON 文件和一个 HTML 模板。

### 创建的文件

1. **[assets/data/products.json](assets/data/products.json)** - 产品数据库
   - 包含所有产品的中英文数据
   - 结构化存储图片、规格、保修等信息

2. **[product-detail.html](product-detail.html)** - 通用产品详情模板
   - 单一模板适用于所有产品
   - 支持中英双语自动切换
   - 根据 URL 参数加载对应产品

3. **[assets/js/product-loader.js](assets/js/product-loader.js)** - 产品加载器
   - 从 JSON 读取产品数据
   - 动态渲染页面内容
   - 自动处理多语言

### 修改的文件

- **[index.html](index.html)** - 更新产品链接使用新的 URL 格式
- **[assets/js/i18n.js](assets/js/i18n.js)** - 添加产品详情页翻译
- **[assets/js/lang-switcher.js](assets/js/lang-switcher.js)** - 简化链接处理逻辑

## 🚀 新的URL格式

产品详情页现在使用统一的 URL 格式：

```
product-detail.html?id=产品ID
```

例如：
- Bean Doser: `product-detail.html?id=mg-beancounter`
- Grinder Scale: `product-detail.html?id=sc-grinder-scale`

## 📝 如何添加新产品

只需要在 `assets/data/products.json` 中添加新产品数据，无需创建新的 HTML 页面！

### 步骤 1: 在 JSON 中添加产品数据

打开 `assets/data/products.json`，按以下格式添加：

```json
{
  "products": {
    "现有产品...",
    
    "new-product-id": {
      "id": "new-product-id",
      "en": {
        "name": "Product Name",
        "shortName": "SHORT-NAME",
        "tagline": "Product tagline",
        "price": "From ¥999.00",
        "description": "Product description...",
        "images": [
          {
            "thumb": "assets/images/shop/product-thumb.webp",
            "full": "assets/images/shop/product-full.webp"
          }
        ],
        "package": [
          "Item 1",
          "Item 2"
        ],
        "note": "Important notes...",
        "specifications": {
          "Model": "Value",
          "Color": "Black / White"
        },
        "shipping": "Shipping information...",
        "warranty": {
          "homeUse": "Warranty text...",
          "commercialUse": "...",
          "accessories": "...",
          "exchanges": "...",
          "shippingReturn": "..."
        },
        "manualUrl": "product_manual.html"
      },
      "zh": {
        "name": "产品名称",
        "shortName": "短名称",
        "tagline": "产品标语",
        "price": "¥999.00起",
        "description": "产品描述...",
        "images": [
          {
            "thumb": "assets/images/shop/product-thumb.webp",
            "full": "assets/images/shop/product-full.webp"
          }
        ],
        "package": [
          "物品 1",
          "物品 2"
        ],
        "note": "重要说明...",
        "specifications": {
          "型号": "值",
          "颜色": "黑色 / 白色"
        },
        "shipping": "配送信息...",
        "warranty": {
          "homeUse": "保修文本...",
          "commercialUse": "...",
          "accessories": "...",
          "exchanges": "...",
          "shippingReturn": "..."
        },
        "manualUrl": "product_manual_cn.html"
      }
    }
  }
}
```

### 步骤 2: 准备产品图片

将产品图片放入 `assets/images/shop/` 目录。

### 步骤 3: 更新导航菜单（可选）

如果想在首页导航中添加新产品链接，编辑 `index.html`：

```html
<li><a href="product-detail.html?id=new-product-id">NEW PRODUCT</a></li>
```

### 步骤 4: 完成！

新产品就可以访问了：`product-detail.html?id=new-product-id`

## 📊 JSON 数据结构说明

### 必需字段

| 字段 | 说明 |
|------|------|
| `id` | 产品唯一标识符（URL参数） |
| `name` | 产品全称 |
| `shortName` | 产品简称（用于菜单） |
| `tagline` | 产品标语 |
| `price` | 价格 |
| `description` | 产品描述 |
| `images` | 图片数组 |
| `specifications` | 规格参数对象 |
| `shipping` | 配送信息 |
| `warranty` | 保修信息对象 |

### 可选字段

| 字段 | 说明 |
|------|------|
| `package` | 包装内容列表 |
| `note` | 重要提示 |
| `manualUrl` | 用户手册链接 |

## 🎨 图片管理

### 图片数组格式

```json
"images": [
  {
    "thumb": "缩略图路径",
    "full": "完整图路径"
  }
]
```

- 支持多张图片
- 第一张图片为默认显示
- 可以使用相同路径（thumb 和 full 相同）

## 🔄 旧页面迁移

### 可以删除的旧文件

完成测试后，可以安全删除：
- `mg_beancounter_details.html`
- `mg_beancounter_details_cn.html`
- `sc_grinder_scale_details.html`
- `sc_grinder_scale_details_cn.html`

### SEO 重定向（可选）

为了保持 SEO，可以在旧页面添加重定向：

```html
<!-- 在 mg_beancounter_details.html 的 <head> 中添加 -->
<meta http-equiv="refresh" content="0;url=product-detail.html?id=mg-beancounter">
```

## 💡 优势总结

### ✅ 维护效率

- **旧方案**: 每个产品 4 个文件（英文版、中文版、重复维护）
- **新方案**: 1 个 JSON + 1 个模板，添加产品只需编辑 JSON

### ✅ 一致性保证

- 所有产品使用相同模板，UI 完全统一
- 修改模板，所有产品页面同时更新

### ✅ 扩展性

- 轻松添加新产品，无需创建新页面
- 可以随时添加新字段到 JSON
- 未来可以添加产品搜索、筛选等功能

### ✅ 多语言支持

- 语言切换完全自动化
- 添加新语言只需在 JSON 中添加对应字段

## 🧪 测试清单

- [ ] 访问 `product-detail.html?id=mg-beancounter` 测试分豆器页面
- [ ] 访问 `product-detail.html?id=sc-grinder-scale` 测试定重秤页面
- [ ] 点击首页导航菜单的产品链接
- [ ] 测试语言切换功能
- [ ] 测试图片切换功能
- [ ] 查看规格参数表格显示
- [ ] 检查保修信息显示

## 🐛 常见问题

**Q: 产品页面显示 "Product not found"？**
A: 检查 URL 参数中的 product ID 是否正确，是否在 JSON 中存在。

**Q: 图片无法显示？**
A: 检查图片路径是否正确，确保图片文件存在。

**Q: 语言切换后内容没变化？**
A: 确保 JSON 中同时包含 `en` 和 `zh` 两个语言版本的数据。

**Q: 如何自定义产品页面样式？**
A: 可以在 `product-detail.html` 中添加特定产品的 CSS 类，或在 `style.css` 中添加自定义样式。

## 📞 下一步

1. **测试新系统**: 在浏览器中打开 `product-detail.html?id=mg-beancounter`
2. **验证功能**: 确保所有功能正常工作
3. **清理旧文件**: 测试通过后删除旧的产品详情页面
4. **添加新产品**: 尝试在 JSON 中添加一个新产品

---

**当前状态**: ✅ 产品数据管理系统已完成
**推荐行动**: 测试新页面，确认无误后可以开始使用新系统
