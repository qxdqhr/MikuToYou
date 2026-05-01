# Live2D（Cubism 4）在 App 中的加载方式

聊天页使用 **WebView** 注入 HTML，按顺序从 CDN 加载：

1. `live2dcubismcore`（Cubism Core，npm 镜像）
2. `pixi.js` 6.x
3. `pixi-live2d-display` 的 `cubism4` 构建

随后在浏览器环境里执行 `Live2DModel.from(你的 model3.json 地址)`。

## 你需要提供什么

- **完整可访问的 HTTPS 地址**，指向 **`*.model3.json`**（Cubism 4）。
- 模型引用的 `.moc3`、纹理、`.physics3.json` 等需与 JSON 内**相对路径**一致，且同样可被下载。
- 资源服务器需允许 **跨域（CORS）**，否则 WebView 内纹理请求会失败。

## 快速联调

设置页可一键填入 **Haru 演示 model3**（来自 `pixi-live2d-display` 测试资源，仅建议用于验证集成）。

常量定义见：`src/components/chat/live2dViewer.ts` 中的 `DEMO_MODEL3_URL`。

## 许可说明

- Cubism Core 与 Live2D 素材请遵守 [Live2D 相关许可](https://www.live2d.com/eula/)。
- 正式产品请使用你有权使用的模型与运行时分发方式。
