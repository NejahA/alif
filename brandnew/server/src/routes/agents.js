import express from 'express';
import { initialAgents } from '../data/mockDatabase.js';

const router = express.Router();
let agents = [...initialAgents];

// GET /api/agents
router.get('/', (req, res) => {
  res.json({ success: true, count: agents.length, agents });
});

// GET /api/agents/:id
router.get('/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });
  res.json({ success: true, agent });
});

// POST /api/agents
router.post('/', (req, res) => {
  const { name, role, avatar, color, model, temperature, systemPrompt, tools, tags } = req.body;
  if (!name || !role) {
    return res.status(400).json({ success: false, error: 'Name and role are required' });
  }

  const newAgent = {
    id: `agent-${Date.now()}`,
    name,
    role,
    avatar: avatar || '⚡',
    color: color || '#6366f1',
    model: model || 'Gemini 2.0 Flash',
    temperature: parseFloat(temperature) || 0.4,
    contextLimit: '256k tokens',
    status: 'ready',
    systemPrompt: systemPrompt || 'You are an intelligent assistant.',
    tools: tools || ['Code Sandbox'],
    metrics: { tasksCompleted: 0, avgLatency: '420ms', reliability: '100%' },
    tags: tags || ['General']
  };

  agents.push(newAgent);
  res.status(201).json({ success: true, agent: newAgent });
});

// PUT /api/agents/:id
router.put('/:id', (req, res) => {
  const index = agents.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Agent not found' });

  agents[index] = { ...agents[index], ...req.body };
  res.json({ success: true, agent: agents[index] });
});

// DELETE /api/agents/:id
router.delete('/:id', (req, res) => {
  const initialLength = agents.length;
  agents = agents.filter(a => a.id !== req.params.id);
  if (agents.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Agent not found' });
  }
  res.json({ success: true, message: 'Agent deleted successfully' });
});

// POST /api/agents/:id/execute
router.post('/:id/execute', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

  const { taskPrompt, inputContext } = req.body;
  if (!taskPrompt) {
    return res.status(400).json({ success: false, error: 'taskPrompt is required' });
  }

  // Generate realistic agent reasoning traces and output
  const thinkingTraces = [
    `Ingesting prompt (${taskPrompt.length} chars) into ${agent.model} context window...`,
    `Applying system prompt constraints for [${agent.name}]: temperature set to ${agent.temperature}.`,
    `Activating equipped tools: [${agent.tools.join(', ')}].`,
    `Synthesizing deterministic solution with safety filters enabled...`
  ];

  let simulatedOutput = '';
  if (agent.role.includes('Architect')) {
    simulatedOutput = `### Architecture Blueprints & Decision Record\n\n**Decomposition Strategy:**\n1. **Event Bus Ingress**: High-throughput buffer with zero-copy deserialization.\n2. **State Store**: Partitioned Raft clusters ensuring strong consistency across active sessions.\n3. **Backpressure Controller**: Adaptive rate limiter capping bursts at 50k req/s.\n\n*Recommendation*: Implement decoupled worker pools to isolate heavy compute tasks from the real-time event loop.`;
  } else if (agent.role.includes('Security') || agent.role.includes('QA')) {
    simulatedOutput = `### Threat Modeling & Security Audit Result\n\n- **Audit Status**: PASS with 1 Advisory.\n- **Vulnerabilities Detected**: 0 Critical, 0 High, 1 Low (Input size boundary recommended).\n- **Fuzzing Results**: 1,200 permutations tested with zero unhandled panics.\n- **Sanitization Recommendation**: Enforce schema validation at HTTP ingress.`;
  } else if (agent.role.includes('Context') || agent.role.includes('Analyst')) {
    simulatedOutput = `### Semantic Synthesis & Entity Extraction\n\n- **Core Entities Identified**: 14 distinct domain abstractions.\n- **Cross-Reference Consistency**: 98.7% coherence score.\n- **Key Takeaway**: System guarantees linearizability for read-after-write operations within the primary region.`;
  } else {
    simulatedOutput = `### Execution Output: ${agent.name}\n\nTask prompt processed successfully.\n\n\`\`\`javascript\n// Generated artifact conforming to ${agent.model} guidelines\nexport const executeWorkflowStep = async (stepContext) => {\n  console.log("Executing optimized step logic:", stepContext);\n  return { status: "COMPLETED", latencyMs: 240, timestamp: Date.now() };\n};\n\`\`\`\n\nVerified clean execution with zero runtime warnings.`;
  }

  // Update agent metrics
  agent.metrics.tasksCompleted += 1;

  res.json({
    success: true,
    agentId: agent.id,
    agentName: agent.name,
    taskPrompt,
    inputContext: inputContext || null,
    thinkingTraces,
    output: simulatedOutput,
    metrics: {
      executionTimeMs: Math.floor(Math.random() * 300) + 180,
      tokensUsed: Math.floor(Math.random() * 600) + 400,
      costEstimate: "$0.0014"
    }
  });
});

export default router;
