# 五子棋游戏

一个使用原生 HTML、CSS 和 JavaScript 实现的五子棋游戏，支持人机对战，具有智能 AI 和美观的界面效果。

## 功能特点

- 完整的五子棋游戏规则实现
- 支持两种难度模式：
  - 普通模式：基础 AI 策略
  - 困难模式：增强型 AI 策略，更具挑战性
- 灵活的对局设置：
  - 玩家先手（执黑）
  - AI 先手（执白）
- 智能 AI 系统：
  - 具有进攻和防守策略
  - 能识别和应对活三、冲四等棋型
  - 优先选择有利位置
  - 困难模式下具有更强的局势判断能力
- 交互体验：
  - 最新落子高亮提示
  - 获胜棋子动画效果（金色脉冲）
  - 落子动画效果
  - 实时游戏状态提示
  - 现代化的界面设计
- 游戏控制：
  - 悔棋功能（可撤销最近一手）
  - 重新开始当前模式
  - 随时切换游戏模式
- 响应式棋盘界面

## 快速开始

1. 克隆项目到本地：

```bash
git clone [你的仓库URL]
```

2. 运行游戏（以下任选一种方式）：

方式一：使用 Python 内置的 HTTP 服务器
```bash
# Python 3.x
python -m http.server

# Python 2.x
python -m SimpleHTTPServer
```
然后在浏览器中访问 `http://localhost:8000`

方式二：使用 Node.js 的 http-server
```bash
# 全局安装 http-server
npm install -g http-server

# 在项目目录下运行
http-server
```
然后在浏览器中访问 `http://localhost:8080`

方式三：使用 VSCode 的 Live Server 插件
- 右键 `index.html` 文件
- 选择 "Open with Live Server"

方式四：直接使用浏览器打开
- 直接双击 `index.html` 文件
- 注意：由于浏览器安全策略，某些浏览器可能会限制直接打开文件的 JavaScript 模块功能，建议使用以上其他方式

## 游戏规则

- 黑白双方轮流落子
- 在空位置落子
- 横向、纵向或斜向连成五子即可获胜
- 支持随时悔棋、重新开始或切换模式

## 操作说明

1. 开始游戏：
   - 选择游戏难度（普通/困难）
   - 选择先手顺序（玩家/AI）
   - 点击"开始游戏"按钮

2. 游戏过程：
   - 点击棋盘交叉点落子
   - 点击"悔棋"可撤销最近一手棋
   - 点击"重新开始"可重新开始当前模式的游戏
   - 点击"选择模式"可返回模式选择界面

## 技术实现

- 使用原生 JavaScript ES6+ 模块化开发
- 面向对象的架构设计
- CSS3 动画效果
- HTML5 语义化标签
- 模块化的 AI 策略系统

## 项目结构

```
├── index.html          # 游戏主页面
├── styles.css          # 样式文件
├── game.js            # 游戏主逻辑
├── board.js           # 棋盘管理
├── gameLogic.js       # 游戏规则判断
├── aiService.js       # AI 服务
├── UIController.js    # 界面控制
└── config.js          # 游戏配置
```

## 开发环境

- 支持 ES6 模块的现代浏览器
- VSCode + Live Server 插件（推荐）

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge
