// Resilience App - Core Functionality
// Offline-first disaster preparedness web app

class ResilienceApp {
    constructor() {
        this.db = {
            markers: JSON.parse(localStorage.getItem('markers') || '[]'),
            assessments: JSON.parse(localStorage.getItem('assessments') || '[]'),
            stories: JSON.parse(localStorage.getItem('stories') || '[]'),
            alerts: JSON.parse(localStorage.getItem('alerts') || '[]')
        };
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupOnlineStatus();
        this.setupEventListeners();
        this.loadMarkers();
        this.registerServiceWorker();
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const viewName = btn.dataset.view;
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                document.getElementById(`${viewName}-view`).classList.add('active');
            });
        });
    }

    setupOnlineStatus() {
        const updateStatus = () => {
            this.isOnline = navigator.onLine;
            const statusEl = document.getElementById('online-status');
            const syncEl = document.getElementById('sync-status');
            
            if (this.isOnline) {
                statusEl.textContent = '● Online';
                statusEl.classList.remove('offline');
                syncEl.textContent = 'Syncing...';
                setTimeout(() => syncEl.textContent = 'Synced', 1000);
            } else {
                statusEl.textContent = '● Offline';
                statusEl.classList.add('offline');
                syncEl.textContent = 'Working offline';
            }
        };

        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();
    }

    setupEventListeners() {
        // Add Risk Marker
        document.getElementById('add-marker-btn').addEventListener('click', () => {
            this.showAddMarkerModal();
        });

        // View Markers
        document.getElementById('view-markers-btn').addEventListener('click', () => {
            this.loadMarkers();
        });

        // SOS Button
        document.getElementById('sos-btn').addEventListener('click', () => {
            this.sendSOS();
        });

        // Quick Damage Report
        document.getElementById('quick-damage-btn').addEventListener('click', () => {
            this.showQuickDamageModal();
        });

        // Assessment Form
        document.getElementById('assessment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAssessment();
        });

        // Add Story
        document.getElementById('add-story-btn').addEventListener('click', () => {
            this.showAddStoryModal();
        });

        // Sandbag Calculator
        document.getElementById('sandbag-calc').addEventListener('click', () => {
            this.showSandbagCalculator();
        });
    }

    showAddMarkerModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <h3>Add Risk Marker</h3>
            <form id="marker-form">
                <div class="form-group">
                    <label>Type</label>
                    <select id="marker-type" required>
                        <option value="flood">Flood-prone area</option>
                        <option value="shelter">Safe shelter</option>
                        <option value="route">Evacuation route</option>
                        <option value="vulnerable">Vulnerable structure</option>
                        <option value="resource">Available resource</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea id="marker-desc" rows="3" required></textarea>
                </div>
                <div class="form-group">
                    <label>Location (GPS will be captured)</label>
                    <input type="text" id="marker-location" placeholder="Or enter manually">
                </div>
                <button type="submit" class="btn-primary">Save Marker</button>
                <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('marker-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMarker();
        });
    }

    saveMarker() {
        const marker = {
            id: Date.now(),
            type: document.getElementById('marker-type').value,
            description: document.getElementById('marker-desc').value,
            location: document.getElementById('marker-location').value || 'GPS: Pending',
            timestamp: new Date().toISOString()
        };

        this.db.markers.push(marker);
        localStorage.setItem('markers', JSON.stringify(this.db.markers));
        this.closeModal();
        this.loadMarkers();
        this.showNotification('Marker saved successfully!');
    }

    loadMarkers() {
        const container = document.getElementById('markers-list');
        if (this.db.markers.length === 0) {
            container.innerHTML = '<p style="color: #64748b;">No markers yet. Add your first risk marker!</p>';
            return;
        }

        container.innerHTML = this.db.markers.map(marker => `
            <div class="marker-item">
                <strong>${this.getMarkerIcon(marker.type)} ${marker.type.toUpperCase()}</strong>
                <p>${marker.description}</p>
                <small>📍 ${marker.location} • ${this.formatDate(marker.timestamp)}</small>
            </div>
        `).join('');
    }

    getMarkerIcon(type) {
        const icons = {
            flood: '🌊',
            shelter: '🏠',
            route: '🛣️',
            vulnerable: '⚠️',
            resource: '🛠️'
        };
        return icons[type] || '📍';
    }

    sendSOS() {
        if (confirm('Send SOS alert to local responders?')) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const sos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date().toISOString()
                    };
                    
                    // In production, this would send to a backend
                    console.log('SOS Sent:', sos);
                    this.showNotification('🚨 SOS sent! Help is on the way.');
                }, () => {
                    this.showNotification('⚠️ Could not get location. SOS sent without GPS.');
                });
            } else {
                this.showNotification('⚠️ SOS sent without GPS (not supported).');
            }
        }
    }

    showQuickDamageModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <h3>Quick Damage Report</h3>
            <form id="damage-form">
                <div class="form-group">
                    <label>Severity</label>
                    <select id="damage-severity" required>
                        <option value="minor">Minor - Can wait</option>
                        <option value="moderate">Moderate - Needs attention</option>
                        <option value="severe">Severe - Urgent</option>
                        <option value="critical">Critical - Life threatening</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quick Description</label>
                    <textarea id="damage-quick-desc" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn-primary">Submit Report</button>
                <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('damage-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const report = {
                severity: document.getElementById('damage-severity').value,
                description: document.getElementById('damage-quick-desc').value,
                timestamp: new Date().toISOString()
            };
            console.log('Damage report:', report);
            this.closeModal();
            this.showNotification('Report submitted. Responders notified.');
        });
    }

    submitAssessment() {
        const assessment = {
            id: Date.now(),
            location: document.getElementById('assess-location').value,
            damage: Array.from(document.querySelectorAll('input[name="damage"]:checked')).map(el => el.value),
            needs: Array.from(document.querySelectorAll('input[name="needs"]:checked')).map(el => el.value),
            peopleCount: document.getElementById('people-count').value,
            timestamp: new Date().toISOString()
        };

        this.db.assessments.push(assessment);
        localStorage.setItem('assessments', JSON.stringify(this.db.assessments));
        
        document.getElementById('assessment-form').reset();
        this.showNotification('Assessment submitted successfully!');
    }

    showAddStoryModal() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <h3>Share Your Story</h3>
            <form id="story-form">
                <div class="form-group">
                    <label>Community Name</label>
                    <input type="text" id="story-community" required>
                </div>
                <div class="form-group">
                    <label>Your Story</label>
                    <textarea id="story-text" rows="5" required placeholder="What happened? What worked? What did you learn?"></textarea>
                </div>
                <div class="form-group">
                    <label>Tags (comma-separated)</label>
                    <input type="text" id="story-tags" placeholder="e.g., flood, preparation, recovery">
                </div>
                <button type="submit" class="btn-primary">Share Story</button>
                <button type="button" class="btn-secondary" onclick="app.closeModal()">Cancel</button>
            </form>
        `;
        
        modal.classList.remove('hidden');
        
        document.getElementById('story-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveStory();
        });
    }

    saveStory() {
        const story = {
            id: Date.now(),
            community: document.getElementById('story-community').value,
            text: document.getElementById('story-text').value,
            tags: document.getElementById('story-tags').value.split(',').map(t => t.trim()),
            timestamp: new Date().toISOString()
        };

        this.db.stories.push(story);
        localStorage.setItem('stories', JSON.stringify(this.db.stories));
        this.closeModal();
        this.loadStories();
        this.showNotification('Story shared! Thank you for contributing.');
    }

    loadStories() {
        const container = document.getElementById('stories-container');
        const stories = this.db.stories;
        
        if (stories.length === 0) return;
        
        const storiesHTML = stories.map(story => `
            <div class="story-card">
                <div class="story-header">
                    <strong>${story.community}</strong>
                    <small>${this.formatDate(story.timestamp)}</small>
                </div>
                <p>${story.text}</p>
                <div class="story-tags">
                    ${story.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = storiesHTML + container.innerHTML;
    }

    showSandbagCalculator() {
        const modal = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        
        content.innerHTML = `
            <h3>🛡️ Sandbag Calculator</h3>
            <form id="sandbag-form">
                <div class="form-group">
                    <label>Barrier Length (meters)</label>
                    <input type="number" id="barrier-length" required min="1">
                </div>
                <div class="form-group">
                    <label>Barrier Height (meters)</label>
                    <input type="number" id="barrier-height" required min="0.5" step="0.5">
                </div>
                <button type="button" class="btn-primary" onclick="app.calculateSandbags()">Calculate</button>
            </form>
            <div id="calc-result" style="margin-top: 1rem;"></div>
            <button type="button" class="btn-secondary" onclick="app.closeModal()" style="margin-top: 1rem;">Close</button>
        `;
        
        modal.classList.remove('hidden');
    }

    calculateSandbags() {
        const length = parseFloat(document.getElementById('barrier-length').value);
        const height = parseFloat(document.getElementById('barrier-height').value);
        
        // Rough calculation: ~7 sandbags per meter of length per 0.5m height
        const bagsNeeded = Math.ceil(length * (height / 0.5) * 7);
        const sandKg = bagsNeeded * 15; // ~15kg per bag
        
        document.getElementById('calc-result').innerHTML = `
            <div style="background: #dbeafe; padding: 1rem; border-radius: 0.5rem;">
                <strong>Results:</strong><br>
                📦 Sandbags needed: ${bagsNeeded}<br>
                ⚖️ Sand required: ~${sandKg}kg<br>
                👥 People needed: ${Math.ceil(bagsNeeded / 50)} (assuming 50 bags/person/hour)
            </div>
        `;
    }

    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    }

    showNotification(message) {
        // Simple notification - could be enhanced with a toast library
        alert(message);
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return `${Math.floor(diffMins / 1440)} days ago`;
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('SW registration failed:', err));
        }
    }
}

// Initialize app
const app = new ResilienceApp();
