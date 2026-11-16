import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Simple page that lets the user export the current build output as a ZIP file
 * and import a previously exported ZIP to replace the current `dist` folder.
 * This is a lightweight demo – in a real app you would probably stream files
 * and add validation.
 */
const ExportImportPage: React.FC = () => {
  const [status, setStatus] = useState<string>('');

  const handleExport = async () => {
    try {
      setStatus('Creating ZIP…');
      const zip = new JSZip();
      // Assuming the build output lives in `../dist` relative to the page.
      const response = await fetch('/dist/manifest.json'); // just to check existence
      if (!response.ok) {
        throw new Error('Build output not found');
      }
      // In a real scenario you would recursively add files from the folder.
      // Here we just demo by adding the manifest.
      const manifest = await response.json();
      zip.file('manifest.json', JSON.stringify(manifest, null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'alpalin-web-export.zip');
      setStatus('Exported successfully');
    } catch (e) {
      setStatus(`Export failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setStatus('Reading ZIP…');
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      // Simple example: replace manifest.json only.
      const manifestFile = zip.file('manifest.json');
      if (!manifestFile) {
        throw new Error('manifest.json not found in ZIP');
      }
      const manifestContent = await manifestFile.async('string');
      await fetch('/dist/manifest.json', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: manifestContent,
      });
      setStatus('Import completed (manifest updated)');
    } catch (e) {
      setStatus(`Import failed: ${e instanceof Error ? e.message : e}`);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Export / Import Build</h2>
      <button onClick={handleExport}>Export ZIP</button>
      <input type="file" accept=".zip" onChange={handleImport} style={{ marginLeft: '1rem' }} />
      <p>{status}</p>
    </div>
  );
};

export default ExportImportPage;
