import React from 'react';
import { saveAs } from 'file-saver';

export default function ExportMarkdownButton({ dreamId }: { dreamId: string }) {
  const download = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/dreams/${dreamId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    const md = `# ${data.title}\n\n${data.content}`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    saveAs(blob, `${data.title || 'dream'}.md`);
  };
  return <button onClick={download}>Export as Markdown</button>;
}

