// === Creeding Kalcioom - Game Logic ===

const state = {
    creed: 0,
    totalCreeds: 0,
    boostLevel: 1,
    creedRate: 1,
    autoInterval: null,
    unlockedMilestones: new Set(),
    nextMilestoneIndex: 0,
    milestoneTargets: [10, 50, 200, 1000],
};

const DOM = {};

function cacheDOM() {
    DOM.creedValue = document.getElementById('creedValue');
    DOM.creedBar = document.getElementById('creedBar');
    DOM.totalCreeds = document.getElementById('totalCreeds');
    DOM.boostLevel = document.getElementById('boostLevel');
    DOM.creedRate = document.getElementById('creedRate');
    DOM.btnCreed = document.getElementById('btnCreed');
    DOM.btnBoost = document.getElementById('btnBoost');
    DOM.btnReset = document.getElementById('btnReset');
    DOM.milestonesList = document.getElementById('milestonesList');
    DOM.stars = document.querySelector('.stars');
}

function updateUI() {
    DOM.creedValue.textContent = formatNumber(Math.floor(state.creed));
    DOM.totalCreeds.textContent = formatNumber(state.totalCreeds);
    DOM.boostLevel.textContent = state.boostLevel;
    DOM.creedRate.textContent = formatNumber(state.creedRate);

    // Update progression bar toward next milestone
    const nextTarget = state.milestoneTargets[state.nextMilestoneIndex];
    if (nextTarget) {
        const prevTarget = state.nextMilestoneIndex > 0
            ? state.milestoneTargets[state.nextMilestoneIndex - 1]
            : 0;
        const progress = (state.creed - prevTarget) / (nextTarget - prevTarget);
        DOM.creedBar.style.width = `${Math.min(Math.max(progress, 0), 1) * 100}%`;
    } else {
        DOM.creedBar.style.width = '100%';
    }
}

function formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

function addCreed(amount) {
    state.creed += amount;
    state.totalCreeds += amount;
    animateValue();
    spawnParticles();
    checkMilestones();
    updateUI();
}

function animateValue() {
    DOM.creedValue.classList.remove('pop');
    // Force reflow
    void DOM.creedValue.offsetWidth;
    DOM.creedValue.classList.add('pop');
    setTimeout(() => DOM.creedValue.classList.remove('pop'), 150);
}

function spawnParticles() {
    const emojis = ['✦', '💠', '✨', '⭐', '💫'];
    const count = 3 + Math.floor(Math.random() * 3);

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'creed-particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = (30 + Math.random() * 40) + '%';
        particle.style.top = (40 + Math.random() * 30) + '%';
        particle.style.fontSize = (1 + Math.random() * 1.5) + 'rem';
        particle.style.animationDuration = (0.8 + Math.random() * 0.6) + 's';
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1500);
    }
}

function checkMilestones() {
    while (
        state.nextMilestoneIndex < state.milestoneTargets.length &&
        state.creed >= state.milestoneTargets[state.nextMilestoneIndex]
    ) {
        const target = state.milestoneTargets[state.nextMilestoneIndex];
        state.unlockedMilestones.add(target);
        const milestoneEl = DOM.milestonesList.querySelector(
            `[data-target="${target}"]`
        );
        if (milestoneEl) {
            milestoneEl.classList.add('unlocked');
            milestoneEl.querySelector('.milestone-status').textContent = '✅';
        }
        state.nextMilestoneIndex++;

        // Bonus: +50% creed rate on milestone
        state.creedRate = Math.floor(state.creedRate * 1.5);
        restartAutoCreed();
    }
}

function handleCreed() {
    const amount = state.boostLevel;
    addCreed(amount);
}

function handleBoost() {
    const cost = 10 * state.boostLevel;
    if (state.creed >= cost) {
        state.creed -= cost;
        state.boostLevel++;
        state.creedRate = state.boostLevel;
        restartAutoCreed();
        updateUI();
    }
}

function handleReset() {
    if (state.creed <= 0 && state.totalCreeds <= 0) return;
    state.creed = 0;
    state.totalCreeds = 0;
    state.boostLevel = 1;
    state.creedRate = 1;
    state.nextMilestoneIndex = 0;
    state.unlockedMilestones.clear();
    DOM.creedBar.style.width = '0%';

    // Reset milestone visuals
    document.querySelectorAll('.milestone').forEach((el) => {
        el.classList.remove('unlocked');
        el.querySelector('.milestone-status').textContent = '🔒';
    });

    restartAutoCreed();
    updateUI();
}

function restartAutoCreed() {
    if (state.autoInterval) {
        clearInterval(state.autoInterval);
    }
    state.autoInterval = setInterval(() => {
        const rate = state.creedRate;
        if (rate > 0) {
            state.creed += rate * 0.1; // ticks every 100ms
            updateUI();
        }
    }, 100);
}

function bindEvents() {
    DOM.btnCreed.addEventListener('click', handleCreed);
    DOM.btnBoost.addEventListener('click', handleBoost);
    DOM.btnReset.addEventListener('click', handleReset);
}

function init() {
    cacheDOM();
    bindEvents();
    updateUI();
    restartAutoCreed();
}

document.addEventListener('DOMContentLoaded', init);