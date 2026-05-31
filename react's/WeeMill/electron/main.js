// Mock undici before any module requires it
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'undici') {
    return {
      request: () => {},
      get: () => {},
      Agent: class Agent {},
      Pool: class Pool {},
      FetchError: class FetchError extends Error {},
      Headers: class Headers {},
      Response: class Response {},
      Request: class Request {},
      FormData: class FormData {},
      Blob: class Blob {},
      File: class File {},
      ReadableStream: class ReadableStream {},
      WritableStream: class WritableStream {},
      TransformStream: class TransformStream {},
      TextEncoder: class TextEncoder {},
      TextDecoder: class TextDecoder {},
      queueMicrotask: (fn) => setTimeout(fn, 0),
      DOMException: class DOMException extends Error {}
    };
  }
  return originalRequire.call(this, id);
};

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const http = require('http');
const https = require('https');
const htmlparser2 = require('htmlparser2');

// Simple HTTP/HTTPS request function
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  // Ensure yt-dlp.exe is available in user data directory
  const fs = require('fs');
  const path = require('path');
  
  const userDataPath = app.getPath('userData');
  const ytDlpDestPath = path.join(userDataPath, 'yt-dlp.exe');
  const ytDlpSourcePaths = [
    path.join(process.cwd(), 'yt-dlp.exe'),
    path.join(app.getAppPath(), 'yt-dlp.exe'),
    path.join(path.dirname(app.getAppPath()), 'yt-dlp.exe')
  ];
  
  // Copy yt-dlp.exe to user data directory if it doesn't exist there
  if (!fs.existsSync(ytDlpDestPath)) {
    for (const sourcePath of ytDlpSourcePaths) {
      if (fs.existsSync(sourcePath)) {
        try {
          fs.copyFileSync(sourcePath, ytDlpDestPath);
          console.log('Copied yt-dlp.exe to user data directory:', ytDlpDestPath);
          break;
        } catch (err) {
          console.warn('Failed to copy yt-dlp.exe:', err.message);
        }
      }
    }
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('download-video', async (event, { url, quality }) => {
  try {
    console.log('Downloading video:', url, quality);
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    // Use app.getPath('userData') for installed app, or process.cwd() for dev
    const appPath = app.getAppPath();
    const userDataPath = app.getPath('userData');
    
    // Try to find yt-dlp.exe in multiple locations
    let ytDlpPath;
    const possibleYtDlpPaths = [
      path.join(process.cwd(), 'yt-dlp.exe'),           // Development
      path.join(appPath, 'yt-dlp.exe'),                 // App directory
      path.join(path.dirname(appPath), 'yt-dlp.exe'),   // Parent of app directory
      path.join(userDataPath, 'yt-dlp.exe')             // User data directory
    ];
    
    for (const possiblePath of possibleYtDlpPaths) {
      if (fs.existsSync(possiblePath)) {
        ytDlpPath = possiblePath;
        console.log('Found yt-dlp at:', ytDlpPath);
        break;
      }
    }
    
    if (!ytDlpPath) {
      throw new Error('yt-dlp.exe not found. Please ensure it is in the app directory.');
    }
    
    // Use downloads directory in user data folder for installed app
    const downloadDir = path.join(userDataPath, 'downloads');
    
    // Create downloads directory if it doesn't exist
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    // Build yt-dlp arguments - remove -q to see progress
    const args = ['--no-progress'];
    
    if (quality === '720p') {
      args.push('-f', 'best[height<=?720]');
    } else {
      args.push('-f', 'best[height<=?1080]');
    }
    
    args.push('-o', path.join(downloadDir, '%(title)s.%(ext)s'));
    args.push(url);
    
    console.log('yt-dlp path:', ytDlpPath);
    console.log('yt-dlp args:', args);
    console.log('Download directory:', downloadDir);
    
    return new Promise((resolve, reject) => {
      const child = spawn(ytDlpPath, args, {
        cwd: path.dirname(ytDlpPath), // Use yt-dlp directory as cwd
        shell: false
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log('stdout:', data.toString());
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
        console.log('stderr:', data.toString());
      });
      
      child.on('close', (code) => {
        console.log('Process exited with code:', code);
        
        if (code !== 0) {
          return reject(new Error('Download failed: ' + stderr || 'Process exited with code ' + code));
        }
        
        // Find the downloaded file
        const files = fs.readdirSync(downloadDir);
        const latestFile = files.sort((a, b) => {
          const aTime = fs.statSync(path.join(downloadDir, a)).mtime;
          const bTime = fs.statSync(path.join(downloadDir, b)).mtime;
          return bTime - aTime;
        })[0];
        
        console.log('Downloaded files:', files);
        console.log('Latest file:', latestFile);
        
        if (latestFile) {
          resolve({ path: path.join(downloadDir, latestFile) });
        } else {
          reject(new Error('Download completed but file not found'));
        }
      });
      
      child.on('error', (err) => {
        console.error('Spawn error:', err);
        reject(new Error('Download failed: ' + err.message));
      });
      
      // Set timeout for download
      setTimeout(() => {
        if (!child.killed) {
          child.kill();
          reject(new Error('Download timeout'));
        }
      }, 300000); // 5 minute timeout
    });
  } catch (error) {
    console.error('Download error:', error);
    throw new Error('Download failed: ' + error.message);
  }
});

ipcMain.handle('get-video-info', async (event, url) => {
  try {
    url = url.trim();
    console.log('Fetching info for:', url);
    
    const html = await fetchUrl(url);
    
    // Parse HTML with htmlparser2
    let title = '';
    let thumbnail = '';
    let description = '';
    let uploader = '';
    let duration = 0;
    
    const parser = new htmlparser2.Parser({
      onopentag(name, attribs) {
        if (name === 'meta') {
          if (attribs.property === 'og:title' || attribs.name === 'title') {
            title = attribs.content || '';
          }
          if (attribs.property === 'og:image') {
            thumbnail = attribs.content || '';
          }
          if (attribs.property === 'og:description') {
            description = attribs.content || '';
          }
        }
        if (name === 'link' && attribs.itemprop === 'name') {
          uploader = attribs.content || '';
        }
        if (name === 'meta' && attribs.itemprop === 'duration') {
          const match = attribs.content.match(/PT(\d+)M(\d+)S/);
          if (match) {
            duration = parseInt(match[1]) * 60 + parseInt(match[2]);
          }
        }
      }
    });
    
    parser.write(html);
    parser.end();
    
    console.log('Got info:', title);
    
    return {
      title: title.replace(' - YouTube', ''),
      thumbnail: thumbnail,
      duration: duration,
      uploader: uploader || 'Unknown'
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    throw new Error('Failed to get video info: ' + error.message);
  }
});
