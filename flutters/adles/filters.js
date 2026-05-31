const fs = require('fs');
const path = require('path');

class AdFilter {
  constructor() {
    this.blocklist = new Set();
    this.loadBlocklist();
  }

  loadBlocklist() {
    const blocklistPath = path.join(__dirname, 'blocklist.txt');
    const content = fs.readFileSync(blocklistPath, 'utf8');
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        this.blocklist.add(line.toLowerCase());
      }
    });
    
    console.log(`Loaded ${this.blocklist.size} blocked domains`);
  }

  shouldBlock(url) {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      // Check exact match
      if (this.blocklist.has(hostname)) {
        return true;
      }
      
      // Check subdomain match
      for (const blocked of this.blocklist) {
        if (hostname.endsWith('.' + blocked) || hostname === blocked) {
          return true;
        }
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }
}

module.exports = AdFilter;
