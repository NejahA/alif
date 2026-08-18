// In-memory toaster state and event history
const IDEA_NAME = 'Revolutionary Time Traveling Toaster';

const state = {
  currentEra: new Date().toISOString(),
  isToasting: false,
};

const history = [];
let nextId = 1;

function addEvent(type, payload) {
  const event = {
    id: nextId++,
    type,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  history.unshift(event);
  return event;
}

function getHistory({ page = 1, limit = 10, type } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const filtered = type ? history.filter((event) => event.type === type) : history;
  const start = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(start, start + limitNum);

  return {
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum),
    },
  };
}

function getAllHistory() {
  return history;
}

function getEventById(id) {
  return history.find((event) => event.id === id);
}

function clearHistory() {
  history.length = 0;
}

// Era stack for undoing time travel
const eraStack = [];
const MAX_UNDO_DEPTH = 20;

function pushEraForUndo(era) {
  eraStack.push(era);
  if (eraStack.length > MAX_UNDO_DEPTH) {
    eraStack.shift();
  }
}

function popEraForUndo() {
  return eraStack.pop();
}

function hasUndoHistory() {
  return eraStack.length > 0;
}

// Favorite eras (bookmarks)
const favorites = [];
let nextFavoriteId = 1;

function addFavorite(label, era) {
  const favorite = {
    id: nextFavoriteId++,
    label,
    era,
    createdAt: new Date().toISOString(),
  };
  favorites.push(favorite);
  return favorite;
}

function getFavorites() {
  return favorites;
}

function removeFavorite(id) {
  const index = favorites.findIndex((favorite) => favorite.id === id);
  if (index === -1) {
    return false;
  }
  favorites.splice(index, 1);
  return true;
}

export {
  IDEA_NAME,
  state,
  addEvent,
  getHistory,
  getAllHistory,
  getEventById,
  clearHistory,
  pushEraForUndo,
  popEraForUndo,
  hasUndoHistory,
  addFavorite,
  getFavorites,
  removeFavorite,
};
