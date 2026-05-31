class IstifaTimer {
    constructor() {
        this.workDuration = 25 * 60;
        this.breakDuration = 5 * 60;
        this.longBreakDuration = 15 * 60;
        this.timeRemaining = this.workDuration;
        this.isRunning = false;
        this.isWorkMode = true;
        this.pomodoros = 0;
        this.interval = null;
        
        this.timerDisplay = document.getElementById('timer');
        this.modeDisplay = document.getElementById('mode');
        this.pomodorosDisplay = document.getElementById('pomodoros');
        this.levelDisplay = document.getElementById('level');
        this.messageDisplay = document.getElementById('message');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.materia = document.getElementById('materia');
        this.completeSound = document.getElementById('completeSound');
        
        this.messages = {
            work: [
                "Focus your energy!",
                "Limit Break charging...",
                "Materia power rising!",
                "Stay determined!",
                "Victory awaits!"
            ],
            break: [
                "Rest and recover!",
                "HP/MP restored!",
                "Take a breather!",
                "Prepare for battle!",
                "Save your progress!"
            ],
            complete: [
                "Mission Complete!",
                "Level Up!",
                "Victory Fanfare!",
                "EXP Gained!",
                "Well done, soldier!"
            ]
        };
        
        this.init();
    }
    
    init() {
        this.startBtn.addEventListener('click', () => this.toggle());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.updateDisplay();
        this.updateStats();
    }
    
    toggle() {
        if (this.isRunning) {
            this.pause();
        } else {
            this.start();
        }
    }
    
    start() {
        this.isRunning = true;
        this.startBtn.textContent = 'PAUSE';
        this.materia.classList.add('active');
        this.showRandomMessage(this.isWorkMode ? 'work' : 'break');
        
        this.interval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            
            if (this.timeRemaining <= 0) {
                this.complete();
            }
        }, 1000);
    }
    
    pause() {
        this.isRunning = false;
        this.startBtn.textContent = 'START';
        this.materia.classList.remove('active');
        clearInterval(this.interval);
        this.messageDisplay.textContent = 'Paused...';
    }
    
    reset() {
        this.pause();
        this.timeRemaining = this.isWorkMode ? this.workDuration : this.breakDuration;
        this.updateDisplay();
        this.messageDisplay.textContent = 'Timer reset!';
    }
    
    complete() {
        this.pause();
        this.playSound();
        this.showRandomMessage('complete');
        
        if (this.isWorkMode) {
            this.pomodoros++;
            this.updateStats();
            
            if (this.pomodoros % 4 === 0) {
                this.timeRemaining = this.longBreakDuration;
                this.modeDisplay.textContent = 'LONG BREAK';
            } else {
                this.timeRemaining = this.breakDuration;
                this.modeDisplay.textContent = 'SHORT BREAK';
            }
            this.isWorkMode = false;
        } else {
            this.timeRemaining = this.workDuration;
            this.modeDisplay.textContent = 'WORK MODE';
            this.isWorkMode = true;
        }
        
        this.updateDisplay();
        
        setTimeout(() => {
            if (!this.isRunning) {
                this.showRandomMessage(this.isWorkMode ? 'work' : 'break');
            }
        }, 3000);
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateStats() {
        this.pomodorosDisplay.textContent = this.pomodoros;
        const level = Math.floor(this.pomodoros / 4) + 1;
        this.levelDisplay.textContent = level;
    }
    
    showRandomMessage(type) {
        const messages = this.messages[type];
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.messageDisplay.textContent = message;
    }
    
    playSound() {
        this.completeSound.currentTime = 0;
        this.completeSound.play().catch(() => {});
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IstifaTimer();
});
