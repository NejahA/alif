import express from 'express';
import { initialTelemetry } from '../data/mockDatabase.js';

const router = express.Router();
let telemetryData = { ...initialTelemetry };

// GET /api/telemetry
router.get('/', (req, res) => {
  res.json({ success: true, telemetry: telemetryData });
});

// POST /api/telemetry/event
router.post('/event', (req, res) => {
  const { type, agent, detail, status } = req.body;
  const newEvent = {
    id: `ev-${Date.now()}`,
    time: new Date().toLocaleTimeString(),
    type: type || 'SYSTEM_INFO',
    agent: agent || 'Dispatcher',
    status: status || 'success',
    detail: detail || 'System heartbeat synchronized'
  };

  telemetryData.recentEvents.unshift(newEvent);
  if (telemetryData.recentEvents.length > 20) {
    telemetryData.recentEvents.pop();
  }
  telemetryData.totalExecutions += 1;

  res.status(201).json({ success: true, event: newEvent });
});

export default router;
