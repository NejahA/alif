// Réni Ad Blocker - Content Script
// Hides ad placeholders after page load to remove empty spaces

// Elements that should NEVER be hidden (critical page elements)
const EXCLUDED_ELEMENTS = [
  'video',
  'ytd-player',
  '#movie_player',
  'div#player-container',
  'div#player',
  'div.ytp-chrome-top',
  'div.ytp-chrome-bottom',
  'div.html5-video-container',
  'ytd-watch-flexy',
  'ytd-watch-metadata',
  '[class*="ytd-watch"]',
  '[class*="ytp-"]',
  '[id*="player"]'
];

function isExcluded(element) {
  if (!element || !element.matches) return true;
  const tag = element.tagName ? element.tagName.toLowerCase() : '';
  if (tag === 'video' || tag === 'audio') return true;
  
  const id = element.id || '';
  const className = element.className || '';
  
  // Check if any exclusion matches
  for (const selector of EXCLUDED_ELEMENTS) {
    try {
      if (element.matches(selector)) return true;
    } catch(e) {
      // Skip invalid selectors
    }
  }
  
  return false;
}

function isWithinExcludedContainer(element) {
  if (!element) return false;
  let current = element.parentElement;
  while (current) {
    if (isExcluded(current)) return true;
    current = current.parentElement;
  }
  return false;
}

const AD_SELECTORS = [
  // Generic ad containers (more specific to avoid false positives)
  'div[class*="-ad-"]',
  'div[class*="_ad_"]',
  'div[class^="ad-"]',
  'div[class^="Ad-"]',
  'div[id^="ad-"]',
  'div[id^="Ad-"]',
  'div[id*="-ad-"]',
  'div[id*="_ad_"]',
  'div[class*="advertisement"]',
  'div[id*="advertisement"]',
  'div[class*="sponsored"]',
  'div[id*="sponsored"]',
  'div[class*="sponsor"]',
  'div[id*="sponsor"]',
  'div[class*="promo-ad"]',
  'div[id*="promo-ad"]',
  'div[class*="banner-ad"]',
  'div[id*="banner-ad"]',
  'ins.adsbygoogle',
  'div[data-ad]',
  'div[data-adunit]',
  'div[data-google-query-id]',
  // YouTube specific ad selectors (precise YouTube ad elements only)
  'ytd-ad-slot-renderer',
  'ytd-promoted-video-renderer',
  'ytd-compact-promoted-video-renderer',
  'ytd-in-feed-ad-layout-renderer',
  'ytd-display-ad-renderer',
  'ytd-sponsored-addon-renderer',
  'ytd-mealbar-promo-renderer',
  'ytd-video-masthead-ad-adapter',
  'ytd-search-panel-ad-renderer',
  'ytd-ad-slot-renderer:not(ytd-ad-slot-renderer:empty)',
  '#pla-shelf',
  'ytd-playlist-panel-renderer:has(ytd-ad-slot-renderer)',
  // YouTube video ad overlay
  '.ytp-ad-player-overlay',
  '.ytp-ad-image-overlay',
  '.ytp-ad-text-overlay',
  '.ytp-ad-skip-button-container',
  '.video-ads',
  '.ytp-ad-progress',
  '.ytp-ad-module',
  // Facebook specific
  'div[data-pagelet*="ad"]',
  'div[aria-label*="Sponsored"]',
  'div[aria-label*="Ad"]',
  // Generic containers with known ad class patterns
  '.ad-container',
  '.ad-wrapper',
  '.ad-box',
  '.ad-wrap',
  '.ad-slot',
  '.ad-unit',
  '.adsbygoogle',
  '.adsbox',
  '.ad-content',
  '.sponsored-content',
  '.sponsored-post',
  '.sponsored-text'
];

function shouldHideElement(el) {
  if (!el || !el.parentNode) return false;
  if (isExcluded(el)) return false;
  if (isWithinExcludedContainer(el)) return false;
  return true;
}

function sanitizeSelector(selector) {
  // Only keep safe characters in selectors to prevent injection
  return selector.replace(/[^\w\-#.:\s[\]*=^$()]/g, '');
}

function hideAds() {
  AD_SELECTORS.forEach(selector => {
    try {
      const sanitized = sanitizeSelector(selector);
      document.querySelectorAll(sanitized).forEach(el => {
        if (shouldHideElement(el) && el.parentNode) {
          el.style.setProperty('display', 'none', 'important');
        }
      });
    } catch (e) {
      // Silently handle invalid selectors
    }
  });
  
  // Specifically handle YouTube Masthead ads (top of homepage)
  try {
    const mastheadAd = document.querySelector('#masthead-ad');
    if (mastheadAd && !isWithinExcludedContainer(mastheadAd)) {
      mastheadAd.style.setProperty('display', 'none', 'important');
    }
  } catch(e) {
    // Ignore
  }
}

// Run immediately on document start
if (document.readyState === 'loading') {
  hideAds();
}

// Run again after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  hideAds();
});

// Use MutationObserver instead of setInterval for better performance
let observer = null;
let observerTimeout = null;

function setupObserver() {
  if (observer) observer.disconnect();
  if (observerTimeout) clearTimeout(observerTimeout);
  
  observer = new MutationObserver((mutations) => {
    // Only scan if new nodes were added
    const hasNewNodes = mutations.some(m => m.addedNodes.length > 0);
    if (hasNewNodes) {
      hideAds();
    }
  });
  
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false
    });
  }
  
  // Disconnect observer after 15 seconds to save resources
  observerTimeout = setTimeout(() => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }, 15000);
}

// Set up observer after full page load
if (document.readyState === 'complete') {
  setupObserver();
} else {
  window.addEventListener('load', () => {
    setupObserver();
  });
}