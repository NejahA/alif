'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, Sparkles } from 'lucide-react';

export default function CodeExportModal() {
  const [lang, setLang] = useState<'nextjs' | 'express' | 'python' | 'go' | 'curl'>('nextjs');
  const [copied, setCopied] = useState(false);

  const snippets = {
    nextjs: `// Next.js 16 App Router Handler (src/app/api/agent/route.ts)
import { SaassyClient } from '@saassy/sdk';
import { NextResponse } from 'next/server';

const saassy = new SaassyClient({ apiKey: process.env.SAASSY_API_KEY });

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const result = await saassy.agents.execute({ prompt, mode: 'autonomous' });
  return NextResponse.json(result);
}`,
    express: `// Express.js Node API (server.js)
const express = require('express');
const { SaassyClient } = require('@saassy/sdk');

const app = express();
const saassy = new SaassyClient({ apiKey: process.env.SAASSY_API_KEY });

app.post('/api/agent', express.json(), async (req, res) => {
  const result = await saassy.agents.execute({ prompt: req.body.prompt });
  res.json(result);
});`,
    python: `# Python FastAPI Handler (main.py)
from fastapi import FastAPI
from saassy import SaassyClient
import os

app = FastAPI()
client = SaassyClient(api_key=os.getenv("SAASSY_API_KEY"))

@app.post("/api/agent")
async def run_agent(prompt: str):
    response = client.agents.execute(prompt=prompt)
    return {"status": "success", "data": response}`,
    go: `// Go Fiber Handler (main.go)
package main

import (
    "github.com/gofiber/fiber/v2"
    "github.com/saassy/saassy-go"
)

func main() {
    app := fiber.New()
    client := saassy.NewClient("sk_saassy_live_...")

    app.Post("/api/agent", func(c *fiber.Ctx) error {
        res, _ := client.ExecuteAgent(c.Body())
        return c.JSON(res)
    })
    app.Listen(":8080")
}`,
    curl: `# cURL Terminal Command
curl -X POST https://api.saassy.ai/v1/agents/execute \\
  -H "Authorization: Bearer sk_saassy_live_8f92a11b094e" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Synthesize microservice architecture for Stripe Webhooks",
    "mode": "workflow"
  }'`
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="hero-badge" style={{ marginBottom: '16px' }}>
            <Terminal size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Developer Integration SDKs</span>
          </div>
          <h2 className="section-title">Connect Saassy in Any Language</h2>
          <p className="section-desc">
            Copy production-ready starter snippets for Next.js, Express, Python, Go, and cURL.
          </p>
        </div>

        <div className="glass-card" style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {(['nextjs', 'express', 'python', 'go', 'curl'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`btn btn-sm ${lang === l ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {l}
                </button>
              ))}
            </div>

            <button onClick={copySnippet} className="btn btn-secondary btn-sm">
              {copied ? <Check size={16} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={16} />}
              {copied ? 'Copied Snippet' : 'Copy Code'}
            </button>
          </div>

          <div className="terminal-box">
            <div className="terminal-header">
              <div className="terminal-dot dot-red"></div>
              <div className="terminal-dot dot-yellow"></div>
              <div className="terminal-dot dot-green"></div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                saassy-starter-{lang}
              </span>
            </div>
            <pre className="terminal-body" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
              <code>{snippets[lang]}</code>
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
}
