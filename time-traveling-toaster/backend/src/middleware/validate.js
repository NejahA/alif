import { BREAD_TYPES } from '../services/toasterService.js';

function validateToastRequest(req, res, next) {
  const { breadType } = req.body;

  if (!breadType || typeof breadType !== 'string' || breadType.trim().length === 0) {
    return res.status(400).json({ error: 'breadType is required and must be a non-empty string' });
  }

  if (!BREAD_TYPES.includes(breadType.toLowerCase())) {
    return res.status(400).json({
      error: `breadType must be one of: ${BREAD_TYPES.join(', ')}`,
    });
  }

  next();
}

function validateTimeTravelRequest(req, res, next) {
  const { date } = req.body;

  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'date is required and must be a string' });
  }

  if (Number.isNaN(Date.parse(date))) {
    return res.status(400).json({ error: 'date must be a valid date string' });
  }

  next();
}

export { validateToastRequest, validateTimeTravelRequest };
