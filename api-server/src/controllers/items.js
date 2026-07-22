// In-memory store
const items = [];
let nextId = 1;

function getAll(req, res) {
  const { search, page = 1, limit = 10 } = req.query;
  let result = items;

  if (search) {
    const q = search.toLowerCase();
    result = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  res.json({
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: result.length,
      totalPages: Math.ceil(result.length / limitNum),
    },
  });
}

function getById(req, res) {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json({ data: item });
}

function create(req, res) {
  const { name, description, price } = req.body;
  const item = {
    id: nextId++,
    name,
    description: description || '',
    price: price != null ? price : 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  items.push(item);
  res.status(201).json({ data: item });
}

function update(req, res) {
  const id = parseInt(req.params.id, 10);
  const item = items.find((i) => i.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  const { name, description, price } = req.body;
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = price;
  item.updatedAt = new Date().toISOString();

  res.json({ data: item });
}

function remove(req, res) {
  const id = parseInt(req.params.id, 10);
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  const removed = items.splice(index, 1)[0];
  res.json({ data: removed });
}

export { getAll, getById, create, update, remove };