<div align="center">

# 🎵 HTML-Rhythm-Game

### A browser music rhythm game.

A zero-dependency music rhythm game in plain HTML/CSS/JS — keyboard controlled, with a built-in audio engine.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/HTML)

</div>

---

**HTML-Rhythm-Game** is a music rhythm game that runs entirely in the browser. Notes fall to the beat and you hit them with the keyboard — no build step, no dependencies, just open the page and play.

---

## Quickstart

```bash
git clone https://github.com/Windyhhh/HTML-Rhythm-Game.git
cd HTML-Rhythm-Game

# Serve locally (any static server works)
python -m http.server 8080
# open http://localhost:8080
```

Or simply double-click `index.html`.

---

## Features

- **Pure frontend** — no backend, no dependencies.
- **Built-in audio engine** — `js/audio-engine.js` handles playback and timing.
- **Keyboard control** — hit notes on the beat for score and combos.

---

## Project Structure

```
HTML-Rhythm-Game/
├── index.html            # game page
├── css/styles.css        # styles
└── js/
    ├── app.js            # game logic
    └── audio-engine.js   # audio / timing engine
```

---

## License

MIT — free to use, modify and distribute.
