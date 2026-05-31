// Replace all images with cat photos
const replaceImagesWithCats = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Skip already replaced images or decorative images
    if (img.dataset.kittensReplaced || img.getAttribute('role') === 'presentation') {
      return;
    }
    
    // Get original src for potential restoration
    const originalSrc = img.src;
    
    // Generate a random cat image URL
    const catWidth = img.width || 400;
    const catHeight = img.height || 300;
    const randomCat = `https://loremflickr.com/400/300/cat?random=${Math.random()}`;
    
    // Replace the image
    img.src = randomCat;
    img.alt = 'A cute cat photo';
    img.dataset.kittensReplaced = 'true';
    img.dataset.originalSrc = originalSrc;
    
    // Add a hover tooltip showing it's a cat
    img.title = 'This is a cat! 🐱';
  });
  
  // Also replace background images
  const elementsWithBackground = document.querySelectorAll('[style*="background-image"], [style*="backgroundImage"]');
  elementsWithBackground.forEach(el => {
    const style = el.style.backgroundImage || el.style.backgroundImage;
    if (style && style.includes('url(')) {
      const randomCat = `url('https://loremflickr.com/400/300/cat?random=${Math.random()}')`;
      el.style.backgroundImage = randomCat;
    }
  });
};

// Run immediately
replaceImagesWithCats();

// Watch for new images added dynamically
const observer = new MutationObserver(() => {
  replaceImagesWithCats();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also replace images in iframes (same origin only)
try {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.addEventListener('DOMContentLoaded', () => {
        const iframeImages = iframeDoc.querySelectorAll('img');
        iframeImages.forEach(img => {
          img.src = `https://loremflickr.com/400/300/cat?random=${Math.random()}`;
          img.alt = 'A cute cat photo';
        });
      });
    } catch (e) {
      // Cross-origin iframe, skip
    }
  });
} catch (e) {
  // Ignore errors
}
