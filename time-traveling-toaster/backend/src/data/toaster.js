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

function getHistory({ page = 1, limit = 10 } = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const start = (pageNum - 1) * limitNum;
  const paginated = history.slice(start, start + limitNum);

  return {
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: history.length,
      totalPages: Math.ceil(history.length / limitNum),
    },
  };
}

function clearHistory() {
  history.length = 0;
}

export { IDEA_NAME, state, addEvent, getHistory, clearHistory };
