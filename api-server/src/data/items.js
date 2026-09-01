// In-memory items database (for development)
// In production, you would use a real database

let items = [
  {
    id: 1,
    title: 'Sample Item 1',
    description: 'This is the first sample item',
    userId: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Sample Item 2',
    description: 'This is the second sample item',
    userId: 2,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Sample Item 3',
    description: 'This is the third sample item',
    userId: 1,
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default items;