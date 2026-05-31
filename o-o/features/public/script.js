document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Icons
    lucide.createIcons();

    // -- State Data --
    let currentEnv = 'Production';
    let baseFeatures = [];
    let abTests = [];
    let roadmapItems = [];
    let chartData = [];

    // Fetch initial data from API
    try {
        const [featuresRes, abRes, roadmapRes, analyticsRes] = await Promise.all([
            fetch('/api/features'),
            fetch('/api/abtests'),
            fetch('/api/roadmap'),
            fetch('/api/analytics')
        ]);
        
        baseFeatures = await featuresRes.json();
        abTests = await abRes.json();
        roadmapItems = await roadmapRes.json();
        chartData = await analyticsRes.json();

        // Initial Renders that depend on data
        updateStats();
        renderFeatures();
        renderABTests();
        renderRoadmap();
        // Chart renders on tab click usually, but if analytics is active, render it
        if(document.getElementById('analytics').classList.contains('active-section')) {
            renderChart();
        }
        
    } catch(err) {
        console.error("Failed to fetch data from DB", err);
    }

    // -- Navigation Logic --
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    const sectionTitles = {
        'dashboard': { title: 'Feature Dashboard', sub: 'Manage feature flags and global configurations.' },
        'ab-tests': { title: 'A/B Testing', sub: 'Control rollout percentages for beta features.' },
        'roadmap': { title: 'Product Roadmap', sub: 'The future of our platform.' },
        'analytics': { title: 'Platform Analytics', sub: 'Deep dive into feature utilization and metrics.' }
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');

            sections.forEach(s => s.classList.remove('active-section'));
            document.getElementById(targetId).classList.add('active-section');

            pageTitle.textContent = sectionTitles[targetId].title;
            pageSubtitle.textContent = sectionTitles[targetId].sub;

            if(targetId === 'analytics') {
                setTimeout(renderChart, 100);
            }
        });
    });

    // -- Audit Log --
    const auditContainer = document.getElementById('audit-log-container');
    function logAction(featureName, action) {
        const time = new Date().toLocaleTimeString();
        const div = document.createElement('div');
        div.className = `audit-item ${action ? 'on' : 'off'}`;
        div.innerHTML = `
            <div class="audit-time">${time} - ${currentEnv}</div>
            <div class="audit-desc">
                Admin turned <strong>${action ? 'ON' : 'OFF'}</strong> '${featureName}'
            </div>
        `;
        auditContainer.prepend(div);
    }

    // Toggle Audit Sidebar
    const auditSidebar = document.getElementById('audit-sidebar');
    document.getElementById('toggle-audit').addEventListener('click', () => {
        auditSidebar.classList.add('open');
    });
    document.getElementById('close-audit').addEventListener('click', () => {
        auditSidebar.classList.remove('open');
    });

    // -- Theme Switcher --
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            logAction(`Theme: ${theme}`, true);
        });
    });

    // -- Environment Switcher --
    const envSelect = document.getElementById('env-select');
    const envStatus = document.getElementById('env-status');
    const chartEnvLabel = document.getElementById('chart-env-label');

    envSelect.addEventListener('change', (e) => {
        currentEnv = e.target.value;
        envStatus.textContent = `${currentEnv} Online`;
        chartEnvLabel.textContent = currentEnv;
        
        logAction(`Switched to ${currentEnv}`, true);
        
        updateStats();
        renderFeatures(document.querySelector('.filter-btn.active').textContent);
        
        if (document.getElementById('analytics').classList.contains('active-section')) {
            renderChart();
        }
    });

    // -- Dynamic Stats --
    function updateStats() {
        if(!baseFeatures.length) return;
        let activeCount = 0;
        let betaCount = 0;
        let totalUsers = 0;

        baseFeatures.forEach(f => {
            const isActive = f.envs[currentEnv];
            if (isActive) activeCount++;
            
            // "Beta" is true if it's on in Staging but not Production
            if (f.envs['Staging'] && !f.envs['Production']) betaCount++;

            let multiplier = currentEnv === 'Production' ? 1 : (currentEnv === 'Staging' ? 0.1 : 0.01);
            if (isActive) {
                totalUsers += (f.baseUsers * multiplier);
            }
        });

        document.getElementById('stat-active').textContent = activeCount;
        document.getElementById('stat-beta').textContent = betaCount;
        document.getElementById('stat-users').textContent = totalUsers.toFixed(1) + 'K';
    }

    // -- Render Dashboard Toggles --
    const togglesContainer = document.getElementById('feature-toggles-container');
    
    function renderFeatures(filter = 'All') {
        if(!baseFeatures.length) return;
        togglesContainer.innerHTML = '';
        
        let filtered = baseFeatures;
        if (filter !== 'All') {
            if(filter === 'Production') filtered = baseFeatures.filter(f => f.envs['Production']);
            if(filter === 'Development') filtered = baseFeatures.filter(f => f.envs['Development']);
            if(filter === 'Beta') filtered = baseFeatures.filter(f => f.envs['Staging'] && !f.envs['Production']);
        }
        
        filtered.forEach(feature => {
            const isActive = feature.envs[currentEnv];
            let multiplier = currentEnv === 'Production' ? 1 : (currentEnv === 'Staging' ? 0.1 : 0.01);
            const users = isActive ? (feature.baseUsers * multiplier).toFixed(1) + 'K' : '0K';

            let envLabel = 'Development';
            if (feature.envs['Production']) envLabel = 'Production';
            else if (feature.envs['Staging']) envLabel = 'Beta';

            const card = document.createElement('div');
            card.className = 'feature-card glass-card';
            card.innerHTML = `
                <div class="feature-header">
                    <div>
                        <h3 class="feature-title">${feature.name}</h3>
                        <span class="feature-env">${envLabel}</span>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${isActive ? 'checked' : ''} onchange="toggleFeature('${feature.id}', this)">
                        <span class="slider"></span>
                    </label>
                </div>
                <p class="feature-desc">${feature.desc}</p>
                <div class="feature-footer">
                    <span class="feature-users"><i data-lucide="users" style="width:14px;height:14px;"></i> ${users}</span>
                    <span style="font-size: 0.75rem; color: var(--accent-primary); font-family: monospace;">ID: ${feature.id}</span>
                </div>
            `;
            togglesContainer.appendChild(card);
        });
        lucide.createIcons();
    }

    window.toggleFeature = async (id, el) => {
        const feature = baseFeatures.find(f => f.id === id);
        if(feature) {
            feature.envs[currentEnv] = el.checked;
            logAction(feature.name, el.checked);
            updateStats();
            renderFeatures(document.querySelector('.filter-btn.active').textContent);

            try {
                await fetch(`/api/features/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ envs: feature.envs })
                });
            } catch (err) {
                console.error("Failed to update feature", err);
            }
        }
    };

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFeatures(btn.textContent);
        });
    });

    // -- Render A/B Tests --
    const abContainer = document.getElementById('ab-tests-container');
    function renderABTests() {
        if(!abTests.length) return;
        abContainer.innerHTML = '';
        abTests.forEach(test => {
            const div = document.createElement('div');
            div.className = 'ab-item';
            div.innerHTML = `
                <div class="ab-header">
                    <span class="ab-title">${test.name} <span style="font-size: 0.7rem; font-family: monospace; color: var(--text-secondary); margin-left: 8px;">${test.id}</span></span>
                    <span class="ab-percentage" id="val-${test.id}">${test.percentage}%</span>
                </div>
                <div class="ab-slider-container">
                    <span style="font-size:0.8rem;">0%</span>
                    <input type="range" min="0" max="100" value="${test.percentage}" class="ab-slider" id="slider-${test.id}">
                    <span style="font-size:0.8rem;">100%</span>
                </div>
            `;
            abContainer.appendChild(div);

            const slider = div.querySelector(`#slider-${test.id}`);
            const val = div.querySelector(`#val-${test.id}`);
            
            slider.addEventListener('input', (e) => {
                val.textContent = e.target.value + '%';
            });
            
            slider.addEventListener('change', async (e) => {
                const newPercentage = parseInt(e.target.value);
                logAction(`A/B Test ${test.name} rollout set to ${newPercentage}%`, true);
                
                try {
                    await fetch(`/api/abtests/${test.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ percentage: newPercentage })
                    });
                } catch (err) {
                    console.error("Failed to update A/B test", err);
                }
            });
        });
    }

    // -- Render Roadmap --
    const timelineContainer = document.getElementById('timeline-container');
    function renderRoadmap() {
        if(!roadmapItems.length) return;
        timelineContainer.innerHTML = '';
        roadmapItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'timeline-item';
            div.innerHTML = `
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <h3 style="font-size: 1.1rem; margin-bottom: 8px;">${item.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.4;">${item.desc}</p>
                </div>
            `;
            timelineContainer.appendChild(div);
        });
    }

    // -- Render Analytics Chart --
    function renderChart() {
        if(!chartData.length) return;
        const chart = document.getElementById('usage-chart');
        const labels = document.getElementById('chart-labels');
        chart.innerHTML = '';
        labels.innerHTML = '';

        const envMultiplier = currentEnv === 'Production' ? 1 : (currentEnv === 'Staging' ? 0.5 : 0.2);

        chartData.forEach((data, index) => {
            const dynamicVal = Math.floor(data.val * envMultiplier + (Math.random() * 10));

            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.setAttribute('data-val', dynamicVal + 'k');
            bar.style.height = '0%';
            chart.appendChild(bar);

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = data.label;
            labels.appendChild(label);

            setTimeout(() => {
                bar.style.height = `${dynamicVal}%`;
            }, index * 100 + 50);
        });
    }

    // -- Command Palette Logic --
    const overlay = document.getElementById('command-overlay');
    const input = document.getElementById('command-input');
    const results = document.getElementById('search-results');

    const openCommandPalette = () => {
        overlay.classList.add('active');
        input.value = '';
        input.focus();
        renderSearchResults('');
    };

    const closeCommandPalette = () => {
        overlay.classList.remove('active');
    };

    document.getElementById('open-command').addEventListener('click', openCommandPalette);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
        }
        if (e.key === 'Escape') {
            closeCommandPalette();
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeCommandPalette();
        }
    });

    const renderSearchResults = (query) => {
        results.innerHTML = '';
        const q = query.toLowerCase();
        
        const navOptions = [
            { icon: 'layout-dashboard', text: 'Go to Dashboard', action: () => navItems[0].click() },
            { icon: 'split', text: 'Go to A/B Tests', action: () => navItems[1].click() },
            { icon: 'map', text: 'Go to Roadmap', action: () => navItems[2].click() },
            { icon: 'bar-chart-2', text: 'Go to Analytics', action: () => navItems[3].click() },
            { icon: 'activity', text: 'Open Audit Log', action: () => document.getElementById('toggle-audit').click() }
        ];

        let combined = [...navOptions];
        
        if (q) {
            combined = combined.filter(o => o.text.toLowerCase().includes(q));
            
            baseFeatures.forEach(f => {
                if(f.name.toLowerCase().includes(q)) {
                    combined.push({
                        icon: 'toggle-right',
                        text: `Toggle Feature: ${f.name} in ${currentEnv}`,
                        action: () => {
                            navItems[0].click();
                            setTimeout(() => {
                                f.envs[currentEnv] = !f.envs[currentEnv];
                                window.toggleFeature(f.id, { checked: f.envs[currentEnv] });
                            }, 300);
                        }
                    });
                }
            });
        }

        if(combined.length === 0) {
            results.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No results found for "${query}"</div>`;
            return;
        }

        combined.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `result-item ${index === 0 && q !== '' ? 'selected' : ''}`;
            div.innerHTML = `
                <i data-lucide="${item.icon}"></i>
                <span>${item.text}</span>
            `;
            div.addEventListener('click', () => {
                item.action();
                closeCommandPalette();
            });
            results.appendChild(div);
        });
        lucide.createIcons();
    };

    input.addEventListener('input', (e) => {
        renderSearchResults(e.target.value);
    });

    // Initial load logs
    logAction('System Boot Sequence', true);
});
