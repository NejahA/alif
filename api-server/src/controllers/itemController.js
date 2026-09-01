import items from '../data/items.js';

// Helper function to get next ID
const getNextId = () => {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

export const getAllItems = (req, res) => {
  try {
    const { status, userId, page = 1, limit = 10 } = req.query;
    
    // Filter items
    let filteredItems = [...items];
    
    if (status) {
      filteredItems = filteredItems.filter(item => item.status === status);
    }
    
    if (userId) {
      filteredItems = filteredItems.filter(item => item.userId === parseInt(userId));
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedItems,
      pagination: {
        total: filteredItems.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredItems.length / limit)
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
};

export const getItemById = (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const item = items.find(item => item.id === itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
};

export const createItem = (req, res) => {
  try {
    const { title, description, status = 'active' } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newItem = {
      id: getNextId(),
      title,
      description: description || '',
      userId: req.user.id,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    items.push(newItem);
    
    res.status(201).json({
      message: 'Item created successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

export const updateItem = (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { title, description, status } = req.body;
    
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check ownership (admin can update any item)
    if (req.user.role !== 'admin' && items[itemIndex].userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own items' });
    }
    
    // Update item
    if (title !== undefined) items[itemIndex].title = title;
    if (description !== undefined) items[itemIndex].description = description;
    if (status !== undefined) items[itemIndex].status = status;
    
    items[itemIndex].updatedAt = new Date().toISOString();
    
    res.json({
      message: 'Item updated successfully',
      item: items[itemIndex]
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

export const deleteItem = (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const itemIndex = items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check ownership (admin can delete any item)
    if (req.user.role !== 'admin' && items[itemIndex].userId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own items' });
    }
    
    // Remove item
    const deletedItem = items.splice(itemIndex, 1)[0];
    
    res.json({
      message: 'Item deleted successfully',
      item: deletedItem
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};