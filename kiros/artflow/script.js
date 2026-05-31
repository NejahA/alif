// ArtFlow - Creative Coding Platform
// Main JavaScript file

document.addEventListener('DOMContentLoaded', function() {
    // Initialize canvas and context
    const canvas = document.getElementById('artCanvas');
    const ctx = canvas.getContext('2d');
    
    // Initialize variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'brush';
    let currentColor = '#3b82f6';
    let brushSize = 10;
    
    // DOM Elements
    const codeInput = document.getElementById('codeInput');
    const runBtn = document.getElementById('runBtn');
    const saveBtn = document.getElementById('saveBtn');
    const shareBtn = document.getElementById('shareBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const brushSizeSlider = document.getElementById('brushSize');
    const brushSizeValue = document.getElementById('brushSizeValue');
    const colorPicker = document.getElementById('colorPicker');
    const toolSelect = document.getElementById('toolSelect');
    const themeToggle = document.getElementById('themeToggle');
    const shareModal = document.getElementById('shareModal');
    const closeShareModal = document.getElementById('closeShareModal');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const copyEmbedBtn = document.getElementById('copyEmbedBtn');
    const exportImageBtn = document.getElementById('exportImageBtn');
    const toolButtons = document.querySelectorAll('.tool-btn');
    
    // Initialize canvas
    function initCanvas() {
        // Ensure canvas has proper dimensions
        const container = canvas.parentElement;
        const computedStyle = getComputedStyle(container);
        
        // Set canvas size to match display size
        canvas.width = 800;
        canvas.height = 600;
        
        // Set canvas display size
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.maxWidth = '800px';
        canvas.style.maxHeight = '600px';
        
        // Set up canvas context
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Clear canvas with dark background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Run initial code
        runCode();
    }
    
    // Run code from editor
    function runCode() {
        try {
            // Clear canvas first
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Get code from editor
            const code = codeInput.value;
            
            // Create a function from the code and execute it
            const runArtCode = new Function('canvas', 'ctx', code);
            runArtCode(canvas, ctx);
            
            console.log('Code executed successfully!');
        } catch (error) {
            console.error('Error executing code:', error);
            alert('Error in code: ' + error.message);
        }
    }
    
    // Drawing functions
    let startX = 0;
    let startY = 0;
    let tempCanvas = null;
    let tempCtx = null;
    let bufferCanvas = null;
    let bufferCtx = null;
    
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getMousePos(canvas, e);
        [startX, startY] = [lastX, lastY];
        
        // Create temporary canvas for preview if needed
        if (currentTool !== 'brush') {
            if (!tempCanvas) {
                tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx = tempCanvas.getContext('2d');
            }
            
            // Create buffer canvas to save current canvas state
            if (!bufferCanvas) {
                bufferCanvas = document.createElement('canvas');
                bufferCanvas.width = canvas.width;
                bufferCanvas.height = canvas.height;
                bufferCtx = bufferCanvas.getContext('2d');
            }
            
            // Save current canvas content to buffer
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            bufferCtx.drawImage(canvas, 0, 0);
        }
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        const [x, y] = getMousePos(canvas, e);
        
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Clear temporary canvas if exists
        if (tempCanvas && tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        switch(currentTool) {
            case 'brush':
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
                
            case 'line':
                if (tempCtx && bufferCtx) {
                    tempCtx.strokeStyle = currentColor;
                    tempCtx.lineWidth = brushSize;
                    tempCtx.beginPath();
                    tempCtx.moveTo(startX, startY);
                    tempCtx.lineTo(x, y);
                    tempCtx.stroke();
                    
                    // Draw temporary line on main canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bufferCanvas, 0, 0); // Restore original from buffer
                    ctx.drawImage(tempCanvas, 0, 0);
                }
                break;
                
            case 'circle':
                if (tempCtx && bufferCtx) {
                    const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                    tempCtx.strokeStyle = currentColor;
                    tempCtx.lineWidth = brushSize;
                    tempCtx.beginPath();
                    tempCtx.arc(startX, startY, radius, 0, Math.PI * 2);
                    tempCtx.stroke();
                    
                    // Draw temporary circle on main canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bufferCanvas, 0, 0); // Restore original from buffer
                    ctx.drawImage(tempCanvas, 0, 0);
                }
                break;
                
            case 'rectangle':
                if (tempCtx && bufferCtx) {
                    const width = x - startX;
                    const height = y - startY;
                    tempCtx.strokeStyle = currentColor;
                    tempCtx.lineWidth = brushSize;
                    tempCtx.strokeRect(startX, startY, width, height);
                    
                    // Draw temporary rectangle on main canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bufferCanvas, 0, 0); // Restore original from buffer
                    ctx.drawImage(tempCanvas, 0, 0);
                }
                break;
        }
        
        [lastX, lastY] = [x, y];
    }
    
    function stopDrawing() {
        if (!isDrawing) return;
        
        const [x, y] = [lastX, lastY];
        
        // Finalize the drawing based on tool
        switch(currentTool) {
            case 'line':
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
                
            case 'circle':
                const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
                ctx.beginPath();
                ctx.arc(startX, startY, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'rectangle':
                const width = x - startX;
                const height = y - startY;
                ctx.strokeRect(startX, startY, width, height);
                break;
        }
        
        isDrawing = false;
        ctx.beginPath();
        
        // Clear temporary canvas
        if (tempCanvas && tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // Clear buffer canvas
        if (bufferCanvas && bufferCtx) {
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        }
    }
    
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        return [
            (evt.clientX - rect.left) * scaleX,
            (evt.clientY - rect.top) * scaleY
        ];
    }
    
    // Clear canvas
    function clearCanvas() {
        // Save the current drawing state
        ctx.save();
        
        // Clear the entire canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Restore dark background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Restore the drawing state
        ctx.restore();
        
        // Clear temporary canvas if it exists
        if (tempCanvas && tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // Show notification
        showNotification('Canvas cleared!', 'info');
    }
    
    // Download canvas as image
    function downloadCanvas() {
        const link = document.createElement('a');
        link.download = 'artflow-creation.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    // Save artwork (simulated - would connect to backend in real app)
    function saveArtwork() {
        const code = codeInput.value;
        const imageData = canvas.toDataURL('image/png');
        
        // In a real app, this would send to a server
        localStorage.setItem('artflow_last_artwork', JSON.stringify({
            code: code,
            image: imageData,
            timestamp: new Date().toISOString()
        }));
        
        alert('Artwork saved locally! (In a real app, this would save to the cloud)');
    }
    
    // Share artwork
    function shareArtwork() {
        shareModal.style.display = 'flex';
    }
    
    // Copy share link
    function copyShareLink() {
        const code = codeInput.value;
        const shareableCode = btoa(encodeURIComponent(code));
        const shareUrl = `${window.location.origin}?art=${shareableCode}`;
        
        navigator.clipboard.writeText(shareUrl)
            .then(() => alert('Share link copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    }
    
    // Copy embed code
    function copyEmbedCode() {
        const embedCode = `<iframe src="${window.location.origin}" width="800" height="600" frameborder="0"></iframe>`;
        
        navigator.clipboard.writeText(embedCode)
            .then(() => alert('Embed code copied to clipboard!'))
            .catch(err => console.error('Failed to copy:', err));
    }
    
    // Export as image
    function exportAsImage() {
        downloadCanvas();
    }
    
    // Toggle theme
    function toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isDark = !document.body.classList.contains('light-theme');
        themeToggle.checked = !isDark;
        
        // Update theme in localStorage
        localStorage.setItem('artflow_theme', isDark ? 'dark' : 'light');
    }
    
    // Handle window resize
    function handleResize() {
        // Re-initialize canvas on resize
        initCanvas();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Canvas events
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                startDrawing(e.touches[0]);
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                draw(e.touches[0]);
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            stopDrawing();
        });
        
        canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            stopDrawing();
        });
        
        // Button events
        runBtn.addEventListener('click', runCode);
        saveBtn.addEventListener('click', saveArtwork);
        shareBtn.addEventListener('click', shareArtwork);
        clearBtn.addEventListener('click', clearCanvas);
        downloadBtn.addEventListener('click', downloadCanvas);
        
        // Tool selection
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                toolButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentTool = button.dataset.tool;
                toolSelect.value = currentTool;
            });
        });
        
        toolSelect.addEventListener('change', (e) => {
            currentTool = e.target.value;
            toolButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tool === currentTool);
            });
        });
        
        // Brush size
        brushSizeSlider.addEventListener('input', (e) => {
            brushSize = parseInt(e.target.value);
            brushSizeValue.textContent = brushSize;
        });
        
        // Color picker
        colorPicker.addEventListener('input', (e) => {
            currentColor = e.target.value;
        });
        
        // Theme toggle
        themeToggle.addEventListener('change', toggleTheme);
        
        // Share modal
        shareBtn.addEventListener('click', shareArtwork);
        closeShareModal.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });
        
        copyLinkBtn.addEventListener('click', copyShareLink);
        copyEmbedBtn.addEventListener('click', copyEmbedCode);
        exportImageBtn.addEventListener('click', exportAsImage);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
        
        // Refresh gallery button
        const refreshGalleryBtn = document.getElementById('refreshGalleryBtn');
        if (refreshGalleryBtn) {
            refreshGalleryBtn.addEventListener('click', refreshGallery);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to run code
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                runCode();
            }
            
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveArtwork();
            }
            
            // Ctrl/Cmd + R to refresh gallery
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                refreshGallery();
            }
            
            // Escape to close modal
            if (e.key === 'Escape') {
                shareModal.style.display = 'none';
            }
        });
        
        // Window resize event
        window.addEventListener('resize', handleResize);
    }
    
    // Load saved theme
    function loadTheme() {
        const savedTheme = localStorage.getItem('artflow_theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeToggle.checked = true;
        }
    }
    
    // Load saved artwork
    function loadSavedArtwork() {
        const saved = localStorage.getItem('artflow_last_artwork');
        if (saved) {
            try {
                const artwork = JSON.parse(saved);
                codeInput.value = artwork.code;
                // Note: In a real app, we'd load the image too
            } catch (e) {
                console.log('No saved artwork found');
            }
        }
    }
    
    // Fetch dynamic gallery data
    async function loadGallery() {
        try {
            // In a real app, this would be an API call
            // For now, we'll use mock data that can be updated
            const galleryData = [
                { 
                    id: 1, 
                    title: 'Color Waves', 
                    author: '@code_artist', 
                    likes: Math.floor(Math.random() * 100) + 20,
                    previewColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                },
                { 
                    id: 2, 
                    title: 'Sunset Glow', 
                    author: '@digital_artist', 
                    likes: Math.floor(Math.random() * 100) + 15,
                    previewColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                },
                { 
                    id: 3, 
                    title: 'Ocean Breeze', 
                    author: '@art_coder', 
                    likes: Math.floor(Math.random() * 100) + 25,
                    previewColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                },
                { 
                    id: 4, 
                    title: 'Forest Mist', 
                    author: '@nature_coder', 
                    likes: Math.floor(Math.random() * 100) + 10,
                    previewColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
                }
            ];
            
            // In a real app, you would fetch from an API:
            // const response = await fetch('https://api.artflow.com/gallery');
            // const galleryData = await response.json();
            
            updateGallery(galleryData);
        } catch (error) {
            console.error('Error loading gallery:', error);
            // Fallback to static data
            updateGallery([
                { 
                    id: 1, 
                    title: 'Color Waves', 
                    author: '@code_artist', 
                    likes: 42,
                    previewColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                },
                { 
                    id: 2, 
                    title: 'Sunset Glow', 
                    author: '@digital_artist', 
                    likes: 28,
                    previewColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' 
                },
                { 
                    id: 3, 
                    title: 'Ocean Breeze', 
                    author: '@art_coder', 
                    likes: 35,
                    previewColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
                },
                { 
                    id: 4, 
                    title: 'Forest Mist', 
                    author: '@nature_coder', 
                    likes: 19,
                    previewColor: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
                }
            ]);
        }
    }
    
    // Update gallery with dynamic data
    function updateGallery(galleryItems) {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid) return;
        
        galleryGrid.innerHTML = '';
        
        galleryItems.forEach(item => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <div class="gallery-preview" style="background: ${item.previewColor};"></div>
                <p>${item.title}</p>
                <div class="gallery-meta">
                    <span>by ${item.author}</span>
                    <span>❤️ ${item.likes}</span>
                </div>
            `;
            galleryGrid.appendChild(galleryItem);
        });
    }
    
    // Fetch community stats
    async function loadCommunityStats() {
        try {
            // In a real app, this would be an API call
            // const response = await fetch('https://api.artflow.com/stats');
            // const stats = await response.json();
            
            // Dynamic mock data
            const stats = {
                creationsToday: Math.floor(Math.random() * 2000) + 1000,
                activeArtists: Math.floor(Math.random() * 1000) + 500,
                featuredArtist: {
                    name: '@' + ['code_painter', 'digital_artist', 'art_wizard', 'pixel_master', 'color_explorer'][Math.floor(Math.random() * 5)],
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
                    creations: Math.floor(Math.random() * 100) + 10
                }
            };
            
            updateCommunityStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    // Refresh gallery data
    async function refreshGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            galleryGrid.innerHTML = '<div class="gallery-loading"><i class="fas fa-spinner fa-spin"></i><p>Loading gallery...</p></div>';
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Load fresh data
        await loadGallery();
        await loadCommunityStats();
        
        // Show success message
        showNotification('Gallery refreshed with new data!', 'success');
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
        
        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }
    
    function updateCommunityStats(stats) {
        const statsElements = {
            creations: document.querySelector('.stat:first-child h4'),
            artists: document.querySelector('.stat:last-child h4'),
            featuredArtist: document.querySelector('.featured-artist h4'),
            featuredArtistAvatar: document.querySelector('.featured-artist img')
        };
        
        if (statsElements.creations) {
            statsElements.creations.textContent = stats.creationsToday.toLocaleString();
        }
        if (statsElements.artists) {
            statsElements.artists.textContent = stats.activeArtists.toLocaleString();
        }
        if (statsElements.featuredArtist) {
            statsElements.featuredArtist.textContent = stats.featuredArtist.name;
        }
        if (statsElements.featuredArtistAvatar) {
            statsElements.featuredArtistAvatar.src = stats.featuredArtist.avatar;
        }
    }
    
    // Initialize the app
    function init() {
        initCanvas();
        setupEventListeners();
        loadTheme();
        loadSavedArtwork();
        
        // Load dynamic data
        loadGallery();
        loadCommunityStats();
        
        // Set up auto-refresh for community stats (every 30 seconds)
        setInterval(() => {
            loadCommunityStats();
            showNotification('Community stats updated!', 'info');
        }, 30000);
        
        // Set initial values
        brushSizeValue.textContent = brushSizeSlider.value;
        brushSize = parseInt(brushSizeSlider.value);
        currentColor = colorPicker.value;
        
        console.log('ArtFlow initialized! 🎨');
    }
    
    // Start the app
    init();
    
    // Add some sample code snippets
    window.artflowSamples = {
        gradientCircles: `// Gradient Circles
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Clear canvas
ctx.fillStyle = '#0f172a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Draw gradient circles
for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 40 + 20;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const hue = Math.random() * 360;
    gradient.addColorStop(0, \`hsl(\${hue}, 100%, 70%)\`);
    gradient.addColorStop(1, \`hsl(\${hue}, 100%, 30%)\`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow
    ctx.shadowColor = gradient;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}`,
        
        geometricPattern: `// Geometric Pattern
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Clear canvas
ctx.fillStyle = '#0f172a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const size = 40;
const cols = Math.ceil(canvas.width / size);
const rows = Math.ceil(canvas.height / size);

for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
        const posX = x * size;
        const posY = y * size;
        
        // Random shape
        const shape = Math.floor(Math.random() * 3);
        const hue = (x * 20 + y * 10) % 360;
        
        ctx.fillStyle = \`hsl(\${hue}, 80%, 50%)\`;
        ctx.strokeStyle = \`hsl(\${hue}, 100%, 70%)\`;
        ctx.lineWidth = 2;
        
        if (shape === 0) {
            // Circle
            ctx.beginPath();
            ctx.arc(posX + size/2, posY + size/2, size/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } else if (shape === 1) {
            // Square
            ctx.fillRect(posX + 5, posY + 5, size - 10, size - 10);
            ctx.strokeRect(posX + 5, posY + 5, size - 10, size - 10);
        } else {
            // Triangle
            ctx.beginPath();
            ctx.moveTo(posX + size/2, posY + 5);
            ctx.lineTo(posX + 5, posY + size - 5);
            ctx.lineTo(posX + size - 5, posY + size - 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
}`,
        
        waveLines: `// Wave Lines
const canvas = document.getElementById('artCanvas');
const ctx = canvas.getContext('2d');

// Clear canvas
ctx.fillStyle = '#0f172a';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const amplitude = 50;
const frequency = 0.02;
const lineCount = 10;
const lineSpacing = canvas.height / (lineCount + 1);

for (let line = 0; line < lineCount; line++) {
    const y = lineSpacing * (line + 1);
    const hue = (line * 30) % 360;
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    
    for (let x = 0; x < canvas.width; x += 5) {
        const waveY = y + Math.sin(x * frequency + line * 0.5) * amplitude;
        ctx.lineTo(x, waveY);
    }
    
    ctx.strokeStyle = \`hsl(\${hue}, 100%, 60%)\`;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Add gradient fill
    const gradient = ctx.createLinearGradient(0, y - amplitude, 0, y + amplitude);
    gradient.addColorStop(0, \`hsla(\${hue}, 100%, 60%, 0.3)\`);
    gradient.addColorStop(1, \`hsla(\${hue}, 100%, 60%, 0)\`);
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}`
    };
});
    // New tools and features
    let layers = [
        { id: 1, name: 'Background', visible: true, locked: false, opacity: 1.0 },
        { id: 2, name: 'Foreground', visible: true, locked: false, opacity: 1.0 }
    ];
    let activeLayerId = 2;
    let history = [];
    let historyIndex = -1;
    let isRecording = false;
    let animationId = null;
    let animationFrame = 0;
    let isPlaying = false;
    
    // New tool implementations
    function drawGradient(x1, y1, x2, y2, color1, color2) {
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        return gradient;
    }
    
    function drawText(text, x, y, options = {}) {
        const {
            font = '20px Arial',
            color = currentColor,
            align = 'left',
            baseline = 'top'
        } = options;
        
        ctx.save();
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    
    function fillArea(x, y, targetColor, fillColor) {
        // Simple flood fill algorithm
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const width = canvas.width;
        const height = canvas.height;
        const data = imageData.data;
        
        // Get target color at starting point
        const startX = Math.floor(x);
        const startY = Math.floor(y);
        const startIdx = (startY * width + startX) * 4;
        const targetR = data[startIdx];
        const targetG = data[startIdx + 1];
        const targetB = data[startIdx + 2];
        
        // Simple 4-direction flood fill (for demonstration)
        const stack = [[startX, startY]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const idx = (cy * width + cx) * 4;
            
            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            if (visited.has(`${cx},${cy}`)) continue;
            
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            if (r === targetR && g === targetG && b === targetB) {
                // Fill this pixel
                data[idx] = fillColor[0];
                data[idx + 1] = fillColor[1];
                data[idx + 2] = fillColor[2];
                data[idx + 3] = 255;
                
                visited.add(`${cx},${cy}`);
                
                // Add neighbors
                stack.push([cx + 1, cy]);
                stack.push([cx - 1, cy]);
                stack.push([cx, cy + 1]);
                stack.push([cx, cy - 1]);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // New tool implementations
    function handleGradientTool(x, y, x2, y2) {
        const gradient = ctx.createLinearGradient(x, y, x2, y2);
        gradient.addColorStop(0, currentColor);
        gradient.addColorStop(1, currentColor + '00'); // Transparent version
        return gradient;
    }
    
    function handleTextTool(x, y, text) {
        ctx.save();
        ctx.font = `${brushSize}px Arial`;
        ctx.fillStyle = currentColor;
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    
    function handleEraser(x, y) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    function handleFillTool(x, y) {
        const fillColor = currentColor;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const targetColor = getPixelColor(imageData, x, y);
        
        if (targetColor) {
            floodFill(ctx, x, y, targetColor, fillColor, imageData);
        }
    }
    
    // Layer management
    function addLayer(name = 'New Layer') {
        const newLayer = {
            id: layers.length + 1,
            name: name,
            visible: true,
            locked: false,
            opacity: 1.0,
            canvas: document.createElement('canvas'),
            ctx: null
        };
        newLayer.canvas.width = canvas.width;
        newLayer.canvas.height = canvas.height;
        newLayer.ctx = newLayer.canvas.getContext('2d');
        layers.push(newLayer);
        renderLayers();
        return newLayer;
    }
    
    function removeLayer(layerId) {
        const index = layers.findIndex(layer => layer.id === layerId);
        if (index > -1) {
            layers.splice(index, 1);
            renderLayers();
        }
    }
    
    function moveLayer(layerId, direction) {
        const index = layers.findIndex(l => l.id === layerId);
        if (index === -1) return;
        
        if (direction === 'up' && index > 0) {
            [layers[index], layers[index - 1]] = [layers[index - 1], layers[index]];
        } else if (direction === 'down' && index < layers.length - 1) {
            [layers[index], layers[index + 1]] = [layers[index + 1], layers[index]];
        }
        renderLayers();
    }
    
    function renderLayers() {
        // Clear the main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw all visible layers from bottom to top
        layers.forEach(layer => {
            if (layer.visible) {
                ctx.globalAlpha = layer.opacity;
                ctx.drawImage(layer.canvas, 0, 0);
            }
        });
    }
    
    // History management
    function saveState() {
        // Save current canvas state
        const state = {
            data: canvas.toDataURL(),
            layers: JSON.parse(JSON.stringify(layers))
        };
        
        // Remove future states if we're not at the end of history
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        
        history.push(state);
        historyIndex++;
        
        // Limit history size
        if (history.length > 50) {
            history.shift();
            historyIndex--;
        }
    }
    
    function undo() {
        if (historyIndex > 0) {
            historyIndex--;
            restoreState(history[historyIndex]);
        }
    }
    
    function redo() {
        if (historyIndex < history.length - 1) {
            historyIndex++;
            restoreState(history[historyIndex]);
        }
    }
    
    function restoreState(state) {
        const img = new Image();
        img.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
        img.src = state.data;
    }
    
    // Animation system
    function startAnimation() {
        if (isPlaying) return;
        
        isPlaying = true;
        animationFrame = 0;
        
        function animate() {
            if (!isPlaying) return;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw animation frame
            const time = Date.now() * 0.001;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 100;
            
            // Draw animated circles
            for (let i = 0; i < 10; i++) {
                const angle = (time * 0.5 + i * 0.5) % (Math.PI * 2);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fillStyle = `hsl(${(time * 50 + i * 36) % 360}, 100%, 50%)`;
                ctx.fill();
            }
            
            animationFrame++;
            if (isPlaying) {
                requestAnimationFrame(animate);
            }
        }
        
        animate();
    }
    
    function stopAnimation() {
        isPlaying = false;
    }
    
    // Initialize new tools
    function initNewTools() {
        // Add event listeners for new tools
        document.getElementById('addLayerBtn')?.addEventListener('click', () => {
            addLayer(`Layer ${layers.length + 1}`);
        });
        
        document.getElementById('undoBtn')?.addEventListener('click', undo);
        document.getElementById('redoBtn')?.addEventListener('click', redo);
        document.getElementById('animateBtn')?.addEventListener('click', () => {
            if (isPlaying) {
                stopAnimation();
                isPlaying = false;
            } else {
                startAnimation();
                isPlaying = true;
            }
        });
    }
    
    // Initialize new tools
    initNewTools();
    // Helper functions for new tools
    function getPixelColor(imageData, x, y) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return null;
        }
        
        const idx = (y * width + x) * 4;
        return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]];
    }
    
    function floodFill(ctx, x, y, targetColor, fillColor, imageData) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        
        const stack = [[x, y]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = `${cx},${cy}`;
            
            if (visited.has(key)) continue;
            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            
            const idx = (cy * width + cx) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            
            if (r === targetColor[0] && g === targetColor[1] && b === targetColor[2] && a === targetColor[3]) {
                // Fill this pixel
                data[idx] = fillColor[0];
                data[idx + 1] = fillColor[1];
                data[idx + 2] = fillColor[2];
                data[idx + 3] = fillColor[3] || 255;
                
                visited.add(key);
                
                // Add neighbors
                stack.push([cx + 1, cy]);
                stack.push([cx - 1, cy]);
                stack.push([cx, cy + 1]);
                stack.push([cx, cy - 1]);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Update the draw function to handle new tools
    const originalDraw = draw;
    draw = function(e) {
        if (!isDrawing) return;
        
        e.preventDefault();
        const [x, y] = getMousePos(canvas, e);
        
        // Handle new tools
        switch(currentTool) {
            case 'gradient':
                if (tempCtx && bufferCtx) {
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    
                    const gradient = tempCtx.createLinearGradient(startX, startY, x, y);
                    gradient.addColorStop(0, currentColor);
                    gradient.addColorStop(1, colorPicker.value + '80'); // Semi-transparent
                    
                    tempCtx.fillStyle = gradient;
                    tempCtx.fillRect(Math.min(startX, x), Math.min(startY, y), Math.abs(x - startX), Math.abs(y - startY));
                    
                    // Draw temporary gradient on main canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(bufferCanvas, 0, 0);
                    ctx.drawImage(tempCanvas, 0, 0);
                }
                break;
                
            case 'eraser':
                ctx.save();
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, brushSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                break;
                
            case 'text':
                // Text tool doesn't draw during mouse move
                break;
                
            case 'fill':
                // Fill tool doesn't draw during mouse move
                break;
                
            default:
                // Call original draw function for other tools
                originalDraw(e);
                break;
        }
        
        [lastX, lastY] = [x, y];
    };
    
    // Update stopDrawing to handle new tools
    const originalStopDrawing = stopDrawing;
    stopDrawing = function() {
        if (!isDrawing) return;
        
        const [x, y] = [lastX, lastY];
        
        // Handle new tools
        switch(currentTool) {
            case 'gradient':
                if (tempCtx) {
                    const gradient = ctx.createLinearGradient(startX, startY, x, y);
                    gradient.addColorStop(0, currentColor);
                    gradient.addColorStop(1, colorPicker.value + '80');
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(Math.min(startX, x), Math.min(startY, y), Math.abs(x - startX), Math.abs(y - startY));
                }
                break;
                
            case 'text':
                const text = prompt('Enter text:', 'Hello ArtFlow!');
                if (text) {
                    ctx.font = `${brushSize * 2}px Arial`;
                    ctx.fillStyle = currentColor;
                    ctx.fillText(text, x, y);
                }
                break;
                
            case 'fill':
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const targetColor = getPixelColor(imageData, Math.floor(x), Math.floor(y));
                if (targetColor) {
                    const fillColor = hexToRgb(currentColor);
                    floodFill(ctx, Math.floor(x), Math.floor(y), targetColor, fillColor, imageData);
                }
                break;
                
            default:
                // Call original stopDrawing for other tools
                originalStopDrawing();
                break;
        }
        
        isDrawing = false;
        
        // Clear temporary canvas
        if (tempCanvas && tempCtx) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // Clear buffer canvas
        if (bufferCanvas && bufferCtx) {
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        }
        
        // Save state to history
        saveState();
    };
    
    // Helper function to convert hex to RGB
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            255
        ] : [0, 0, 0, 255];
    }
    
    // Add filter functionality
    function applyFilter(filterType) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        switch(filterType) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    data[i] = avg;
                    data[i + 1] = avg;
                    data[i + 2] = avg;
                }
                break;
                
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                    data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                    data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                }
                break;
                
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i + 1] = 255 - data[i + 1];
                    data[i + 2] = 255 - data[i + 2];
                }
                break;
                
            case 'blur':
                // Simple blur effect
                ctx.filter = 'blur(2px)';
                const tempImg = new Image();
                tempImg.src = canvas.toDataURL();
                tempImg.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(tempImg, 0, 0);
                    ctx.filter = 'none';
                };
                break;
                
            case 'brightness':
                ctx.filter = 'brightness(150%)';
                const brightImg = new Image();
                brightImg.src = canvas.toDataURL();
                brightImg.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(brightImg, 0, 0);
                    ctx.filter = 'none';
                };
                break;
                
            case 'contrast':
                ctx.filter = 'contrast(150%)';
                const contrastImg = new Image();
                contrastImg.src = canvas.toDataURL();
                contrastImg.onload = function() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(contrastImg, 0, 0);
                    ctx.filter = 'none';
                };
                break;
        }
        
        if (filterType !== 'blur' && filterType !== 'brightness' && filterType !== 'contrast') {
            ctx.putImageData(imageData, 0, 0);
        }
        
        // Save state to history
        saveState();
    }
    
    // Initialize filter buttons
    function initFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterType = button.dataset.filter;
                applyFilter(filterType);
                
                // Show active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }
    
    // Initialize new features
    initFilters();
    
    // Add keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        }
        
        // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
        if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
            ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
            e.preventDefault();
            redo();
        }
    });
    
    // Initialize with a saved state
    saveState();