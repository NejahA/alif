// In-memory user store
const users = [];
let nextId = 1;

function findByEmail(email) {
  return users.find((u) => u.email === email);
}

function findById(id) {
  return users.find((u) => u.id === id);
}

function create({ name, email, password }) {
  const user = {
    id: nextId++,
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function update(id, updates) {
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  return user;
}

export { findByEmail, findById, create, update };