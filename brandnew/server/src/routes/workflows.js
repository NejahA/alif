import express from 'express';
import { initialWorkflows, initialAgents } from '../data/mockDatabase.js';

const router = express.Router();
let workflows = [...initialWorkflows];

// GET /api/workflows
router.get('/', (req, res) => {
  res.json({ success: true, count: workflows.length, workflows });
});

// GET /api/workflows/:id
router.get('/:id', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id);
  if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });
  res.json({ success: true, workflow });
});

// POST /api/workflows
router.post('/', (req, res) => {
  const { name, description, category, nodes, connections } = req.body;
  if (!name) return res.status(400).json({ success: false, error: 'Workflow name is required' });

  const newWorkflow = {
    id: `wf-${Date.now()}`,
    name,
    description: description || 'Custom AI Workflow Pipeline',
    status: 'ready',
    category: category || 'Custom',
    createdAt: new Date().toISOString(),
    nodes: nodes || [
      {
        id: `node-${Date.now()}-1`,
        label: 'Prompt Input Ingestion',
        type: 'input',
        agentId: null,
        status: 'ready',
        config: {},
        output: '',
        x: 100,
        y: 120
      },
      {
        id: `node-${Date.now()}-2`,
        label: 'Core Reasoning Agent',
        type: 'agent',
        agentId: initialAgents[0]?.id || 'agent-1',
        status: 'idle',
        config: {},
        output: '',
        x: 420,
        y: 120
      }
    ],
    connections: connections || []
  };

  workflows.push(newWorkflow);
  res.status(201).json({ success: true, workflow: newWorkflow });
});

// PUT /api/workflows/:id
router.put('/:id', (req, res) => {
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Workflow not found' });

  workflows[index] = { ...workflows[index], ...req.body };
  res.json({ success: true, workflow: workflows[index] });
});

// DELETE /api/workflows/:id
router.delete('/:id', (req, res) => {
  const initialLength = workflows.length;
  workflows = workflows.filter(w => w.id !== req.params.id);
  if (workflows.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Workflow not found' });
  }
  res.json({ success: true, message: 'Workflow deleted' });
});

// POST /api/workflows/:id/run - Execute pipeline end-to-end
router.post('/:id/run', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id);
  if (!workflow) return res.status(404).json({ success: false, error: 'Workflow not found' });

  const executionLog = [];
  let previousOutput = req.body.initialInput || "Feature: Build high-concurrency prompt evaluation engine";

  // Simulate execution of each node in order
  workflow.nodes.forEach((node, idx) => {
    node.status = 'completed';
    const assignedAgent = initialAgents.find(a => a.id === node.agentId);

    const stepOutput = assignedAgent 
      ? `[${assignedAgent.name}] Processed input: "${previousOutput.slice(0, 50)}...". Generated ${node.label} artifacts with latency 210ms.`
      : `[Input Ingestion] Successfully validated input: "${previousOutput.slice(0, 60)}..."`;

    node.output = stepOutput;
    previousOutput = stepOutput;

    executionLog.push({
      nodeId: node.id,
      nodeLabel: node.label,
      agentName: assignedAgent ? assignedAgent.name : 'System Pipeline',
      status: 'completed',
      durationMs: 140 + idx * 80,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  workflow.status = 'active';

  res.json({
    success: true,
    workflowId: workflow.id,
    workflowName: workflow.name,
    totalNodesExecuted: workflow.nodes.length,
    executionLog,
    updatedWorkflow: workflow
  });
});

export default router;
