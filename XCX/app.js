// XCX Cyber Sudoku Engine & UI Controller

class SudokuEngine {
  constructor() {
    this.solution = Array(81).fill(0);
    this.initialBoard = Array(81).fill(0);
    this.currentBoard = Array(81).fill(0);
    this.notes = Array(81).fill(null).map(() => new Set());
    this.history = [];
    this.difficulty = 'easy';
    this.selectedCellIndex = null;
    this.pencilMode = false;
    this.mistakes = 0;
    this.maxMistakes = 3;
    this.score = 0;
    this.timerSeconds = 0;
    this.timerInterval = null;
    this.autoCheck = true;
    this.highlightSame = true;
    this.soundEnabled = true;

    this.initAudio();
    this.bindEvents();
    this.startNewGame();
  }

  // --- Web Audio API Synth Sound Effects ---
  initAudio() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playSound(type) {
    if (!this.soundEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'select') {
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'input') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(164.81, now); // E3
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'hint') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const o = this.audioCtx.createOscillator();
          const g = this.audioCtx.createGain();
          o.connect(g);
          g.connect(this.audioCtx.destination);
          o.frequency.setValueAtTime(freq, now + idx * 0.12);
          g.gain.setValueAtTime(0.15, now + idx * 0.12);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
          o.start(now + idx * 0.12);
          o.stop(now + idx * 0.12 + 0.25);
        });
      }
    } catch (e) {
      // Audio context fallback
    }
  }

  // --- Sudoku Generation & Backtracking Solver ---
  startNewGame() {
    this.clearIntervals();
    this.generateBoard();
    this.selectedCellIndex = null;
    this.history = [];
    this.notes = Array(81).fill(null).map(() => new Set());
    this.mistakes = 0;
    this.score = 0;
    this.timerSeconds = 0;
    this.updateStatsDisplay();
    this.renderBoard();
    this.startTimer();
  }

  generateBoard() {
    // 1. Generate full solved grid
    this.solution = Array(81).fill(0);
    this.fillGrid(this.solution);

    // 2. Remove cells based on difficulty
    this.initialBoard = [...this.solution];
    const difficultyGivens = {
      easy: 44,
      medium: 34,
      hard: 28,
      expert: 24,
    };

    const givensCount = difficultyGivens[this.difficulty] || 36;
    const cellsToRemove = 81 - givensCount;

    const indices = Array.from({ length: 81 }, (_, i) => i);
    this.shuffle(indices);

    for (let i = 0; i < cellsToRemove; i++) {
      this.initialBoard[indices[i]] = 0;
    }

    this.currentBoard = [...this.initialBoard];
  }

  fillGrid(board) {
    const findEmpty = (b) => b.indexOf(0);
    const emptyIdx = findEmpty(board);
    if (emptyIdx === -1) return true;

    const row = Math.floor(emptyIdx / 9);
    const col = emptyIdx % 9;
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.shuffle(nums);

    for (let num of nums) {
      if (this.isValid(board, row, col, num)) {
        board[emptyIdx] = num;
        if (this.fillGrid(board)) return true;
        board[emptyIdx] = 0;
      }
    }
    return false;
  }

  isValid(board, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (board[row * 9 + i] === num && i !== col) return false;
      if (board[i * 9 + col] === num && i !== row) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curRow = boxRow + r;
        const curCol = boxCol + c;
        if ((curRow !== row || curCol !== col) && board[curRow * 9 + curCol] === num) {
          return false;
        }
      }
    }
    return true;
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // --- UI Renderers ---
  renderBoard() {
    const boardEl = document.getElementById('sudoku-board');
    boardEl.innerHTML = '';

    for (let i = 0; i < 81; i++) {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const cellVal = this.currentBoard[i];
      const isGiven = this.initialBoard[i] !== 0;

      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (isGiven) {
        cell.classList.add('given');
        cell.textContent = cellVal;
      } else if (cellVal !== 0) {
        cell.textContent = cellVal;
        if (this.autoCheck && cellVal !== this.solution[i]) {
          cell.classList.add('error');
        }
      } else if (this.notes[i].size > 0) {
        const notesGrid = document.createElement('div');
        notesGrid.className = 'notes-grid';
        for (let n = 1; n <= 9; n++) {
          const noteSpan = document.createElement('span');
          noteSpan.className = 'note-num';
          if (this.notes[i].has(n)) {
            noteSpan.textContent = n;
          }
          notesGrid.appendChild(noteSpan);
        }
        cell.appendChild(notesGrid);
      }

      if (i === this.selectedCellIndex) {
        cell.classList.add('selected');
      }

      if (this.highlightSame && this.selectedCellIndex !== null) {
        const selVal = this.currentBoard[this.selectedCellIndex];
        if (selVal !== 0 && cellVal === selVal) {
          cell.classList.add('same-number');
        }
      }

      cell.addEventListener('click', () => this.selectCell(i));
      boardEl.appendChild(cell);
    }
  }

  selectCell(index) {
    this.selectedCellIndex = index;
    this.playSound('select');
    this.renderBoard();
  }

  // --- Input Controls & Tools ---
  inputNumber(num) {
    if (this.selectedCellIndex === null) return;
    const index = this.selectedCellIndex;
    if (this.initialBoard[index] !== 0) return; // Cannot edit givens

    this.saveStateHistory();

    if (this.pencilMode) {
      if (this.notes[index].has(num)) {
        this.notes[index].delete(num);
      } else {
        this.notes[index].add(num);
      }
      this.currentBoard[index] = 0;
      this.playSound('input');
    } else {
      this.notes[index].clear();
      this.currentBoard[index] = num;

      if (num === this.solution[index]) {
        this.score += 50;
        this.playSound('input');
        this.checkVictory();
      } else {
        this.mistakes++;
        this.playSound('error');
        if (this.mistakes >= this.maxMistakes && this.autoCheck) {
          // Game Over alert or reset
        }
      }
    }

    this.updateStatsDisplay();
    this.renderBoard();
  }

  eraseCell() {
    if (this.selectedCellIndex === null) return;
    const index = this.selectedCellIndex;
    if (this.initialBoard[index] !== 0) return;

    this.saveStateHistory();
    this.currentBoard[index] = 0;
    this.notes[index].clear();
    this.playSound('select');
    this.renderBoard();
  }

  provideHint() {
    if (this.selectedCellIndex === null) {
      // Find first empty cell
      this.selectedCellIndex = this.currentBoard.findIndex(v => v === 0);
    }
    if (this.selectedCellIndex === -1 || this.selectedCellIndex === null) return;

    const index = this.selectedCellIndex;
    if (this.initialBoard[index] !== 0) return;

    this.saveStateHistory();
    this.currentBoard[index] = this.solution[index];
    this.notes[index].clear();
    this.score = Math.max(0, this.score - 20);
    this.playSound('hint');
    this.updateStatsDisplay();
    this.renderBoard();
    this.checkVictory();
  }

  solvePuzzle() {
    this.saveStateHistory();
    this.currentBoard = [...this.solution];
    this.notes = Array(81).fill(null).map(() => new Set());
    this.renderBoard();
    this.checkVictory();
  }

  saveStateHistory() {
    this.history.push({
      board: [...this.currentBoard],
      notes: this.notes.map(set => new Set(set)),
    });
    if (this.history.length > 30) this.history.shift();
  }

  undo() {
    if (this.history.length === 0) return;
    const lastState = this.history.pop();
    this.currentBoard = [...lastState.board];
    this.notes = lastState.notes.map(set => new Set(set));
    this.playSound('select');
    this.renderBoard();
  }

  checkVictory() {
    const isComplete = this.currentBoard.every((val, idx) => val === this.solution[idx]);
    if (isComplete) {
      this.clearIntervals();
      this.playSound('victory');
      document.getElementById('final-time').textContent = this.formatTime(this.timerSeconds);
      document.getElementById('final-score').textContent = this.score.toLocaleString();
      document.getElementById('victory-modal').classList.add('active');
    }
  }

  // --- Timer & Stats ---
  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timerSeconds++;
      document.getElementById('timer-display').textContent = this.formatTime(this.timerSeconds);
    }, 1000);
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padLeft ? Math.floor(seconds / 60).toString().padStart(2, '0') : (seconds < 600 ? '0' : '') + Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  updateStatsDisplay() {
    document.getElementById('mistakes-display').textContent = `${this.mistakes} / ${this.maxMistakes}`;
    document.getElementById('score-display').textContent = this.score;
  }

  clearIntervals() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  // --- Event Listeners ---
  bindEvents() {
    // Keypad number buttons
    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num);
        this.inputNumber(num);
      });
    });

    // Action tools
    document.getElementById('btn-erase').addEventListener('click', () => this.eraseCell());
    document.getElementById('btn-hint').addEventListener('click', () => this.provideHint());
    document.getElementById('btn-undo').addEventListener('click', () => this.undo());
    document.getElementById('btn-solve').addEventListener('click', () => this.solvePuzzle());
    document.getElementById('btn-new-game').addEventListener('click', () => this.startNewGame());
    document.getElementById('btn-modal-new-game').addEventListener('click', () => {
      document.getElementById('victory-modal').classList.remove('active');
      this.startNewGame();
    });

    // Pencil Mode Toggle
    const pencilBtn = document.getElementById('btn-pencil');
    pencilBtn.addEventListener('click', () => {
      this.pencilMode = !this.pencilMode;
      pencilBtn.classList.toggle('active', this.pencilMode);
    });

    // Difficulty Selectors
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.difficulty = btn.dataset.diff;
        this.startNewGame();
      });
    });

    // Toggles
    document.getElementById('toggle-auto-check').addEventListener('change', (e) => {
      this.autoCheck = e.target.checked;
      this.renderBoard();
    });

    document.getElementById('toggle-highlight-same').addEventListener('change', (e) => {
      this.highlightSame = e.target.checked;
      this.renderBoard();
    });

    document.getElementById('toggle-sound').addEventListener('change', (e) => {
      this.soundEnabled = e.target.checked;
    });

    // Keyboard Shortcuts Navigation
    document.addEventListener('keydown', (e) => {
      if (this.selectedCellIndex === null) {
        if (['1','2','3','4','5','6','7','8','9','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
          this.selectedCellIndex = 0;
          this.renderBoard();
        }
        return;
      }

      let row = Math.floor(this.selectedCellIndex / 9);
      let col = this.selectedCellIndex % 9;

      if (e.key >= '1' && e.key <= '9') {
        this.inputNumber(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        this.eraseCell();
      } else if (e.key === 'ArrowUp') {
        row = (row - 1 + 9) % 9;
        this.selectCell(row * 9 + col);
      } else if (e.key === 'ArrowDown') {
        row = (row + 1) % 9;
        this.selectCell(row * 9 + col);
      } else if (e.key === 'ArrowLeft') {
        col = (col - 1 + 9) % 9;
        this.selectCell(row * 9 + col);
      } else if (e.key === 'ArrowRight') {
        col = (col + 1) % 9;
        this.selectCell(row * 9 + col);
      } else if (e.key.toLowerCase() === 'n') {
        pencilBtn.click();
      } else if (e.key.toLowerCase() === 'h') {
        this.provideHint();
      } else if (e.key.toLowerCase() === 'u') {
        this.undo();
      }
    });
  }
}

// Instantiate Sudoku Game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.sudokuGame = new SudokuEngine();
});
