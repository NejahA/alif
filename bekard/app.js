const taskList = document.getElementById('taskList');
const pendingCount = document.getElementById('pendingCount');
const summaryValue = document.getElementById('summaryValue');
const summaryNote = document.getElementById('summaryNote');
const focusGoal = document.getElementById('focusGoal');
const focusDescription = document.getElementById('focusDescription');
const completedCount = document.getElementById('completedCount');
const streakCount = document.getElementById('streakCount');
const addTaskButton = document.getElementById('addTaskButton');
const focusButton = document.getElementById('focusButton');
const completeButton = document.getElementById('completeButton');
const taskDialog = document.getElementById('taskDialog');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskDueDate = document.getElementById('taskDueDate');
const taskTags = document.getElementById('taskTags');
const dueFilter = document.getElementById('dueFilter');
const priorityFilter = document.getElementById('priorityFilter');
const taskSearch = document.getElementById('taskSearch');
const sortSelect = document.getElementById('sortSelect');
const clearCompletedButton = document.getElementById('clearCompletedButton');
const completeAllButton = document.getElementById('completeAllButton');
const clearArchiveButton = document.getElementById('clearArchiveButton');
const clearTagFilterButton = document.getElementById('clearTagFilterButton');
const activeTagLabel = document.getElementById('activeTagLabel');
const cancelTask = document.getElementById('cancelTask');
const archiveCompletedButton = document.getElementById('archiveCompletedButton');
const restoreAllArchiveButton = document.getElementById('restoreAllArchiveButton');
const undoSnackbar = document.getElementById('undoSnackbar');
const undoDeleteButton = document.getElementById('undoDeleteButton');
const dialogTitle = taskDialog.querySelector('h3');
const summaryCompleted = document.getElementById('summaryCompleted');
const summaryPending = document.getElementById('summaryPending');
const summaryHigh = document.getElementById('summaryHigh');
const summaryDue = document.getElementById('summaryDue');
const summaryArchive = document.getElementById('summaryArchive');
const archiveCountLabel = document.getElementById('archiveCountLabel');
const archiveList = document.getElementById('archiveList');

let activePriorityFilter = 'All';
let activeDueFilter = 'All';
let activeTagFilter = '';
let sortMode = 'priority';
let lastDeletedTask = null;
let lastDeletedTimeout = null;
let editingTaskId = null;


let tasks = JSON.parse(localStorage.getItem('bekard-tasks') || '[]');
let focusTaskId = localStorage.getItem('bekard-focus-task') || null;
let completedTasks = Number(localStorage.getItem('bekard-completed') || 0);
let streakDays = Number(localStorage.getItem('bekard-streak') || 0);

function saveState() {
  localStorage.setItem('bekard-tasks', JSON.stringify(tasks));
  localStorage.setItem('bekard-focus-task', focusTaskId || '');
  localStorage.setItem('bekard-completed', String(completedTasks));
  localStorage.setItem('bekard-streak', String(streakDays));
}

function resetTaskForm() {
  editingTaskId = null;
  dialogTitle.textContent = 'Add a new task';
  taskTitle.value = '';
  taskDescription.value = '';
  taskPriority.value = 'Medium';
  taskTags.value = '';
  taskDueDate.value = '';
}

