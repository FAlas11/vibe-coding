# 平面记账

极简的个人支出记账工具。花完钱的那一刻，用手机花 5 秒钟把它记下来。

- **数据只存在你自己的设备上。** 没有服务器、没有账号、没有登录，账目不会上传到任何地方。
- 人民币记账，精确到分。
- 12 个大类、99 个小类，两级分类。
- 手机优先，可以「添加到主屏幕」，像 App 一样用，**离线也能记账**。

产品设计见 [产品设计文档.md](产品设计文档.md)，工作准则见 [CLAUDE.md](CLAUDE.md)。

---

## 一、怎么在电脑上打开

在项目目录下执行：

```bash
npm install       # 第一次才需要，装依赖
npm run dev       # 启动开发模式
```

浏览器会提示一个网址（通常是 http://localhost:5173/），打开它就能用了。

> 改代码后页面会自动刷新。这个模式适合开发时看效果。

## 二、怎么打包和预览正式版本

```bash
npm run build     # 打包成可以发布的文件（生成到 dist 目录）
npm run preview   # 预览打包结果
```

> ⚠️ **「添加到主屏幕」和「离线可用」这两个功能，只有打包版才生效。**
> 用 `npm run dev` 测试这两个功能一定会失败，这是最容易误判成「功能坏了」的地方。

想在手机上试，用这个命令启动，然后用手机连同一个 WiFi 打开提示的 Network 网址：

```bash
npm run preview -- --host
```

## 三、怎么跑测试

```bash
npm test
```

测试覆盖的是「错了你也看不出来」的部分：金额换算、日期边界、分类表完整性、备份文件校验，以及界面能否正常渲染。

---

## 四、怎么备份和恢复数据（最重要的一节）

**数据只存在你这台设备的浏览器里。换手机、清除浏览器数据、卸载浏览器，都会让账目消失。导出的备份文件是唯一的保险。**

### 备份

打开 App → 点右上角「备份」→ 点「导出备份」。

会下载一个文件，名字像 `平面记账-备份-2026-09-17.json`。**把它存到网盘、微信收藏或发给自己**，不要只留在手机的下载目录里。

App 会在超过 30 天没备份时提醒你一次。

### 恢复

1. 把备份文件传到新手机上
2. 打开 App → 点右上角「备份」→ 点「从备份文件恢复」
3. 选择那个文件
4. App 会告诉你「文件里有 N 条记录，当前设备有 M 条」，然后让你选：
   - **完全覆盖** —— 换手机恢复时选这个（会二次确认，因为不可撤销）
   - **合并进来** —— 怕漏了旧记录时选这个

如果文件损坏或是别的 App 的文件，App 会明确指出问题并**拒绝导入**，你现有的数据不会受任何影响。

### 备份文件长什么样

就是普通文本，用记事本打开就能看懂每一笔花在哪：

```json
{
  "app": "pingmian-jizhang",
  "schemaVersion": 1,
  "categories": [
    { "id": "food", "name": "餐饮", "parentId": null, "sortOrder": 10 },
    { "id": "food.takeout", "name": "外卖", "parentId": "food", "sortOrder": 50 }
  ],
  "expenses": [
    {
      "id": "3f2a...",
      "amountCents": 2350,
      "categoryId": "food",
      "subcategoryId": "food.takeout",
      "note": "午饭 麻辣烫",
      "date": "2026-09-17"
    }
  ]
}
```

金额存的是「分」，所以 `2350` 就是 ¥23.50。

---

## 五、怎么部署到网上（让手机随时能打开）

手机想在外面记账，就需要一个网址。用 GitHub Pages 免费托管：

1. 注册 GitHub 账号（邮箱即可，免费）
2. 建一个仓库，名字例如 `pingmian-jizhang`
3. 把代码推上去
4. 仓库 Settings → Pages → Source 选 "GitHub Actions"
5. 之后每次推送，自动构建并发布

构建时要指定仓库子路径：

```bash
VITE_BASE=/pingmian-jizhang/ npm run build
```

发布后的网址是 `https://<你的用户名>.github.io/pingmian-jizhang/`，手机浏览器打开后「添加到主屏幕」即可。

> 必须走 HTTPS（GitHub Pages 自动提供）。Service Worker 在 `file://` 下不工作，所以不能靠双击 HTML 文件来用离线功能。

---

## 六、必须知道的几个坑

1. **iPhone 上，「Safari 里打开的网页」和「添加到主屏幕的 App」存储是分开的，两边数据不互通。**
   请从一开始就固定用其中一种方式记账。换方式之前先导出备份。

2. **微信内置浏览器不能「添加到主屏幕」，清理微信缓存也可能清掉数据。**
   请用 Safari、Chrome 或系统自带浏览器打开。

3. **清除浏览器数据 = 清空记账数据。** 导出备份是唯一的救命手段。

4. **`npm run dev` 模式下离线功能不生效**，必须用 `npm run build` + `npm run preview` 验证。

5. **别在 `file://` 下打开 `dist/index.html`。** Service Worker 需要 HTTPS 或 localhost。

---

## 七、项目结构

```
根目录/
├─ CLAUDE.md              工作准则、决策记录、数据模型约定
├─ 产品设计文档.md         完整产品设计（功能、分类表、界面、验收标准）
├─ 实施计划.md             分任务实施计划
├─ 生成图标.py             生成手机主屏图标的一次性脚本
├─ index.html             页面外壳
├─ vite.config.ts         Vite + Tailwind + PWA + 测试 配置
├─ public/                主屏图标
└─ src/
   ├─ types.ts            全部类型定义
   ├─ categories.ts       12 大类 99 小类分类表
   ├─ money.ts            金额「分 ↔ 元」换算（金额准确性的关键）
   ├─ dates.ts            本地日期工具（时区安全）
   ├─ storage.ts          唯一接触 localStorage 的文件
   ├─ backup.ts           备份构造、校验、合并
   ├─ useExpenses.ts      账目状态管理
   └─ components/         界面组件
```
