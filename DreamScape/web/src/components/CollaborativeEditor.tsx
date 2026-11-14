import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Quill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const socket = io();

export default function CollaborativeEditor() {
  const [text, setText] = useState('');

  useEffect(() => {
    // Listen for edits from other users
    socket.on('dreamEdited', (payload: { content: string }) => {
      setText(payload.content);
    });
    // Cleanup
    return () => {
      socket.off('dreamEdited');
    };
  }, []);

  const handleChange = (value: string) => {
    setText(value);
    // Emit edit to server
    socket.emit('dreamEdited', { content: value });
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>Collaborative Dream Editor</h2>
      <Quill theme="snow" value={text} onChange={handleChange} />
    </div>
  );
}

