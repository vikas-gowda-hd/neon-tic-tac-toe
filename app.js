/**
 * Neon Tic-Tac-Toe Web Application
 * Logic: Game Engine, Minimax AI, Web Audio Synthesizer, Confetti System
 */

(function () {
  'use strict';

  // Winning board cell index combinations
  const WINNING_COMBOS = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Col 1
    [1, 4, 7], // Col 2
    [2, 5, 8], // Col 3
    [0, 4, 8], // Diagonal 1
    [2, 4, 6]  // Diagonal 2
  ];

  // Game State
  const state = {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    gameActive: true,
    mode: 'pve', // 'pve' (Player vs AI) or 'pvp' (2 Players)
    difficulty: 'hard', // 'easy' or 'hard'
    scores: {
      x: 0,
      o: 0,
      ties: 0
    },
    soundEnabled: true
  };

  // DOM Elements
  const boardEl = document.getElementById('game-board');
  const cells = document.querySelectorAll('.cell');
  const statusBanner = document.getElementById('status-banner');
  const statusText = document.getElementById('status-text');
  const statusIcon = document.getElementById('status-icon');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreTiesEl = document.getElementById('score-ties');
  const cardX = document.getElementById('card-x');
  const cardO = document.getElementById('card-o');
  const nameO = document.getElementById('name-o');
  const modePveBtn = document.getElementById('mode-pve');
  const modePvpBtn = document.getElementById('mode-pvp');
  const aiDiffContainer = document.getElementById('ai-difficulty-container');
  const diffEasyBtn = document.getElementById('diff-easy');
  const diffHardBtn = document.getElementById('diff-hard');
  const restartBtn = document.getElementById('btn-restart');
  const resetScoreBtn = document.getElementById('btn-reset-score');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // ==========================================
  // Web Audio Synthesizer (No external files)
  // ==========================================
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, type = 'sine', duration = 0.12, gainValue = 0.15) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not permitted without interaction
    }
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      if (type === 'move-x') {
        playTone(520, 'sine', 0.12, 0.18);
      } else if (type === 'move-o') {
        playTone(390, 'triangle', 0.14, 0.2);
      } else if (type === 'win') {
        // Joyful ascending arpeggio
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          setTimeout(() => playTone(freq, 'sine', 0.22, 0.2), idx * 90);
        });
      } else if (type === 'tie') {
        playTone(320, 'sawtooth', 0.18, 0.1);
        setTimeout(() => playTone(280, 'sawtooth', 0.25, 0.1), 120);
      } else if (type === 'click') {
        playTone(600, 'sine', 0.05, 0.08);
      }
    } catch (e) {}
  }

  // ==========================================
  // Confetti Particle System
  // ==========================================
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiAnimationId = null;

  function initConfetti() {
    confettiCtx = confettiCanvas.getContext('2d');
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
  }

  function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function fireConfetti() {
    if (!confettiCtx) return;
    confettiParticles = [];
    const colors = ['#00f2fe', '#4facfe', '#ff3366', '#ff6b8b', '#fbbf24', '#a855f7', '#ffffff'];
    const count = 90;

    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() - 0.5) * 160,
        y: confettiCanvas.height / 2 - 40,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        opacity: 1,
        life: 0
      });
    }

    if (confettiAnimationId) {
      cancelAnimationFrame(confettiAnimationId);
    }
    renderConfetti();
  }

  function renderConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.vx *= 0.98; // Air friction
      p.rotation += p.vRot;
      p.life++;

      if (p.life > 60) {
        p.opacity -= 0.025;
      }

      if (p.opacity <= 0 || p.y > confettiCanvas.height) {
        confettiParticles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.4);
      confettiCtx.restore();
    }

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(renderConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      confettiAnimationId = null;
    }
  }

  // ==========================================
  // Storage Handling
  // ==========================================
  function loadSavedState() {
    try {
      const savedScores = localStorage.getItem('tictactoe_scores');
      if (savedScores) {
        state.scores = JSON.parse(savedScores);
      }
      const savedSound = localStorage.getItem('tictactoe_sound');
      if (savedSound !== null) {
        state.soundEnabled = savedSound === 'true';
      }
    } catch (e) {}
    updateScoreUI();
    updateSoundUI();
  }

  function saveScores() {
    try {
      localStorage.setItem('tictactoe_scores', JSON.stringify(state.scores));
    } catch (e) {}
  }

  function updateScoreUI() {
    scoreXEl.textContent = state.scores.x;
    scoreOEl.textContent = state.scores.o;
    scoreTiesEl.textContent = state.scores.ties;
  }

  function updateSoundUI() {
    soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
    soundToggleBtn.setAttribute('title', state.soundEnabled ? 'Mute Sound' : 'Enable Sound');
  }

  // ==========================================
  // Core Game Mechanics
  // ==========================================
  function initGame() {
    loadSavedState();
    initConfetti();
    setupEventListeners();
    resetBoard();
  }

  function setupEventListeners() {
    // Cell clicks
    cells.forEach(cell => {
      cell.addEventListener('click', handleCellClick);
    });

    // Game Mode Switcher
    modePveBtn.addEventListener('click', () => setMode('pve'));
    modePvpBtn.addEventListener('click', () => setMode('pvp'));

    // Difficulty Switcher
    diffEasyBtn.addEventListener('click', () => setDifficulty('easy'));
    diffHardBtn.addEventListener('click', () => setDifficulty('hard'));

    // Action buttons
    restartBtn.addEventListener('click', () => {
      playSound('click');
      resetBoard();
    });

    resetScoreBtn.addEventListener('click', () => {
      playSound('click');
      state.scores = { x: 0, o: 0, ties: 0 };
      saveScores();
      updateScoreUI();
      resetBoard();
    });

    // Sound toggle
    soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      try {
        localStorage.setItem('tictactoe_sound', state.soundEnabled);
      } catch (e) {}
      updateSoundUI();
      if (state.soundEnabled) playSound('click');
    });
  }

  function setMode(mode) {
    if (state.mode === mode) return;
    playSound('click');
    state.mode = mode;

    if (mode === 'pve') {
      modePveBtn.classList.add('active');
      modePvpBtn.classList.remove('active');
      aiDiffContainer.style.display = 'flex';
      nameO.textContent = 'AI Bot';
    } else {
      modePvpBtn.classList.add('active');
      modePveBtn.classList.remove('active');
      aiDiffContainer.style.display = 'none';
      nameO.textContent = 'Player O';
    }

    resetBoard();
  }

  function setDifficulty(diff) {
    if (state.difficulty === diff) return;
    playSound('click');
    state.difficulty = diff;

    if (diff === 'easy') {
      diffEasyBtn.classList.add('active');
      diffHardBtn.classList.remove('active');
    } else {
      diffHardBtn.classList.add('active');
      diffEasyBtn.classList.remove('active');
    }

    resetBoard();
  }

  function resetBoard() {
    state.board = Array(9).fill(null);
    state.currentPlayer = 'X';
    state.gameActive = true;

    // Reset cell UI
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
      cell.removeAttribute('disabled');
    });

    // Reset status & turn cards
    statusBanner.className = 'status-banner';
    statusIcon.textContent = '🎮';
    statusText.textContent = state.mode === 'pve' ? "Player X's Turn" : "Player X's Turn";

    updateTurnCards();
  }

  function updateTurnCards() {
    if (!state.gameActive) {
      cardX.classList.remove('active-turn');
      cardO.classList.remove('active-turn');
      return;
    }

    if (state.currentPlayer === 'X') {
      cardX.classList.add('active-turn');
      cardO.classList.remove('active-turn');
    } else {
      cardO.classList.add('active-turn');
      cardX.classList.remove('active-turn');
    }
  }

  function handleCellClick(e) {
    const cell = e.currentTarget;
    const index = parseInt(cell.getAttribute('data-index'), 10);

    // If cell already marked or game inactive, ignore
    if (state.board[index] !== null || !state.gameActive) {
      return;
    }

    // In AI mode, prevent player from clicking while AI is "thinking"
    if (state.mode === 'pve' && state.currentPlayer === 'O') {
      return;
    }

    executeMove(index, state.currentPlayer);

    // If game still active and in PvE mode, trigger AI move
    if (state.gameActive && state.mode === 'pve' && state.currentPlayer === 'O') {
      boardEl.style.pointerEvents = 'none';
      statusIcon.textContent = '🧠';
      statusText.textContent = 'AI is calculating...';

      const delay = state.difficulty === 'hard' ? 420 : 350;
      setTimeout(() => {
        if (!state.gameActive) {
          boardEl.style.pointerEvents = 'auto';
          return;
        }
        const aiMove = getAIMove();
        executeMove(aiMove, 'O');
        boardEl.style.pointerEvents = 'auto';
      }, delay);
    }
  }

  function executeMove(index, player) {
    state.board[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add('taken', player === 'X' ? 'x-cell' : 'o-cell');
    cell.setAttribute('disabled', 'true');

    playSound(player === 'X' ? 'move-x' : 'move-o');

    // Check Win or Tie
    const winResult = checkWinner(state.board);

    if (winResult) {
      handleGameOver('win', winResult);
    } else if (isBoardFull(state.board)) {
      handleGameOver('tie');
    } else {
      // Toggle turn
      state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
      const playerLabel = state.currentPlayer === 'X'
        ? 'Player X'
        : (state.mode === 'pve' ? 'AI Bot' : 'Player O');
      statusText.textContent = `${playerLabel}'s Turn`;
      statusIcon.textContent = state.currentPlayer === 'X' ? '🎮' : (state.mode === 'pve' ? '🤖' : '🎯');
      updateTurnCards();
    }
  }

  function handleGameOver(type, winResult = null) {
    state.gameActive = false;
    updateTurnCards();

    if (type === 'win') {
      const winner = winResult.winner;
      state.scores[winner.toLowerCase()]++;
      saveScores();
      updateScoreUI();

      // Highlight winning cells
      winResult.combo.forEach(idx => {
        cells[idx].classList.add('winning-cell');
      });

      statusBanner.classList.add(winner === 'X' ? 'win-x' : 'win-o');
      statusIcon.textContent = '🏆';

      if (winner === 'X') {
        statusText.textContent = state.mode === 'pve' ? '🎉 You Won! Victory!' : '🎉 Player X Wins!';
      } else {
        statusText.textContent = state.mode === 'pve' ? '🤖 AI Bot Wins!' : '🎉 Player O Wins!';
      }

      playSound('win');
      fireConfetti();
    } else {
      // Tie
      state.scores.ties++;
      saveScores();
      updateScoreUI();

      statusBanner.classList.add('tie');
      statusIcon.textContent = '🤝';
      statusText.textContent = "It's a Draw!";
      playSound('tie');
    }
  }

  function checkWinner(board) {
    for (const combo of WINNING_COMBOS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }
    return null;
  }

  function isBoardFull(board) {
    return board.every(cell => cell !== null);
  }

  function getAvailableMoves(board) {
    const moves = [];
    board.forEach((val, idx) => {
      if (val === null) moves.push(idx);
    });
    return moves;
  }

  // ==========================================
  // Artificial Intelligence (Minimax)
  // ==========================================
  function getAIMove() {
    const available = getAvailableMoves(state.board);

    if (state.difficulty === 'easy') {
      // 70% random, 30% smart move so it feels casual
      if (Math.random() < 0.7) {
        return available[Math.floor(Math.random() * available.length)];
      }
    }

    // Minimax: Unbeatable optimal move calculation
    let bestScore = -Infinity;
    let bestMove = available[0];

    // Shuffle moves slightly for natural variation on equal-value optimal moves
    available.sort(() => Math.random() - 0.5);

    for (const move of available) {
      state.board[move] = 'O';
      const score = minimax(state.board, 0, false, -Infinity, Infinity);
      state.board[move] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  // Minimax with Alpha-Beta Pruning
  function minimax(board, depth, isMaximizing, alpha, beta) {
    const winResult = checkWinner(board);
    if (winResult) {
      return winResult.winner === 'O' ? 10 - depth : depth - 10;
    }
    if (isBoardFull(board)) {
      return 0;
    }

    const available = getAvailableMoves(board);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of available) {
        board[move] = 'O';
        const evaluation = minimax(board, depth + 1, false, alpha, beta);
        board[move] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of available) {
        board[move] = 'X';
        const evaluation = minimax(board, depth + 1, true, alpha, beta);
        board[move] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Start the application when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
})();
