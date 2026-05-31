import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleGetInfo = async () => {
    if (!url) {
      setMessage('Please enter a URL');
      return;
    }

    if (!window.electron) {
      setMessage('Error: Electron bridge not available. Please restart the app.');
      return;
    }

    try {
      setMessage('Fetching video info...');
      const info = await window.electron.getVideoInfo(url);
      setVideoInfo(info);
      setMessage('');
    } catch (error) {
      setMessage('Error: ' + error.message);
      setVideoInfo(null);
    }
  };

  const handleDownload = async (quality = 'highest') => {
    if (!window.electron) {
      setMessage('Error: Electron bridge not available. Please restart the app.');
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);
    setMessage('Starting download...');

    try {
      const result = await window.electron.downloadVideo(url, quality);
      setDownloadProgress(100);
      setMessage(`Downloaded successfully to: ${result.path}`);
    } catch (error) {
      setMessage('Download failed: ' + error.message);
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadProgress(0), 3000);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1> WeMill</h1>
        <p>Video Downloader</p>
      </header>

      <div className="container">
        <div className="input-group">
          <input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGetInfo()}
          />
          <button onClick={handleGetInfo} disabled={downloading}>
            Get Info
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        {videoInfo && (
          <div className="video-info">
            <img src={videoInfo.thumbnail} alt="Thumbnail" />
            <h3>{videoInfo.title}</h3>
            <p>Duration: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</p>
            <p>Uploader: {videoInfo.uploader}</p>
            
            {downloading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${downloadProgress}%` }}></div>
                </div>
                <p className="progress-text">Downloading... {downloadProgress}%</p>
              </div>
            )}
            
            <div className="download-buttons">
              <button className="download-btn" onClick={() => handleDownload('highest')} disabled={downloading}>
                Download Highest Quality
              </button>
              <button className="download-btn secondary" onClick={() => handleDownload('720p')} disabled={downloading}>
                Download 720p
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
