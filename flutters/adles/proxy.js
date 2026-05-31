const http = require('http');
const https = require('https');
const url = require('url');
const AdFilter = require('./filters');

const PORT = 8080;
const filter = new AdFilter();

const server = http.createServer((req, res) => {
  const targetUrl = req.url;
  
  // Check if this is a proper proxy request (full URL)
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    console.log(`[INVALID] Relative URL received: ${targetUrl}`);
    res.writeHead(400, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Proxy Configuration Required</title></head>
        <body>
          <h1>Ad Blocker Proxy</h1>
          <p>This is a proxy server. Please configure your browser to use this proxy:</p>
          <ul>
            <li>Proxy Address: <strong>localhost</strong></li>
            <li>Port: <strong>${PORT}</strong></li>
          </ul>
          <p>See README.md for configuration instructions.</p>
        </body>
      </html>
    `);
    return;
  }
  
  // Parse the URL
  let parsedUrl;
  try {
    parsedUrl = url.parse(targetUrl);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request');
    return;
  }
  
  // Check if request should be blocked
  if (filter.shouldBlock(targetUrl)) {
    console.log(`[BLOCKED] ${targetUrl}`);
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Blocked by ad blocker');
    return;
  }
  
  console.log(`[ALLOWED] ${targetUrl}`);
  
  // Choose http or https module
  const protocol = parsedUrl.protocol === 'https:' ? https : http;
  const port = parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80);
  
  // Forward the request
  const options = {
    hostname: parsedUrl.hostname,
    port: port,
    path: parsedUrl.path,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = protocol.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error(`[ERROR] ${targetUrl} - ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
  });
  
  req.pipe(proxyReq);
});

server.listen(PORT, () => {
  console.log(`\n🛡️  Ad Blocker Proxy running on port ${PORT}`);
  console.log(`\nConfigure your browser/system to use:`);
  console.log(`   HTTP Proxy: localhost:${PORT}\n`);
});
