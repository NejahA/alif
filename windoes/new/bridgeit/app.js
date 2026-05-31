// IndexedDB setup for offline storage
let db;
const DB_NAME = 'BridgeItDB';
const DB_VERSION = 1;

// Initialize IndexedDB
function initDB() {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => console.error('Database failed to open');
    
    request.onsuccess = () => {
        db = request.result;
        loadAssessments();
        loadProjects();
    };
    
    request.onupgradeneeded = (e) => {
        db = e.target.result;
        
        if (!db.objectStoreNames.contains('assessments')) {
            db.createObjectStore('assessments', { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
        }
    };
}

// Tab navigation
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Online/Offline status
function updateOnlineStatus() {
    const statusDot = document.getElementById('onlineStatus');
    const statusText = document.getElementById('statusText');
    
    if (navigator.onLine) {
        statusDot.style.color = '#4CAF50';
        statusText.textContent = 'Online';
    } else {
        statusDot.style.color = '#FF9800';
        statusText.textContent = 'Offline';
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

// Needs Assessment Form
document.getElementById('needsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const assessment = {
        communityName: document.getElementById('communityName').value,
        primaryNeed: document.getElementById('primaryNeed').value,
        description: document.getElementById('needDescription').value,
        timestamp: new Date().toISOString(),
        photo: null
    };
    
    const photoInput = document.getElementById('needPhoto');
    if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            assessment.photo = e.target.result;
            saveAssessment(assessment);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveAssessment(assessment);
    }
    
    e.target.reset();
});

function saveAssessment(assessment) {
    const transaction = db.transaction(['assessments'], 'readwrite');
    const store = transaction.objectStore('assessments');
    store.add(assessment);
    
    transaction.oncomplete = () => {
        loadAssessments();
        alert('Assessment saved successfully!');
    };
}

function loadAssessments() {
    const transaction = db.transaction(['assessments'], 'readonly');
    const store = transaction.objectStore('assessments');
    const request = store.getAll();
    
    request.onsuccess = () => {
        const assessments = request.result;
        displayAssessments(assessments);
    };
}

function displayAssessments(assessments) {
    const container = document.getElementById('assessmentsList');
    container.innerHTML = '<h3>Saved Assessments</h3>';
    
    if (assessments.length === 0) {
        container.innerHTML += '<p class="placeholder">No assessments yet</p>';
        return;
    }
    
    assessments.reverse().forEach(assessment => {
        const card = document.createElement('div');
        card.className = 'assessment-card';
        card.innerHTML = `
            <h3>${assessment.communityName}</h3>
            <p><strong>Need:</strong> ${assessment.primaryNeed}</p>
            <p>${assessment.description}</p>
            <p><small>${new Date(assessment.timestamp).toLocaleDateString()}</small></p>
            ${assessment.photo ? `<img src="${assessment.photo}" style="max-width: 200px; margin-top: 1rem; border-radius: 4px;">` : ''}
        `;
        container.appendChild(card);
    });
}

// Design Templates
const designTemplates = {
    rainwater: {
        title: '💧 Rainwater Harvesting System',
        materials: ['Gutters', 'Storage tank (500-1000L)', 'Pipes', 'Filter mesh', 'Tap/valve'],
        steps: [
            'Install gutters along roof edges',
            'Connect downpipes to storage tank',
            'Add filter at tank inlet',
            'Install overflow pipe',
            'Add tap for water access'
        ],
        cost: '$200-500',
        time: '2-3 days'
    },
    toilet: {
        title: '🚽 Composting Toilet',
        materials: ['Concrete blocks', 'Toilet seat', 'Ventilation pipe', 'Sawdust/ash', 'Door'],
        steps: [
            'Dig two chambers (1m deep each)',
            'Build walls with blocks',
            'Install toilet platform',
            'Add ventilation pipe',
            'Create access doors for compost removal'
        ],
        cost: '$150-300',
        time: '3-5 days'
    },
    solar: {
        title: '☀️ Solar Charging Station',
        materials: ['Solar panel (100W)', 'Charge controller', 'Battery (12V)', 'USB ports', 'Mounting frame'],
        steps: [
            'Mount solar panel facing south',
            'Connect to charge controller',
            'Wire battery to controller',
            'Install USB charging ports',
            'Test all connections'
        ],
        cost: '$300-600',
        time: '1-2 days'
    },
    bridge: {
        title: '🌉 Pedestrian Bridge',
        materials: ['Timber beams', 'Concrete for foundations', 'Steel cables', 'Decking boards', 'Handrails'],
        steps: [
            'Survey site and measure span',
            'Pour concrete foundations',
            'Install main support beams',
            'Add decking and handrails',
            'Apply weatherproofing'
        ],
        cost: '$1000-3000',
        time: '1-2 weeks'
    }
};

document.querySelectorAll('.view-design-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const designType = e.target.closest('.design-card').dataset.design;
        showDesignModal(designType);
    });
});

function showDesignModal(designType) {
    const design = designTemplates[designType];
    const modal = document.getElementById('designModal');
    const details = document.getElementById('designDetails');
    
    details.innerHTML = `
        <h2>${design.title}</h2>
        <p><strong>Estimated Cost:</strong> ${design.cost}</p>
        <p><strong>Time Required:</strong> ${design.time}</p>
        
        <h3>Materials Needed:</h3>
        <ul>
            ${design.materials.map(m => `<li>${m}</li>`).join('')}
        </ul>
        
        <h3>Construction Steps:</h3>
        <ol>
            ${design.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
        
        <button onclick="createProjectFromDesign('${designType}')">Start This Project</button>
    `;
    
    modal.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('designModal').style.display = 'none';
});

window.onclick = (e) => {
    const modal = document.getElementById('designModal');
    if (e.target === modal) {
        modal.style.display = 'none';
    }
};

// Projects
document.getElementById('newProjectBtn').addEventListener('click', () => {
    const projectName = prompt('Enter project name:');
    if (projectName) {
        const project = {
            name: projectName,
            status: 'Planning',
            progress: 0,
            startDate: new Date().toISOString(),
            tasks: []
        };
        saveProject(project);
    }
});

function createProjectFromDesign(designType) {
    const design = designTemplates[designType];
    const project = {
        name: design.title,
        status: 'Planning',
        progress: 0,
        startDate: new Date().toISOString(),
        tasks: design.steps.map(step => ({ name: step, completed: false }))
    };
    saveProject(project);
    document.getElementById('designModal').style.display = 'none';
    
    // Switch to projects tab
    document.querySelector('[data-tab="projects"]').click();
}

function saveProject(project) {
    const transaction = db.transaction(['projects'], 'readwrite');
    const store = transaction.objectStore('projects');
    store.add(project);
    
    transaction.oncomplete = () => {
        loadProjects();
    };
}

function loadProjects() {
    const transaction = db.transaction(['projects'], 'readonly');
    const store = transaction.objectStore('projects');
    const request = store.getAll();
    
    request.onsuccess = () => {
        const projects = request.result;
        displayProjects(projects);
    };
}

function displayProjects(projects) {
    const container = document.getElementById('projectsList');
    
    if (projects.length === 0) {
        container.innerHTML = '<p class="placeholder">No projects yet. Create one to get started!</p>';
        return;
    }
    
    container.innerHTML = '';
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <h3>${project.name}</h3>
            <p><strong>Status:</strong> ${project.status}</p>
            <p><strong>Started:</strong> ${new Date(project.startDate).toLocaleDateString()}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
            <p>${project.progress}% Complete</p>
        `;
        container.appendChild(card);
    });
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
}

// Initialize app
initDB();
