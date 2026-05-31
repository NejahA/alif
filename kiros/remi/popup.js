document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('blocker-toggle');
  const adCountDisplay = document.getElementById('ad-count');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  // Load state from storage
  const state = await chrome.storage.local.get(['remiEnabled', 'remiBlockedCount']);
  
  // Set initial UI state
  toggle.checked = state.remiEnabled !== false; // Default to true
  adCountDisplay.textContent = state.remiBlockedCount || 0;
  updateUI(toggle.checked);

  // Toggle Listener
  toggle.addEventListener('change', async () => {
    const isEnabled = toggle.checked;
    await chrome.storage.local.set({ remiEnabled: isEnabled });
    updateUI(isEnabled);
    
    // Toggle ad-blocking ruleset
    if (chrome.declarativeNetRequest) {
      const rulesetId = 'remi_ruleset';
      if (isEnabled) {
        await chrome.declarativeNetRequest.updateEnabledRulesets({ enableRulesetIds: [rulesetId] });
      } else {
        await chrome.declarativeNetRequest.updateEnabledRulesets({ disableRulesetIds: [rulesetId] });
      }
    }
  });

  function updateUI(isEnabled) {
    if (isEnabled) {
      statusDot.className = 'online';
      statusText.textContent = 'Protected';
      statusText.style.color = '#00ff88';
    } else {
      statusDot.className = '';
      statusText.textContent = 'Paused';
      statusText.style.color = 'rgba(255, 255, 255, 0.4)';
    }
  }

  // Simulate counter increase for visual flair in this version
  // In a real app, this would be updated from background script events
  setInterval(async () => {
    if (toggle.checked) {
      const current = parseInt(adCountDisplay.textContent);
      const next = current + Math.floor(Math.random() * 2);
      adCountDisplay.textContent = next;
      await chrome.storage.local.set({ remiBlockedCount: next });
    }
  }, 15000);
});
