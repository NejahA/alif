import React, { useState, useEffect, useRef } from 'react';
import { Share2, Download, Copy, Link, Music, MessageCircle, Mail, Heart, BarChart3, 
         Users, TrendingUp, Calendar, Clock, Hash, Eye } from 'lucide-react';

const SocialSharing = ({ composition, onShareComplete }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareOptions, setShareOptions] = useState({
    includeAudio: true,
    includeMIDI: false,
    includeScreenshot: true,
    watermark: true,
    public: false,
    allowDownloads: true,
    expires: 'never',
    socialPlatforms: ['twitter', 'facebook']
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [shareStats, setShareStats] = useState({
    views: 0,
    likes: 0,
    downloads: 0,
    shares: 0
  });

  const canvasRef = useRef(null);
  const audioRecorderRef = useRef(null);

  const socialPlatforms = [
    { id: 'twitter', name: 'Twitter', icon: <Share2 size={18} />, color: '#1DA1F2' },
    { id: 'facebook', name: 'Facebook', icon: <Share2 size={18} />, color: '#1877F2' },
    { id: 'instagram', name: 'Instagram', icon: <Share2 size={18} />, color: '#E4405F' },
    { id: 'youtube', name: 'YouTube', icon: <Share2 size={18} />, color: '#FF0000' },
    { id: 'tiktok', name: 'TikTok', icon: <Music size={18} />, color: '#000000' },
    { id: 'discord', name: 'Discord', icon: <MessageCircle size={18} />, color: '#5865F2' }
  ];

  const expirationOptions = [
    { id: '1h', label: '1 Hour', description: 'Link expires after 1 hour' },
    { id: '24h', label: '24 Hours', description: 'Link expires after 1 day' },
    { id: '7d', label: '7 Days', description: 'Link expires after 1 week' },
    { id: '30d', label: '30 Days', description: 'Link expires after 1 month' },
    { id: 'never', label: 'Never', description: 'Permanent link' }
  ];

  // Generate shareable content
  const generateShareContent = async () => {
    setIsSharing(true);
    
    try {
      // Generate unique share ID
      const shareId = generateShareId();
      
      // Create shareable data
      const shareData = {
        id: shareId,
        composition: composition,
        timestamp: new Date().toISOString(),
        options: shareOptions,
        metadata: {
          duration: '2:45', // Would be calculated from composition
          instruments: ['piano', 'drums', 'synth'], // Would be extracted
          bpm: 120,
          key: 'C major'
        }
      };

      // Generate screenshot if enabled
      let screenshotData = null;
      if (shareOptions.includeScreenshot) {
        screenshotData = await captureScreenshot();
      }

      // Generate audio preview if enabled
      let audioData = null;
      if (shareOptions.includeAudio) {
        audioData = await generateAudioPreview();
      }

      // Generate MIDI file if enabled
      let midiData = null;
      if (shareOptions.includeMIDI) {
        midiData = await generateMIDIFile();
      }

      // Generate shareable link
      const link = `https://virtuo.app/share/${shareId}`;
      setGeneratedLink(link);

      // Save to local storage for demo
      localStorage.setItem(`virtuo_share_${shareId}`, JSON.stringify({
        ...shareData,
        screenshot: screenshotData,
        audio: audioData,
        midi: midiData
      }));

      // Update stats
      setShareStats(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));

      if (onShareComplete) {
        onShareComplete(shareId, link);
      }

    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const generateShareId = () => {
    return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  };

  const captureScreenshot = async () => {
    // In real implementation, this would capture the current canvas/UI
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
      }, 100);
    });
  };

  const generateAudioPreview = async () => {
    // In real implementation, this would record audio output
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADwADw8PDw8PDw8PDw8极');
      }, 100);
    });
  };

  const generateMIDIFile = async () => {
    // In real implementation, this would generate MIDI from composition
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('data:audio/midi;base64,TVRoZAAAAAYAAQACA8BNVHJrAAAADAD/');
      }, 100);
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      return false;
    }
  };

  const shareToPlatform = async (platformId, content) => {
    // In real implementation, this would integrate with social media APIs
    console.log(`Sharing to ${platformId}:`, content);
    return true;
  };

  const downloadContent = async (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="social-sharing-panel">
      <div className="sharing-header">
        <Share2 size={24} />
        <h3>Share Your Creation</h3>
      </div>

      <div className="sharing-options">
        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={shareOptions.includeAudio}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                includeAudio: e.target.checked
              }))}
            />
            Include Audio Preview
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={shareOptions.includeMIDI}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                includeMIDI: e.target.checked
              }))}
            />
            Include MIDI File
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={shareOptions.includeScreenshot}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                includeScreenshot: e.target.checked
              }))}
            />
            Include Screenshot
          </label>
        </div>

        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={shareOptions.watermark}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                watermark: e.target.checked
              }))}
            />
            Add Watermark
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={shareOptions.public}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                public: e.target.checked
              }))}
            />
            Public Share
          </label>
          
          <label>
            <input
              type="checkbox"
              checked={shareOptions.allowDownloads}
              onChange={(e) => setShareOptions(prev => ({
                ...prev,
                allowDownloads: e.target.checked
              }))}
            />
            Allow Downloads
          </label>
        </div>

        <div className="option-group">
          <label>Link Expiration:</label>
          <select
            value={shareOptions.expires}
            onChange={(e) => setShareOptions(prev => ({
              ...prev,
              expires: e.target.value
            }))}
          >
            {expirationOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="social-platforms">
          <label>Share to Platforms:</label>
          <div className="platform-buttons">
            {socialPlatforms.map(platform => (
              <button
                key={platform.id}
                className={`platform-btn ${
                  shareOptions.socialPlatforms.includes(platform.id) ? 'active' : ''
                }`}
                onClick={() => {
                  const updated = shareOptions.socialPlatforms.includes(platform.id)
                    ? shareOptions.socialPlatforms.filter(p => p !== platform.id)
                    : [...shareOptions.socialPlatforms, platform.id];
                  setShareOptions(prev => ({ ...prev, socialPlatforms: updated }));
                }}
                style={{ backgroundColor: platform.color }}
              >
                {platform.icon}
                {platform.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sharing-actions">
        <button
          className="share-button"
          onClick={generateShareContent}
          disabled={isSharing}
        >
          {isSharing ? 'Generating...' : 'Generate Share Link'}
        </button>

        {generatedLink && (
          <div className="generated-link">
            <input
              type="text"
              value={generatedLink}
              readOnly
              placeholder="Share link will appear here"
            />
            <button
              onClick={() => copyToClipboard(generatedLink)}
              title="Copy to clipboard"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => downloadContent(generatedLink, 'virtuo-share.txt', 'text/plain')}
              title="Download link"
            >
              <Download size={16} />
            </button>
          </div>
        )}

        <div className="share-stats">
          <div className="stat">
            <Eye size={16} />
            <span>{shareStats.views} views</span>
          </div>
          <div className="stat">
            <Heart size={16} />
            <span>{shareStats.likes} likes</span>
          </div>
          <div className="stat">
            <Download size={16} />
            <span>{shareStats.downloads} downloads</span>
          </div>
          <div className="stat">
            <Share2 size={16} />
            <span>{shareStats.shares} shares</span>
          </div>
        </div>
      </div>

      <div className="quick-share-buttons">
        <button
          className="quick-share-btn"
          onClick={() => shareToPlatform('twitter', composition)}
        >
          <Twitter size={16} />
          Share to Twitter
        </button>
        <button
          className="quick-share-btn"
          onClick={() => shareToPlatform('facebook', composition)}
        >
          <Facebook size={16} />
          Share to Facebook
        </button>
        <button
          className="quick-share-btn"
          onClick={() => downloadContent(JSON.stringify(composition), 'composition.json', 'application/json')}
        >
          <Download size={16} />
          Export JSON
        </button>
      </div>
    </div>
  );
};

export default SocialSharing;