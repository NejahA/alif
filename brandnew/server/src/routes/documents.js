import express from 'express';
import { initialDocuments } from '../data/mockDatabase.js';

const router = express.Router();
let documents = [...initialDocuments];

// GET /api/documents
router.get('/', (req, res) => {
  res.json({ success: true, count: documents.length, documents });
});

// GET /api/documents/:id
router.get('/:id', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
  res.json({ success: true, document: doc });
});

// POST /api/documents - Ingest document
router.post('/', (req, res) => {
  const { name, content, type } = req.body;
  if (!name || !content) {
    return res.status(400).json({ success: false, error: 'Document name and content are required' });
  }

  const tokenCount = Math.ceil(content.length / 4);
  const sizeKb = (content.length / 1024).toFixed(1) + " KB";

  const newDoc = {
    id: `doc-${Date.now()}`,
    name,
    size: sizeKb,
    type: type || (name.endsWith('.json') ? 'json' : 'markdown'),
    uploadedAt: new Date().toISOString(),
    tokenCount,
    summary: `Ingested ${name} containing ${tokenCount} tokens. Indexed for semantic vector retrieval.`,
    content
  };

  documents.push(newDoc);
  res.status(201).json({ success: true, document: newDoc });
});

// POST /api/documents/:id/query - Semantic Q&A with highlighted citations
router.post('/:id/query', (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });

  const { query } = req.body;
  if (!query) return res.status(400).json({ success: false, error: 'Query string is required' });

  // Simulate semantic chunk matching
  const sentences = doc.content.split('\n').filter(line => line.trim().length > 0);
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
  
  let relevantMatches = sentences.filter(s => 
    keywords.some(k => s.toLowerCase().includes(k))
  );

  if (relevantMatches.length === 0) {
    relevantMatches = sentences.slice(0, 3);
  }

  const answer = `Based on semantic context in "${doc.name}", the primary guidelines state that: ${relevantMatches.map(m => m.replace(/^[#\-\*]\s*/, '')).join(' Furthermore, ')}.`;

  res.json({
    success: true,
    documentId: doc.id,
    query,
    answer,
    citations: relevantMatches.slice(0, 4).map((text, i) => ({
      citationId: `cite-${i + 1}`,
      text: text.trim(),
      relevanceScore: (0.92 - i * 0.04).toFixed(2)
    })),
    retrievalLatencyMs: 140
  });
});

// DELETE /api/documents/:id
router.delete('/:id', (req, res) => {
  const initialLength = documents.length;
  documents = documents.filter(d => d.id !== req.params.id);
  if (documents.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Document not found' });
  }
  res.json({ success: true, message: 'Document deleted' });
});

export default router;
