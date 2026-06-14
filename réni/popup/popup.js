// Réni Ad Blocker - Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const blockedCount = document.getElementById('blockedCount');
  const totalBlocked = document.getElementById('totalBlocked');
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusText = document.getElementById('statusText');
  const resetBtn = document.getElementById('resetBtn');

  // Load stats from background
  chrome.runtime.sendMessage({ type: 'getStats' }, (response) => {
    if (response) {
      blockedCount.textContent = response.currentPageBlocked || 0;
      totalBlocked.textContent = response.totalBlocked || 0;
      toggleSwitch.checked = response.enabled;
      statusText.textContent = response.enabled ? 'Active' : 'Paused';
    }
  });

  // Toggle blocker
  toggleSwitch.addEventListener('change', () => {
    const enabled = toggleSwitch.checked;
    chrome.runtime.sendMessage({ type: 'toggleEnabled' }, (response) => {
      if (response) {
        statusText.textContent = response.enabled ? 'Active' : 'Paused';
        toggleSwitch.checked = response.enabled;
      }
    });
  });

  // Reset stats
  resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'resetCounts' }, () => {
      blockedCount.textContent = '0';
      totalBlocked.textContent = '0';
    });
  });
});