function renderTasks() {
  taskList.innerHTML = '';
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const searchTerm = taskSearch.value.trim().toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  const filteredTasks = tasks
    .filter((task) => !task.archived)
    .filter((task) => activePriorityFilter === 'All' || task.priority === activePriorityFilter)
    .filter((task) => {
      if (activeDueFilter === 'All') return true;
      if (!task.dueDate) return false;
      if (activeDueFilter === 'Today') {
        return task.dueDate === today;
      }
      if (activeDueFilter === 'Overdue') {
        return new Date(task.dueDate) < new Date() && !task.complete;
      }
      return true;
    })
    .filter((task) => {
      if (!searchTerm) return true;
      return task.title.toLowerCase().includes(searchTerm)
        || (task.description || '').toLowerCase().includes(searchTerm)
        || (task.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm));
    })
    .filter((task) => !activeTagFilter || (task.tags || []).includes(activeTagFilter))
    .slice()
    .sort((a, b) => {
      if (sortMode === 'due') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortMode === 'newest') {
        return b.id.localeCompare(a.id);
      }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No tasks match the selected priority. Try a different filter or add a new task.';
    taskList.appendChild(emptyState);
    return;
  }

  let currentPriority = '';
  filteredTasks.forEach((task) => {
    if (task.priority !== currentPriority) {
      currentPriority = task.priority;
      const groupHeader = document.createElement('div');
      groupHeader.className = 'priority-group';
      groupHeader.textContent = `${currentPriority} Priority`;
      taskList.appendChild(groupHeader);
    }

    const card = document.createElement('div');
    const isOverdue = task.dueDate && !task.complete && new Date(task.dueDate) < new Date();
    const isDueToday = task.dueDate === today && !task.complete;
    card.className = `task-card priority-${(task.priority || 'Medium').toLowerCase()}${task.complete ? ' completed' : ''}${isOverdue ? ' overdue' : ''}${isDueToday ? ' due-today' : ''}`;
    card.innerHTML = `
      <div class="task-row">
        <strong>${task.title}</strong>
        <span class="priority-pill">${task.priority}</span>
      </div>
      <p>${task.description || 'No description'}</p>
      ${task.tags && task.tags.length > 0 ? `<div class="task-tags">${task.tags.map((tag) => `<button type="button" class="tag-pill filter-tag" data-tag="${tag}">${tag}</button>`).join('')}</div>` : ''}
      ${task.dueDate ? `<div class="due-date${isOverdue ? ' overdue-date' : isDueToday ? ' due-today-date' : ''}">${task.dueDate === today ? 'Due today' : `Due ${new Date(task.dueDate).toLocaleDateString()}`}</div>` : ''}
      <div class="task-actions">
        <button data-action="complete" data-id="${task.id}" class="secondary-btn">${task.complete ? 'Completed' : 'Complete'}</button>
        <button data-action="set-focus" data-id="${task.id}" class="ghost-btn">${focusTaskId === task.id ? 'Focused' : 'Set focus'}</button>
        <button data-action="edit" data-id="${task.id}" class="ghost-btn">Edit</button>
        ${task.complete ? `<button data-action="archive" data-id="${task.id}" class="ghost-btn">Archive</button>` : ''}
        <button data-action="delete" data-id="${task.id}" class="ghost-btn">Delete</button>
      </div>
    `;

    taskList.appendChild(card);
  });
}

function setFocusTask(id) {
  focusTaskId = id;
  const task = tasks.find((item) => item.id === id);
  focusGoal.textContent = task ? task.title : 'No focus goal yet';
  focusDescription.textContent = task ? task.description || 'A primary task focuses your day.' : 'Set a primary task to stay on track across the day.';
  saveState();
  renderTasks();
}

function completeFocusTask() {
  if (!focusTaskId) return;
  const task = tasks.find((item) => item.id === focusTaskId);
  if (!task || task.complete) return;

  task.complete = true;
  completedTasks += 1;
  streakDays += 1;
  saveState();
  renderTasks();
  updateSummary();
}

function showUndoSnackbar(task) {
  lastDeletedTask = task;
  undoSnackbar.classList.add('visible');
  clearTimeout(lastDeletedTimeout);
  lastDeletedTimeout = setTimeout(() => {
    undoSnackbar.classList.remove('visible');
    lastDeletedTask = null;
  }, 5000);
}

