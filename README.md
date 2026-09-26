# IELTS Vocabulary Trainer — 雅思核心词汇训练系统

> **「词汇的宇宙，从拨动开关的那一刻开始」**

## 👨‍💻 开发者信息

- **开发者**：[Rahemjianaytoli](https://github.com/Rahemjianaytoli) (个人开发者)
- **项目名称**：IELTS Vocabulary Trainer
- **技术栈**：原生 HTML + CSS + JavaScript（零依赖）
- **许可**：MIT License

---

## 📬 联系方式

- **GitHub**：[Rahemjianaytoli](https://github.com/Rahemjianaytoli)
- **提交 Issue**：项目仓库的 Issues 页面 · [Submit Issues](https://github.com/your-username/IELTS-Vocabulary-Trainer/issues)
- **微信（广告商合作联系）**：aytol4real · _WeChat (Business / Advertising inquiries only)_
- **欢迎贡献**：任何改进建议、Bug 反馈或功能请求，请通过 GitHub Issues 提交 · _Contributions, bug reports & feature requests are always welcome via GitHub Issues_

---

## 🎯 初衷

雅思备考过程中，背单词是绕不开的一环。市面上的背词软件虽多，但大多存在以下问题：

1. **界面花哨、干扰大** — 各种推送、广告和积分体系让人分心
2. **被动学习、效率低** — 多数 App 是"看中文选英文"的选择题，无法真正检测拼写
3. **读音脱节** — 背完单词不知道发音，尤其是英式发音，听力中听不懂
4. **缺少深度默写** — 真正的掌握是能拼写出来，而不仅仅是"看着认识"

为了提高自己的背词效率，同时锻炼前端开发能力，我决定自己写一个纯粹、高效、专注的词汇训练工具。

---

## 🚀 目的

1. **提供一个沉浸式、无干扰的背词环境**
2. **通过默写 + 即时纠错，强化拼写记忆**
3. **每词必读英式发音，练就标准听力**
4. **错题自动统计，精准聚焦薄弱词汇**
5. **支持自定义词库和 IELTS 核心词汇双模式**
6. **本地运行，零网络依赖，数据隐私有保障**

---

## 📖 如何使用

### 打开方式

直接在浏览器中打开 `index.html` 即可使用，**无需安装任何软件**，**无需启动服务器**。

> 由于浏览器安全策略，部分浏览器在以 `file://` 协议打开时可能会限制某些功能。推荐使用 **Chrome** 或 **Edge** 最新版本。

### 操作流程

#### 1. 开始页面
- 页面中央有一个复古风格的**飞机拨片开关**
- 点击开关下方的醒目提示 ✦ **拨动开关，开启你的词汇时空之旅** ✦
- 开关拨下后，启动 **虫洞动画**（约 8.5 秒）
- 按键盘**任意键**可跳过动画
- 如果动画卡住，10 秒后会自动跳转至主页面

#### 2. 词库选择

**模式一：IELTS 核心词汇**
- 页面已内置 **1339 个 IELTS 核心词汇**
- 可按章节筛选（第一节 自然景观、第二节 动植物等）

**模式二：自定义词库**
- 在左侧文本框中粘贴自定义词汇
- 每行一个单词，支持格式：
  - `word [音标] 中文释义`
  - `word 中文释义`
  - `word`（仅有单词）
- 点击 **"开始默写"** 即可

#### 3. 默写练习

- 页面上方显示**中文释义**，你需要输入对应的英文单词
- 直接**在键盘上输入字母**，不需要点击输入框
- 每输入一个字母，下方会显示在横线上
- 按 **Enter 回车** 提交答案
- 提交后，拼写正确的字母显示为 **绿色**，错误的显示为 **红色**
- 无论对错，都会显示：
  - 单词的完整拼写（去除横线）
  - 中文释义
  - **自动播放英式发音**

#### 4. 快捷键

| 快捷键 | 功能 |
|--------|------|
| **Enter** | 提交答案 / 下一题 |
| **R** | 播放发音 |
| **Alt** | 再来一次（重新开始） |

#### 5. 进度追踪

- 每次练习会统计**正确数**和**错误数**
- 进度条直观显示当前进度
- 错题数据保存在浏览器本地（LocalStorage），关闭页面不会丢失

---

## 🗂 项目结构

```
self_english_recitation/
├── index.html                  # 入口页面
├── css/
│   └── style.css               # 全部样式（瑞克和莫迪主题）
├── js/
│   ├── bundle.js               # 应用核心逻辑
│   └── data/
│       └── ielts.js            # IELTS 核心词汇数据（结构化）
├── IELTS_core_vocabulary/
│   └── IELTS 词库.txt          # 原始词库文本（数据源）
└── README.md                   # 本说明文件
```

---

## ❓ 常见问题与解决方法

### Q1: 打开页面后开关没反应？

- **原因**：浏览器安全策略可能阻止了首次交互的 JavaScript 执行
- **解决**：
  - 点击开关下方的 **"⏎ 点此直接进入"** 文字
  - 或者刷新页面重试
  - 如果使用 IE / 旧版浏览器，请更换为 Chrome 或 Edge

### Q2: 发音无法播放？

- **原因**：浏览器的自动播放策略限制
- **解决**：
  - 点击页面任意位置一次（建立用户交互上下文）
  - 手动点击 **"播放发音"** 按钮
  - 或者按 **R 键** 播放
  - 建议使用 Chrome 或 Edge 浏览器

### Q3: 雅思词库没有加载？

- **原因**：在 `file://` 协议下，浏览器禁止通过 XHR 加载本地文件
- **解决**：
  - 词库数据已内置于 `js/data/ielts.js`，正常情况下会自动加载
  - 如果未加载，请确保 `index.html` 和 `js/data/ielts.js` 的相对路径正确
  - 打开浏览器控制台（F12），查看是否有报错信息
  - 如数据损坏，可重新下载项目或联系开发者

### Q4: 自定义词库怎么用？

- 在页面左侧的文本框中粘贴词表
- 每行一个单词，格式示例如下：
  ```
  abandon [əˈbændən] v. 放弃，遗弃
  ability 能力
  absorb
  ```
- 支持带音标和不带音标的格式
- 点击 **"开始默写"** 即可

### Q5: 我的错题数据会丢失吗？

- 错题数据保存在浏览器的 **LocalStorage** 中
- 清除浏览器缓存会丢失错题记录
- 未来版本会加入导出 / 导入功能

### Q6: 页面风格太暗了，可以改吗？

- 色彩方案受瑞克和莫迪动画启发，旨在**减少长时间背词的视觉疲劳**
- 深色背景配合青紫色点缀降低屏幕眩光
- 如需调整，可修改 `css/style.css` 中的 CSS 变量：
  ```css
  :root {
    --bg-primary: #0a0e1a;    /* 主背景 */
    --bg-secondary: #111827;  /* 卡片背景 */
    --accent: #67e8f9;        /* 主色调 */
    --accent2: #a78bfa;       /* 辅色调 */
  }
  ```

### Q7: 我想部署到 GitHub Pages，需要注意什么？

- 项目支持 `file://` 协议直接运行，也支持 HTTP 服务器部署
- 部署后 XHR 功能正常工作，IELTS 词库可直接加载原始 TXT 文件
- 确保 `js/data/ielts.js` 文件存在（作为 file:// 的兼容方案）
- 建议保持目前的目录结构不变

---

## 🛣 后续规划

- [x] 基础默写功能
- [x] IELTS 核心词汇 1339 词
- [x] 英式发音朗读
- [x] 瑞克和莫迪主题 UI
- [x] 虫洞动画入口
- [x] 错题统计（LocalStorage）
- [ ] 数据库集成（PostgreSQL / SQLite）
- [ ] 用户登录与云端同步
- [ ] 间隔重复算法（SM-2）
- [ ] 排行榜与学习统计
- [ ] PWA 离线支持
- [ ] 移动端 App（Flutter / React Native）

---

**Happy vocabulary building! 🚀**

*"Wubba Lubba Dub Dub!" — Rick Sanchez*

---

# IELTS Vocabulary Trainer — English

> **「The universe of vocabulary starts the moment you flip the switch.」**

## 👨‍💻 Developer

- **Developer**：[Rahemjianaytoli](https://github.com/Rahemjianaytoli) (Solo Developer)
- **Project**：IELTS Vocabulary Trainer
- **Tech Stack**：Vanilla HTML + CSS + JavaScript (Zero Dependencies)
- **License**：MIT License

---

## 📬 Contact

- **GitHub**：[Rahemjianaytoli](https://github.com/Rahemjianaytoli)
- **Submit Issue**：[Project Issues Page](https://github.com/your-username/IELTS-Vocabulary-Trainer/issues)
- **WeChat (Business / Advertising)**：aytol4real
- **Contributions**：Bug reports, feature requests, and pull requests are always welcome via GitHub Issues

---

## 🎯 Motivation

Vocabulary is essential for IELTS preparation. While many apps exist, most suffer from:

1. **Distracting UIs** — notifications, ads, and gamification systems pull focus away from learning
2. **Passive learning** — multiple-choice "look at Chinese, pick English" doesn't test actual spelling
3. **Disconnected pronunciation** — British English pronunciation is especially neglected, making listening tasks harder
4. **Lack of deep dictation** — real mastery means being able to spell, not just recognize

To improve my own efficiency and sharpen my front-end skills, I built a clean, focused, distraction-free vocabulary trainer.

---

## 🚀 Goals

1. **Provide an immersive, distraction-free learning environment**
2. **Reinforce spelling through live dictation + instant error highlighting**
3. **Every word is read aloud in British English for listening practice**
4. **Auto-track wrong answers to target weak vocabulary**
5. **Support both custom word lists and built-in IELTS core vocabulary**
6. **Run locally with zero network dependency — your data stays private**

---

## 📖 How to Use

### Launch

Simply open `index.html` in your browser. **No installation or server required.**

> Some browsers restrict certain features under the `file://` protocol. **Chrome** or **Edge** (latest version) is recommended.

### Workflow

#### 1. Landing Page
- A vintage **aircraft toggle switch** sits at the center of the page
- Click the prompt below the switch: ✦ **拨动开关，开启你的词汇时空之旅** ✦ (Flip the switch to begin)
- The switch triggers a **wormhole animation** (~8.5 seconds)
- Press **any key** to skip the animation
- If the animation hangs, the page auto-transitions after 10 seconds

#### 2. Word Source Selection

**Mode 1: IELTS Core Vocabulary (Built-in)**
- **1339 words** pre-loaded
- Filterable by section (Nature, Geography, Animals, Plants, etc.)

**Mode 2: Custom Word List**
- Paste your own words into the text area on the left
- One word per line. Supported formats:
  - `word [phonetic] translation`
  - `word translation`
  - `word` (word only)
- Click **"Start Dictation"** to begin

#### 3. Dictation Practice

- The **Chinese definition** is displayed at the top — type the corresponding English word
- **Type directly on your keyboard** — no need to click into an input field
- Each letter appears on an underscore line as you type
- Press **Enter** to submit your answer
- After submission, correct letters turn **green**, incorrect ones turn **red**
- Regardless of correctness, you'll see:
  - The full word (underscores removed)
  - The Chinese definition
  - **Auto-played British English pronunciation**

#### 4. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Enter** | Submit answer / Next word |
| **R** | Play pronunciation |
| **Alt** | Restart session |

#### 5. Progress Tracking

- **Correct** and **incorrect** counts are shown for each session
- Progress bar gives a visual overview
- Wrong-answer data is saved to **LocalStorage** — it persists after closing the page

---

## 🗂 Project Structure

```
self_english_recitation/
├── index.html                  # Entry page
├── css/
│   └── style.css               # All styles (Rick & Morty inspired theme)
├── js/
│   ├── bundle.js               # Core application logic
│   └── data/
│       └── ielts.js            # Structured IELTS vocabulary data (1339 words)
├── IELTS_core_vocabulary/
│   └── IELTS 词库.txt          # Original source text (backup data)
└── README.md                   # This file
```

---

## ❓ FAQ & Troubleshooting

### Q1: The toggle switch doesn't respond when I open the page.

- **Cause**: Browser security policies may block initial JavaScript interaction.
- **Fix**:
  - Click the **"⏎ 点此直接进入"** (Click here to enter) text below the switch
  - Or refresh the page and try again
  - If using IE / an old browser, switch to Chrome or Edge

### Q2: Pronunciation won't play.

- **Cause**: Browser autoplay restrictions.
- **Fix**:
  - Click anywhere on the page once (establishes user interaction context)
  - Manually click the **"Play Pronunciation"** button
  - Or press the **R** key
  - Chrome or Edge is recommended

### Q3: The IELTS vocabulary didn't load.

- **Cause**: Under `file://` protocol, browsers block XHR requests to local files.
- **Fix**:
  - The vocabulary data is bundled in `js/data/ielts.js` and should load automatically
  - If not loaded, check that the relative path between `index.html` and `js/data/ielts.js` is correct
  - Open the browser console (F12) and check for error messages
  - If data appears corrupted, re-download the project or contact the developer

### Q4: How do I use a custom word list?

- Paste your word list into the text area on the left
- One word per line, for example:
  ```
  abandon [əˈbændən] v. 放弃，遗弃
  ability 能力
  absorb
  ```
- Works with or without phonetic symbols
- Click **"Start Dictation"** to begin

### Q5: Will my wrong-answer data be lost?

- Data is saved to the browser's **LocalStorage**
- Clearing the browser cache will erase your records
- Export / Import functionality is planned for a future release

### Q6: The theme is too dark. Can I customize it?

- The color scheme is inspired by *Rick and Morty* and is designed to **reduce eye strain during long study sessions**
- The dark background with cyan & purple accents minimizes screen glare
- You can customize it by editing the CSS variables in `css/style.css`:
  ```css
  :root {
    --bg-primary: #0a0e1a;    /* Main background */
    --bg-secondary: #111827;  /* Card background */
    --accent: #67e8f9;        /* Primary accent */
    --accent2: #a78bfa;       /* Secondary accent */
  }
  ```

### Q7: I want to deploy to GitHub Pages. What should I know?

- The project works both as a local `file://` site and as an HTTP-deployed site
- Once deployed, XHR requests will work normally, and the IELTS data can also be loaded from the original TXT file
- Keep `js/data/ielts.js` for `file://` compatibility
- Do not change the directory structure

---

## 🛣 Roadmap

- [x] Basic dictation functionality
- [x] 1339 IELTS core vocabulary words
- [x] British English pronunciation
- [x] Rick & Morty themed UI
- [x] Wormhole animated entry
- [x] Wrong-answer tracking (LocalStorage)
- [ ] Database integration (PostgreSQL / SQLite)
- [ ] User login & cloud sync
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Leaderboard & learning analytics
- [ ] PWA offline support
- [ ] Mobile app (Flutter / React Native)

---

**Happy vocabulary building! 🚀**

*"Wubba Lubba Dub Dub!" — Rick Sanchez*