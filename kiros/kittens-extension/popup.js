// Track replaced images count
let replacedCount = 0;

// Update stats display
const updateStats = () => {
  document.getElementById('stats').textContent = `${replacedCount} images replaced`;
};

// Refresh current tab
document.getElementById('refresh').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'imageReplaced') {
    replacedCount++;
    updateStats();
  }
});

// Initial stats update
updateStats();
