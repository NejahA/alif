    // Réni Ad Blocker - Content Script
// Hides ad placeholders after page load to remove empty spaces

const AD_SELECTORS = [
  // Common ad containers
  'div[class*="ad"]',
  'div[id*="ad"]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="googleads"]',
  'iframe[id*="google_ads"]',
  'div[class*="google_ads"]',
  'div[id*="google_ads"]',
  'div[class*="advertisement"]',
  'div[id*="advertisement"]',
  'div[class*="sponsor"]',
  'div[id*="sponsor"]',
  'div[class*="promo"]',
  'div[id*="promo"]',
  'div[class*="banner"]',
  'div[id*="banner"]',
  'ins.adsbygoogle',
  'div[data-ad]',
  'div[data-adunit]',
  'div[data-google-query-id]',
  // YouTube specific
  '.ytd-ad-slot-renderer',
  'ytd-promoted-video-renderer',
  'ytd-compact-promoted-video-renderer',
  'ytd-ad-slot-renderer',
  'ytd-in-feed-ad-layout-renderer',
  'ytd-display-ad-renderer',
  'ytd-sponsored-addon-renderer',
  'ytd-mealbar-promo-renderer',
  'ytd-video-masthead-ad-adapter',
  'ytd-search-panel-ad-renderer',
  'tp-yt-paper-dialog[class*="style-dialog"]',
  // Facebook specific
  'div[data-pagelet*="ad"]',
  'div[aria-label*="Sponsored"]',
  'div[aria-label*="Ad"]',
  // Generic
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

function hideAds() {
  // Hide elements matching ad selectors
  AD_SELECTORS.forEach(selector => {
    try {
      document.querySelectorAll(selector).forEach(el => {
        if (el && el.style) {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.height = '0px';
          el.style.width = '0px';
          el.style.overflow = 'hidden';
          el.style.position = 'absolute';
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        }
      });
    } catch (e) {
      // Silently handle invalid selectors
    }
  });
}

// Run immediately on document start
hideAds();

// Run again after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    hideAds();
  });
}

// Run again after full page load
window.addEventListener('load', () => {
  hideAds();
  // Set up a mutation observer for dynamically added content
  const observer = new MutationObserver(() => {
    hideAds();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false
  });
  // Disconnect after 10 seconds to save resources
  setTimeout(() => observer.disconnect(), 10000);
});

// Handle dynamic pages like YouTube/SPA
const adInterval = setInterval(hideAds, 2000);
// Stop checking after 30 seconds to save resources
setTimeout(() => {
  clearInterval(adInterval);
}, 30000);
