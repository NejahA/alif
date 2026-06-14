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

// Track blocked declarativeNetRequest rules (best-effort, only works in developer mode)
try {
  if (chrome.declarativeNetRequest && typeof chrome.declarativeNetRequest.onRuleMatchedDebug !== 'undefined') {
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
      const tabId = info.request.tabId;
      if (tabId === -1) return;

      chrome.storage.local.get([STORAGE_KEY, 'total_blocked'], (result) => {
        const counts = result[STORAGE_KEY] || {};
        counts[tabId] = (counts[tabId] || 0) + 1;
        const totalBlocked = (result.total_blocked || 0) + 1;
        chrome.storage.local.set({ 
          [STORAGE_KEY]: counts,
          total_blocked: totalBlocked
        });
      });
    });
  }
} catch (e) {
  // onRuleMatchedDebug only available when devtools is open, silently ignore
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getStats') {
    chrome.storage.local.get(['total_blocked', STORAGE_KEY, 'enabled'], (result) => {
      const tabCounts = result[STORAGE_KEY] || {};
      const currentTabBlocked = sender.tab?.id ? (tabCounts[sender.tab.id] || 0) : 0;
      sendResponse({
        totalBlocked: result.total_blocked || 0,
        currentPageBlocked: currentTabBlocked,
        enabled: result.enabled !== false
      });
    });
    return true;
  }

  if (message.type === 'toggleEnabled') {
    chrome.storage.local.get(['enabled'], (result) => {
      const newEnabled = result.enabled === false;
      chrome.storage.local.set({ enabled: newEnabled });
      
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

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-reni') {
    chrome.runtime.sendMessage({ type: 'toggleEnabled' });
  }
});