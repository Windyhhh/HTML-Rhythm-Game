# 🎵 HTML 节奏游戏 | HTML Rhythm Game

> **纯 HTML/CSS/JavaScript 实现的音乐节奏游戏——键盘操作、节拍判定、连击系统、得分排行，零依赖开箱即玩。**
>
> *Music rhythm game built with pure HTML/CSS/JavaScript — keyboard controls, beat judgment, combo system, score ranking, zero-dependency ready to play.*

---

## ⭐ 核心卖点 | Why Star This

| 卖点 | Feature | 一句话 |
|------|---------|--------|
| 🎮 **纯前端实现** | Pure Frontend | 无需后端，HTML/CSS/JS 实现 |
| 🎵 **节奏玩法** | Rhythm Gameplay | 下落式音符 + 精准节拍判定 |
| ⌨️ **键盘操作** | Keyboard Controls | 方向键/字母键映射打击 |
| 🏆 **连击评分** | Combo & Score | Perfect/Good/Miss 判定 + 连击加分 |
| 🎚️ **难度选择** | Difficulty Levels | 简单/普通/困难三档难度 |

---

## 🚀 快速开始 | Quick Start

```bash
git clone https://github.com/Windyhhh/HTML-Rhythm-Game.git
cd HTML-Rhythm-Game

# 直接打开 index.html 即可游玩
# 或启动本地服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

---

## 📂 项目结构 | Project Structure

```
HTML-Rhythm-Game/
├── index.html                 # 游戏主页面
├── css/
│   ├── style.css              # 样式
│   └── game.css               # 游戏界面
├── js/
│   ├── game.js                # 游戏主逻辑
│   ├── beatmap.js             # 谱面解析
│   ├── input.js               # 键盘输入
│   ├── scoring.js             # 计分系统
│   └── audio.js               # 音频播放
├── audio/                     # 音乐文件
├── beatmaps/                  # 谱面文件
└── assets/                    # 素材
```

---

## 🔬 核心实现 | Core Implementation

### 游戏主循环 | Game Loop

```javascript
// 游戏主逻辑
class RhythmGame {
    constructor(canvas, beatmap) {
        this.canvas = canvas;
        this.beatmap = beatmap;
        this.currentTime = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.judgements = { perfect: 0, good: 0, miss: 0 };
    }
    
    update(deltaTime) {
        this.currentTime += deltaTime;
        // 生成音符、检测命中
        this.spawnNotes();
        this.detectHits();
        // 更新判定
        this.updateJudgements();
    }
    
    judge(note, hitTime) {
        const offset = Math.abs(note.time - this.currentTime);
        if (offset < 0.05) return 'perfect';   // 50ms 内
        if (offset < 0.1) return 'good';       // 100ms 内
        return 'miss';
    }
    
    addScore(judgement) {
        const points = { perfect: 100, good: 50, miss: 0 };
        this.score += points[judgement];
        if (judgement === 'miss') {
            this.combo = 0;
        } else {
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
        }
    }
}
```

---

## 🎯 应用场景 | Use Cases

- 🎮 **娱乐休闲**：简单上手的音乐小游戏
- 🎓 **前端教学**：Canvas/动画/事件处理教学项目
- 🧩 **游戏开发**：节奏游戏玩法原型
- 💻 **作品集**：纯前端交互作品

---

## 📄 License

MIT License — 自由使用、修改和分发。

---

> 💡 **纯 HTML 节奏游戏，Star ⭐ 即刻开玩！**
