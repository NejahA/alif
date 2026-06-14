// Réni Ad Blocker - Background Service Worker
const STORAGE_KEY = 'reni_blocked_counts';

// Initialize storage on install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      [STORAGE_KEY]: {},
      enabled: true,
      total_blocked: 0
    });
  }
});

// Listen for blocked requests from declarativeNetRequest
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  const tabId = info.request.tabId;
  if (tabId === -1) return;

  // Update blocked count for the tab
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const counts = result[STORAGE_KEY] || {};
    counts[tabId] = (counts[tabId] || 0) + 1;
    chrome.storage.local.set({ [STORAGE_KEY]: counts });
  });
});

// Track total blocked count
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStats') {
    chrome.storage.local.get(['total_blocked', STORAGE_KEY, 'enabled'], (result) => {
      const tabCounts = result[STORAGE_KEY] || {};
      const currentTabBlocked = tabCounts[sender.tab?.id] || 0;
      sendResponse({
        totalBlocked: result.total_blocked || 0,
        currentPageBlocked: currentTabBlocked,
        enabled: result.enabled !== false
      });
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === 'toggleEnabled') {
    chrome.storage.local.get(['enabled'], (result) => {
      const newEnabled = result.enabled === false;
      chrome.storage.local.set({ enabled: newEnabled });
      
      // Update declarativeNetRequest enabled state
      if (newEnabled) {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          enableRulesetIds: ['ads_ruleset', 'tracker_ruleset', 'annoyance_ruleset']
        });
      } else {
        chrome.declarativeNetRequest.updateEnabledRulesets({
          disableRulesetIds: ['ads_ruleset', 'tracker_ruleset', 'annoyance_ruleset']
        });
      }
      
      sendResponse({ enabled: newEnabled });
    });
    return true;
  }

  if (message.type === 'resetCounts') {
    chrome.storage.local.set({
      [STORAGE_KEY]: {},
      total_blocked: 0
    });
    sendResponse({ success: true });
    return true;
  }
});

// Handle keyboard shortcut commands (optional)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-reni') {
    chrome.runtime.sendMessage({ type: 'toggleEnabled' });
  }
});