function renderArchive() {
  const archivedTasks = tasks.filter((task) => task.archived);
  archiveCountLabel.textContent = `${archivedTasks.length} archived`;
  summaryArchive.textContent = String(archivedTasks.length);

  archiveList.innerHTML = '';
  if (archivedTasks.length === 0) {
    archiveList.textContent = 'No archived tasks yet.';
    return;
  }

  archivedTasks.forEach((task) => {
    const card = document.createElement('div');
    card.className = 'task-card archived-task';
    card.innerHTML = `
      <div class="task-row">
        <strong>${task.title}</strong>
        <span class="priority-pill">${task.priority}</span>
      </div>
      <p>${task.description || 'No description'}</p>
      ${task.tags && task.tags.length > 0 ? `<div class="task-tags">${task.tags.map((tag) => `<span class="tag-pill">${tag}</span>`).join('')}</div>` : ''}
      ${task.dueDate ? `<div class="due-date">Due ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
      <div class="task-actions">
        <button data-action="restore" data-id="${task.id}" class="secondary-btn">Restore</button>
      </div>
    `;
    archiveList.appendChild(card);
  });
}

function clearArchivedTasks() {
  tasks = tasks.filter((task) => !task.archived);
  saveState();
  renderTasks();
  renderArchive();
  updateSummary();
}

function clearCompletedTasks() {
  const beforeCount = tasks.length;
  tasks = tasks.filter((task) => !task.complete || task.archived);
  if (tasks.length !== beforeCount) {
    saveState();
    renderTasks();
    renderArchive();
    updateSummary();
  }
}

function completeAllTasks() {
  const pendingTasks = tasks.filter((task) => !task.complete && !task.archived);
  if (pendingTasks.length === 0) return;
  pendingTasks.forEach((task) => {
    task.complete = true;
  });
  completedTasks += pendingTasks.length;
  streakDays += 1;
  saveState();
  renderTasks();
  updateSummary();
}

function archiveCompletedTasks() {
  const completedCount = tasks.filter((task) => task.complete && !task.archived).length;
  tasks = tasks.map((task) => ({
    ...task,
    archived: task.complete ? true : task.archived,
  }));
  if (completedCount > 0) {
    saveState();
    renderTasks();
    renderArchive();
    updateSummary();
  }
}

function restoreAllArchived() {
  const hasArchived = tasks.some((task) => task.archived);
  if (!hasArchived) return;
  tasks = tasks.map((task) => ({
    ...task,
    archived: false,
  }));
  saveState();
  renderTasks();
  renderArchive();
  updateSummary();
}

function undoDelete() {
  if (!lastDeletedTask) return;
  tasks.push(lastDeletedTask);
  lastDeletedTask = null;
  undoSnackbar.classList.remove('visible');
  saveState();
  renderTasks();
  updateSummary();
}

function addTask(event) {
  event.preventDefault();
  const title = taskTitle.value.trim();
  const description = taskDescription.value.trim();
  const priority = taskPriority.value;
  if (!title) return;

  if (editingTaskId) {
    const task = tasks.find((item) => item.id === editingTaskId);
    if (task) {
      task.title = title;
      task.description = description;
      task.priority = priority;
      task.tags = taskTags.value.split(',').map((tag) => tag.trim()).filter(Boolean);
      task.dueDate = taskDueDate.value || null;
      saveState();
      renderTasks();
      updateSummary();
      taskDialog.close();
      resetTaskForm();
      return;
    }
  }

  const task = {
    id: `task-${Date.now()}`,
    title,
    description,
    priority,
    tags: taskTags.value.split(',').map((tag) => tag.trim()).filter(Boolean),
    dueDate: taskDueDate.value || null,
    complete: false,
    archived: false,
  };

  tasks.push(task);
  saveState();
  renderTasks();
  updateSummary();
  taskDialog.close();
  resetTaskForm();
}

priorityFilter.addEventListener('change', (event) => {
  activePriorityFilter = event.target.value;
  renderTasks();
});

taskSearch.addEventListener('input', () => renderTasks());
clearTagFilterButton.addEventListener('click', () => {
  activeTagFilter = '';
  updateTagFilterLabel();
  renderTasks();
});
dueFilter.addEventListener('change', (event) => {
  activeDueFilter = event.target.value;
  renderTasks();
});
sortSelect.addEventListener('change', (event) => {
  sortMode = event.target.value;
  renderTasks();
});
completeAllButton.addEventListener('click', completeAllTasks);
clearCompletedButton.addEventListener('click', clearCompletedTasks);
archiveCompletedButton.addEventListener('click', archiveCompletedTasks);
restoreAllArchiveButton.addEventListener('click', restoreAllArchived);
clearArchiveButton.addEventListener('click', clearArchivedTasks);

undoDeleteButton.addEventListener('click', () => undoDelete());

function updateTagFilterLabel() {
  if (!activeTagFilter) {
    activeTagLabel.classList.add('hidden');
    clearTagFilterButton.classList.add('hidden');
    return;
  }
  activeTagLabel.textContent = `Tag: ${activeTagFilter}`;
  activeTagLabel.classList.remove('hidden');
  clearTagFilterButton.classList.remove('hidden');
}

function updateSummary() {
  const total = tasks.length;
  const done = tasks.filter((task) => task.complete).length;
  summaryValue.textContent = `${done} / ${total}`;
  pendingCount.textContent = `${total - done} pending`;
  summaryNote.textContent = total === 0
    ? 'Start by adding a task and tracking one win.'
    : done === total
      ? 'All set — you completed today’s board!'
      : 'Keep your attention on the tasks that matter most.';
  completedCount.textContent = String(completedTasks);
  streakCount.textContent = String(streakDays);
  updateSummaryReport();
}

function updateSummaryReport() {
  const completed = tasks.filter((task) => task.complete).length;
  const pending = tasks.length - completed;
  const highRemaining = tasks.filter((task) => task.priority === 'High' && !task.complete).length;
  const today = new Date().toISOString().split('T')[0];
  const dueToday = tasks.filter((task) => task.dueDate === today && !task.complete).length;
  summaryCompleted.textContent = String(completed);
  summaryPending.textContent = String(pending);
  summaryHigh.textContent = String(highRemaining);
  summaryDue.textContent = String(dueToday);
}

addTaskButton.addEventListener('click', () => {
  resetTaskForm();
  taskDialog.showModal();
});
focusButton.addEventListener('click', () => {
  if (tasks.length > 0) {
    setFocusTask(tasks[0].id);
  }
});
completeButton.addEventListener('click', completeFocusTask);
cancelTask.addEventListener('click', () => {
  resetTaskForm();
  taskDialog.close();
});
taskDialog.addEventListener('submit', addTask);

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key.toLowerCase() === 'e') {
    event.preventDefault();
    taskDialog.showModal();
    return;
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'a') {
    event.preventDefault();
    completeAllTasks();
    return;
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    taskSearch.focus();
  }
});

taskList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const id = button.dataset.id;
  if (button.dataset.action === 'complete') {
    const task = tasks.find((item) => item.id === id);
    if (task && !task.complete) {
      task.complete = true;
      completedTasks += 1;
      saveState();
      renderTasks();
      updateSummary();
    }
    return;
  }

  if (button.dataset.action === 'set-focus') {
    setFocusTask(id);
    return;
  }

  if (button.dataset.action === 'edit') {
    const task = tasks.find((item) => item.id === id);
    if (task) {
      editingTaskId = id;
      taskTitle.value = task.title;
      taskDescription.value = task.description;
      taskPriority.value = task.priority;
      taskTags.value = (task.tags || []).join(', ');
      taskDueDate.value = task.dueDate || '';
      dialogTitle.textContent = 'Edit task';
      taskDialog.showModal();
    }
    return;
  }

  if (button.dataset.tag) {
    activeTagFilter = button.dataset.tag;
    updateTagFilterLabel();
    renderTasks();
    return;
  }

  if (button.dataset.action === 'archive') {
    const task = tasks.find((item) => item.id === id);
    if (task) {
      task.archived = true;
      if (focusTaskId === id) {
        focusTaskId = null;
        focusGoal.textContent = 'No focus goal yet';
        focusDescription.textContent = 'Set a primary task to stay on track across the day.';
      }
      saveState();
      renderTasks();
      renderArchive();
      updateSummary();
    }
    return;
  }

  if (button.dataset.action === 'restore') {
    const task = tasks.find((item) => item.id === id);
    if (task) {
      task.archived = false;
      saveState();
      renderTasks();
      renderArchive();
      updateSummary();
    }
    return;
  }

  if (button.dataset.action === 'delete') {
    const task = tasks.find((item) => item.id === id);
    tasks = tasks.filter((item) => item.id !== id);
    if (focusTaskId === id) {
      focusTaskId = null;
      focusGoal.textContent = 'No focus goal yet';
      focusDescription.textContent = 'Set a primary task to stay on track across the day.';
    }
    saveState();
    renderTasks();
    renderArchive();
    updateSummary();
    showUndoSnackbar(task);
    return;
  }
});

function loadState() {
  if (focusTaskId) {
    const task = tasks.find((item) => item.id === focusTaskId);
    if (task) {
      focusGoal.textContent = task.title;
      focusDescription.textContent = task.description || 'A primary task focuses your day.';
    }
  }
  renderTasks();
  renderArchive();
  updateSummary();
  updateTagFilterLabel();
}

loadState();
