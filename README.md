# 🎮 Neon Tic-Tac-Toe Web App

A modern, responsive, neon glassmorphic **Tic-Tac-Toe** web game featuring smart AI with the Minimax algorithm, 2-player local mode, dynamic Web Audio sound effects, and confetti celebrations.

---

## ✨ Features

- **🤖 Solo vs AI**:
  - **Casual Mode**: Relaxed computer opponent that occasionally makes random moves.
  - **Unbeatable Mode**: Powered by the **Minimax algorithm** with alpha-beta pruning — mathematically impossible to defeat!
- **👥 2-Player Local Mode**: Pass-and-play on the same device.
- **✨ Visual Aesthetics**: Sleek dark-mode glassmorphism with glowing neon cyan (`X`) and neon magenta (`O`) visual accents.
- **🔊 Built-in Web Audio Synthesizer**: Pure native Web Audio API sound effects for moves, win fanfares, draws, and button clicks with a sound toggle (no external audio files needed).
- **🎉 Confetti Celebrations**: Canvas-based particle physics confetti when a player wins.
- **📊 Scoreboard**: Tracks Player X wins, Player O / AI wins, and ties with `localStorage` persistence.
- **📱 Fully Responsive**: Seamless experience on mobile phones, tablets, and desktop monitors.

---

## 🚀 How to Run Locally

1. Simply double-click [`index.html`](file:///c:/Users/manju/Downloads/New%20folder%20(6)/index.html) to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.
2. Alternatively, open it with VS Code **Live Server** or run a simple local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js npx
   npx serve .
   ```

---

## 🛠️ Tech Stack

- **HTML5**: Semantic layout and accessible elements.
- **Vanilla CSS3**: Glassmorphism, CSS grid, custom properties, and keyframe animations.
- **Vanilla JavaScript (ES6+)**: Game state management, Minimax algorithm, Web Audio API, and canvas particle system.

---

## 📦 How to Push to GitHub

### 1. Configure Your Git Identity (One-time)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. Initialize and Commit
```bash
git init
git add .
git commit -m "Initial commit: Neon Tic-Tac-Toe Web App"
```

### 3. Connect to GitHub and Push
1. Go to [GitHub.com](https://github.com) and click **New Repository**.
2. Name your repository (e.g., `neon-tic-tac-toe`) and click **Create repository**.
3. Run:
```bash
git branch -M main
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### 4. Enable Free Web Hosting with GitHub Pages
1. Go to your repository **Settings** on GitHub.
2. Under the **Pages** tab on the left sidebar, select Branch: `main` and Folder: `/ (root)`.
3. Click **Save** — GitHub will generate a live public URL for your game!
