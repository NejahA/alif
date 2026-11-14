import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const generateInsight = async (title: string, content: string): Promise<{summary: string; emotion: string}> => {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not set');
  }
  const prompt = `You are an expert dream analyst. Summarize the main themes, emotions, and possible symbolism in the following dream. Provide a concise 2‑3 sentence insight and also return a single word describing the dominant emotion (e.g., joy, fear, sadness).\n\nTitle: ${title}\n\nContent: ${content}`;
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    }),
  });
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  // Simple parsing: assume first line is summary, second line is emotion word.
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length);
  const summary = lines[0] || 'No summary generated';
  const emotion = lines[1] ? lines[1].split(' ')[0] : 'neutral';
  return { summary, emotion };
};

