class SamSum {
    constructor() {
        this.gridSize = 4;
        this.totalCells = this.gridSize * this.gridSize;
        this.numbers = [];
        this.selectedIndex = null;
        this.score = 0;
        this.moves = 0;
        this.targetSum = 0;
        this.isLocked = false;
        this.matchedPairs = 0;
        this.totalPairs = this.totalCells / 2;

        this.grid = document.getElementById('grid');
        this.scoreEl = document.getElementById('score');
        this.movesEl = document.getElementById('moves');
        this.messageEl = document.getElementById('message');
        this.newGameBtn = document.getElementById('new-game');

        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.newGame();
    }

    generateNumbers() {
        const nums = [];
        for (let i = 0; i < this.totalCells / 2; i++) {
            const a = Math.floor(Math.random() * 9) + 1;   // 1-9
            const b = Math.floor(Math.random() * 9) + 1;   // 1-9
            nums.push(a, b);
        }
        // Shuffle using Fisher-Yates
        for (let i = nums.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [nums[i], nums[j]] = [nums[j], nums[i]];
        }
        return nums;
    }

    newGame() {
        this.numbers = this.generateNumbers();
        this.selectedIndex = null;
        this.score = 0;
        this.moves = 0;
        this.matchedPairs = 0;
        this.isLocked = false;
        this.messageEl.classList.add('hidden');
        this.messageEl.className = 'message hidden';

        // Pick a random pair's sum as the target
        const pairStart = Math.floor(Math.random() * (this.totalCells / 2)) * 2;
        this.targetSum = this.numbers[pairStart] + this.numbers[pairStart + 1];

        this.updateScore();
        this.renderGrid();
    }

    renderGrid() {
        this.grid.innerHTML = '';
        for (let i = 0; i < this.totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = this.numbers[i];
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            this.grid.appendChild(cell);
        }
    }

    getCell(index) {
        return this.grid.children[index];
    }

    showMessage(text, type) {
        this.messageEl.textContent = text;
        this.messageEl.className = `message ${type}`;
    }

    handleCellClick(index) {
        if (this.isLocked) return;

        const cell = this.getCell(index);
        if (cell.classList.contains('matched')) return;
        if (this.selectedIndex === index) {
            // Deselect
            cell.classList.remove('selected');
            this.selectedIndex = null;
            return;
        }

        if (this.selectedIndex === null) {
            // First selection
            cell.classList.add('selected');
            this.selectedIndex = index;
        } else {
            // Second selection
            const firstCell = this.getCell(this.selectedIndex);
            const firstVal = this.numbers[this.selectedIndex];
            const secondVal = this.numbers[index];

            cell.classList.add('selected');
            this.isLocked = true;
            this.moves++;
            this.updateScore();

            if (firstVal + secondVal === this.targetSum) {
                // Correct match!
                this.score += 10;
                this.matchedPairs++;
                this.updateScore();

                setTimeout(() => {
                    firstCell.classList.remove('selected');
                    firstCell.classList.add('matched');
                    cell.classList.remove('selected');
                    cell.classList.add('matched');
                    this.selectedIndex = null;
                    this.isLocked = false;

                    if (this.matchedPairs === this.totalPairs) {
                        this.showMessage(`🎉 You win! Final score: ${this.score}`, 'success');
                    } else {
                        this.showMessage(`✅ +10 points! Target sum: ${this.targetSum}`, 'success');
                    }
                }, 300);
            } else {
                // Wrong match
                firstCell.classList.add('wrong');
                cell.classList.add('wrong');
                this.score = Math.max(0, this.score - 2);
                this.updateScore();

                setTimeout(() => {
                    firstCell.classList.remove('selected', 'wrong');
                    cell.classList.remove('selected', 'wrong');
                    this.selectedIndex = null;
                    this.isLocked = false;
                    this.showMessage(`❌ Wrong pair! Target sum was: ${this.targetSum}`, 'info');
                }, 600);
            }
        }
    }

    updateScore() {
        this.scoreEl.textContent = this.score;
        this.movesEl.textContent = this.moves;
    }
}

// Start the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SamSum();
});