// In-memory user database (for development)
// In production, you would use a real database like MongoDB, PostgreSQL, etc.

const users = [
  {
    id: 1,
    email: 'admin@example.com',
    password: '$2a$12$N0wIhZQd6Q8fPvMk7V8v/.nB9h4LkYjW8mN3pQrS2tUvXyZ1A2B3C4', // password: admin123
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'user@example.com',
    password: '$2a$12$N0wIhZQd6Q8fPvMk7V8v/.nB9h4LkYjW8mN3pQrS2tUvXyZ1A2B3C4', // password: user123
    name: 'Regular User',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export default users;