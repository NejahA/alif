import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import axios from 'axios';
import { Button, View, Text, StyleSheet } from 'react-native'; // For React Native Web compatibility

export default function ExportImportPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.get('/api/dreams'); // Assume returns array of dreams
      const zip = new JSZip();
      response.data.forEach((dream, idx) => {
        zip.file(`dream_${idx + 1}.json`, JSON.stringify(dream, null, 2));
      });
      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, 'dreams_export.zip');
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const promises = [];
      zip.forEach((relativePath, zipEntry) => {
        promises.push(zipEntry.async('string').then(content => JSON.parse(content)));
      });
      const dreams = await Promise.all(promises);
      await Promise.all(dreams.map(d => axios.post('/api/dreams', d)));
      alert('Import completed');
    } catch (e) {
      console.error(e);
    }
    setImporting(false);
  };

  return (
    <View style={styles.container}>
      <Button title={exporting ? 'Exporting…' : 'Export Dreams as ZIP'} onPress={handleExport} disabled={exporting} />
      <View style={{ height: 20 }} />
      <input type="file" accept=".zip" onChange={handleImport} disabled={importing} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
});