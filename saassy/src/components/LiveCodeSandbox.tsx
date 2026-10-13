'use client';

import React, { useState } from 'react';
import { Code2, Play, Terminal, RefreshCw, Copy, Check, Sparkles, Cpu } from 'lucide-react';

export default function LiveCodeSandbox() {
  const [language, setLanguage] = useState<'typescript' | 'python' | 'sql'>('typescript');
  const [code, setCode] = useState<string>(
`// Autonomous AI Agent Data Pipeline
async function executeAgentTask(prompt: string) {
  const plan = await ai.plan({ prompt });
  console.log("⚡ Executing sub-tasks:", plan.tasks);
  
  const result = await ai.synthesize({
    tasks: plan.tasks,
    model: "gpt-4o",
    temperature: 0.2
  });
  
  return { status: "SUCCESS", payload: result };
}

executeAgentTask("Build high-frequency trading bot");`
  );

  const [output, setOutput] = useState<string>('Ready for execution. Click Run Code.');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (lang: 'typescript' | 'python' | 'sql') => {
    setLanguage(lang);
    if (lang === 'typescript') {
      setCode(
`// Autonomous AI Agent Data Pipeline
async function executeAgentTask(prompt: string) {
  const plan = await ai.plan({ prompt });
  console.log("⚡ Executing sub-tasks:", plan.tasks);
  
  const result = await ai.synthesize({
    tasks: plan.tasks,
    model: "gpt-4o",
    temperature: 0.2
  });
  
  return { status: "SUCCESS", payload: result };
}

executeAgentTask("Build high-frequency trading bot");`
      );
    } else if (lang === 'python') {
      setCode(
`import asyncio
from saassy import AgentSwarm

async def main():
    swarm = AgentSwarm(nodes=4, model="deepseek-v3")
    print("🐝 Initializing Multi-Agent Swarm...")
    
    res = await swarm.run(prompt="Analyze market trends")
    print(f"✅ Output: {res.summary}")

asyncio.run(main())`
      );
    } else {
      setCode(
`-- Vector Similarity Search & Query Profile
SELECT 
  id, 
  title, 
  1 - (embedding <=> '[0.023, 0.412, -0.891]') AS similarity
FROM knowledge_embeddings
WHERE active = true
ORDER BY similarity DESC
LIMIT 5;`
      );
    }
  };

  const runCode = () => {
    setIsExecuting(true);
    setOutput('[00:01] Compiling AST and binding WebAssembly sandbox environment...');

    setTimeout(() => {
      if (language === 'typescript') {
        setOutput(
`[00:01] AST Parse: PASSED
[00:02] ⚡ Executing sub-tasks: ["market_data_ingest", "risk_model_evaluate", "order_route"]
[00:03] Model: gpt-4o | Tokens: 340 | Latency: 180ms
[00:04] ✅ Task Completed! Return Payload: { status: "SUCCESS", payload: { ordersPlaced: 4, alphaYield: "+12.4%" } }`
        );
      } else if (language === 'python') {
        setOutput(
`[00:01] 🐝 Initializing Multi-Agent Swarm...
[00:02] Spawning 4 parallel worker threads in sandbox isolation...
[00:03] ✅ Output: Analyzed 1,400 financial reports. High confidence bullish signal detected.`
        );
      } else {
        setOutput(
`[00:01] QUERY EXECUTED in 2.4ms (Index Scan on idx_embeddings_hnsw)
Row 1: "Q3 Financial Report PDF" | Similarity: 0.984
Row 2: "Risk Assessment Vector" | Similarity: 0.941
Row 3: "Trading Strategy V2" | Similarity: 0.912`
        );
      }
      setIsExecuting(false);
    }, 900);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code-sandbox" className="section" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="section-header">
          <div className="hero-badge">
            <Code2 size={16} />
            <span>Interactive Code REPL Environment</span>
          </div>
          <h2 className="section-title">
            Agent Code Sandbox & <span className="text-gradient">REPL</span>
          </h2>
          <p className="section-desc">
            Test and execute agent orchestration scripts in real time using TypeScript, Python, or SQL vector queries with instant output streaming.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => handleLanguageChange('typescript')} 
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: language === 'typescript' ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: language === 'typescript' ? '#a5b4fc' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                TypeScript / JS
              </button>
              <button 
                onClick={() => handleLanguageChange('python')} 
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: language === 'python' ? 'rgba(6,182,212,0.2)' : 'transparent',
                  color: language === 'python' ? '#06b6d4' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Python 3.11
              </button>
              <button 
                onClick={() => handleLanguageChange('sql')} 
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: language === 'sql' ? 'rgba(168,85,247,0.2)' : 'transparent',
                  color: language === 'sql' ? '#a855f7' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                pgvector SQL
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={copyCode} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy Code'}
              </button>
              <button onClick={runCode} disabled={isExecuting} className="btn btn-primary btn-sm">
                <Play size={14} /> {isExecuting ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* Code Editor & Output Split Screen */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            {/* Editor Area */}
            <div style={{ background: '#060911', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ background: '#0d1322', padding: '8px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-color)' }}>
                main.{language === 'typescript' ? 'ts' : language === 'python' ? 'py' : 'sql'}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '240px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  padding: '16px',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  resize: 'none'
                }}
              />
            </div>

            {/* Output stdout Area */}
            <div style={{ background: '#060911', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#0d1322', padding: '8px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={12} /> STDOUT / EXECUTION TELEMETRY
              </div>
              <div style={{ padding: '16px', flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#10b981', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {output}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
