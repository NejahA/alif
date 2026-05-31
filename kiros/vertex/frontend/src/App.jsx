import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Upload from './components/Upload';
import FileList from './components/FileList';
import DownloadLink from './components/DownloadLink';
import DownloadPage from './DownloadPage';

function AppContent() {
  const [files, setFiles] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleUploadSuccess = (fileData) => {
    setUploadedFile(fileData);
    fetchFiles();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-blue-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Vertex</h1>
                <p className="text-xs text-purple-200">Secure File Sharing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-xs font-medium">Online</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Share Files <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Securely</span>
          </h2>
          <p className="text-purple-100 max-w-2xl mx-auto text-sm">
            AES-256 encrypted file sharing with instant download links.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-5">
            <Upload onUploadSuccess={handleUploadSuccess} />
            {uploadedFile && <DownloadLink file={uploadedFile} />}
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-xl font-bold text-white">{files.length}</div>
                <div className="text-purple-200 text-xs">Total Files</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-xl font-bold text-white">
                  {files.reduce((acc, f) => acc + (f.downloads || 0), 0)}
                </div>
                <div className="text-purple-200 text-xs">Downloads</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-xl font-bold text-white">
                  {files.reduce((acc, f) => acc + (f.fileSize || 0), 0) / 1024 < 1 
                    ? files.reduce((acc, f) => acc + (f.fileSize || 0), 0) + ' B'
                    : (files.reduce((acc, f) => acc + (f.fileSize || 0), 0) / 1024).toFixed(1) + ' KB'}
                </div>
                <div className="text-purple-200 text-xs">Storage</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-xl font-bold text-white">256</div>
                <div className="text-purple-200 text-xs">Bit Encryption</div>
              </div>
            </div>
          </div>

          {/* Recent Files Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 sticky top-24">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white text-sm">Recent Files</h3>
                <button 
                  onClick={fetchFiles}
                  className="text-purple-300 hover:text-purple-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <FileList files={files} />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-10 py-5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-purple-200 text-xs">© 2024 Vertex. Secure. Fast. Private.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/download" element={<DownloadPage />} />
      </Routes>
    </BrowserRouter>
  );
}
