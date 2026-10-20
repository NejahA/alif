const API_BASE_URL = 'http://localhost:5050/api';

export const fetchHealth = async () => {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
};

export const fetchAgents = async () => {
  const res = await fetch(`${API_BASE_URL}/agents`);
  return res.json();
};

export const executeAgent = async (agentId, taskPrompt, inputContext) => {
  const res = await fetch(`${API_BASE_URL}/agents/${agentId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskPrompt, inputContext })
  });
  return res.json();
};

export const createAgent = async (agentData) => {
  const res = await fetch(`${API_BASE_URL}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(agentData)
  });
  return res.json();
};

export const fetchWorkflows = async () => {
  const res = await fetch(`${API_BASE_URL}/workflows`);
  return res.json();
};

export const runWorkflow = async (workflowId, initialInput) => {
  const res = await fetch(`${API_BASE_URL}/workflows/${workflowId}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initialInput })
  });
  return res.json();
};

export const fetchPrompts = async () => {
  const res = await fetch(`${API_BASE_URL}/prompts`);
  return res.json();
};

export const substitutePrompt = async (template, values) => {
  const res = await fetch(`${API_BASE_URL}/prompts/substitute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, values })
  });
  return res.json();
};

export const benchmarkPrompt = async (promptText, targetModels) => {
  const res = await fetch(`${API_BASE_URL}/prompts/benchmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptText, targetModels })
  });
  return res.json();
};

export const fetchDocuments = async () => {
  const res = await fetch(`${API_BASE_URL}/documents`);
  return res.json();
};

export const queryDocument = async (documentId, query) => {
  const res = await fetch(`${API_BASE_URL}/documents/${documentId}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
};

export const createDocument = async (docData) => {
  const res = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docData)
  });
  return res.json();
};

export const fetchTelemetry = async () => {
  const res = await fetch(`${API_BASE_URL}/telemetry`);
  return res.json();
};

export const logTelemetryEvent = async (eventData) => {
  const res = await fetch(`${API_BASE_URL}/telemetry/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData)
  });
  return res.json();
};
