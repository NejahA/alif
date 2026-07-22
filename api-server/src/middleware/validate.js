function validateItem(req, res, next) {
  const { name, price } = req.body;

  // Only validate on POST (create) and PUT (update) — skip DELETE and GET
  if (req.method === 'POST' || req.method === 'PUT') {
    if (req.method === 'POST' && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Name is required and must be a non-empty string' });
    }

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ error: 'Name must be a non-empty string' });
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }

    if (req.body.description !== undefined && typeof req.body.description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' });
    }
  }

  next();
}

function validateItemId(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID must be a positive integer' });
  }
  next();
}

export { validateItem, validateItemId };