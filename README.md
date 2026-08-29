<div align="center">

# 网页节奏游戏 | HTML-Rhythm-Game

### A pure-frontend rhythm game with Web Audio & Canvas sheet music.

Tone synthesis, rhythm editing, live score feedback and sheet-music rendering — no backend, no framework.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/JavaScript)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-2EA44F)](https://developer.mozilla.org/Web/API/Web_Audio_API)
[![Canvas](https://img.shields.io/badge/Canvas-2D-4A90D9)](https://developer.mozilla.org/Canvas_API)

</div>

---

**HTML-Rhythm-Game** is a **pure-frontend rhythm game / metronome** built for music education. It synthesizes multiple percussion tones with the **Web Audio API**, renders **sheet music on Canvas**, and scores the player's timing in real time — all in vanilla HTML/CSS/JS with no dependencies.

> [!NOTE]
> 中文项目：纯前端趣味节奏游戏——Web Audio 多音色打击乐 + Canvas 五线谱 + 实时评分，无后端无框架。

---

## Features

- **Web Audio synthesis** — 5 percussion tones, latency < 20ms, programmable synthesis.
- **Canvas sheet music** — standard notation with slurs / ties; 7 rhythm templates.
- **Live scoring** — real-time timing accuracy feedback (±200ms tolerance).
- **Responsive UI** — adapts to mobile; ~99% mainstream-browser support.
- **Modular** — audio engine and UI components reusable in other music apps.

---

## Quickstart

```bash
git clone https://github.com/Windyhhh/HTML-Rhythm-Game.git
cd HTML-Rhythm-Game

# open index.html in a browser — no build step needed
start index.html
```

---

## Project Structure

```
HTML-Rhythm-Game/
├── index.html           # entry
├── css/                 # styles & animations
├── js/
│   ├── audio.js         # Web Audio tone engine
│   ├── sheet.js         # Canvas sheet-music renderer
│   └── game.js          # rhythm + scoring logic
└── docs/                # CSDN blog
```

---

## License

MIT — free to use, modify and distribute.
