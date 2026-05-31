"use client";

import { useState, useEffect } from "react";
import { Task, Filter, SortBy, ViewMode, Subtask } from "./types";
import TaskStats from "./components/TaskStats";
import KanbanView from "./components/KanbanView";
import TaskCalendar from "./components/TaskCalendar";
import TaskTimer from "./components/TaskTimer";
import TaskNotes from "./components/TaskNotes";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import TemplateSelector from "./components/TemplateSelector";
import SmartSuggestions from "./components/SmartSuggestions";
import QuickActions from "./components/QuickActions";
import AIAssistant from "./components/AIAssistant";
import BackupManager from "./components/BackupManager";
import AdvancedSearch from "./components/AdvancedSearch";
import { exportToCSV, exportToMarkdown, exportToPDF } from "./utils/taskExport";
import { autoBackup, saveBackup } from "./utils/taskBackup";
import { advancedSearch, SearchFilter } from "./utils/taskSearch";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [category, setCategory] = useState<string>("todo");
  const [darkMode, setDarkMode] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [showNotes, setShowNotes] = useState<string | null>(null);
  const [showSubtasks, setShowSubtasks] = useState<string | null>(null);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearchFilter, setAdvancedSearchFilter] = useState<SearchFilter | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    autoBackup(tasks);
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      createdAt: Date.now(),
      priority,
      dueDate: dueDate || undefined,
      tags: tagInput ? tagInput.split(",").map(t => t.trim()).filter(Boolean) : [],
      category,
      subtasks: [],
    };

    setTasks([newTask, ...tasks]);
    setInput("");
    setDueDate("");
    setTagInput("");
    setPriority("medium");
    setCategory("todo");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { 
        ...task, 
        completed: !task.completed,
        completedAt: !task.completed ? Date.now() : undefined
      } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: editText.trim() } : task
    ));
    setEditingId(null);
    setEditText("");
  };

  const updatePriority = (id: string, priority: "low" | "medium" | "high") => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, priority } : task
    ));
  };

  const updateCategory = (id: string, category: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, category } : task
    ));
  };

  const duplicateTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      completed: false,
      completedAt: undefined,
      createdAt: Date.now(),
      text: task.text + " (copy)",
    };
    setTasks([newTask, ...tasks]);
  };

  const exportTasks = () => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tasks-" + new Date().toISOString().split("T")[0] + ".json";
    link.click();
  };

  const exportTasksCSV = () => exportToCSV(tasks);
  const exportTasksMarkdown = () => exportToMarkdown(tasks);
  const exportTasksPDF = () => exportToPDF(tasks);

  const applyTaskTemplate = (newTasks: Task[]) => {
    setTasks([...newTasks, ...tasks]);
  };

  const bulkCompleteActiveTasks = () => {
    setTasks(tasks.map(task => 
      !task.completed ? { ...task, completed: true, completedAt: Date.now() } : task
    ));
  };

  const bulkDeleteCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const archiveCompleted = () => {
    const completed = tasks.filter(t => t.completed);
    const archived = JSON.parse(localStorage.getItem("archivedTasks") || "[]");
    localStorage.setItem("archivedTasks", JSON.stringify([...archived, ...completed]));
    setTasks(tasks.filter(t => !t.completed));
  };

  const applyAISuggestions = (suggestions: any) => {
    if (suggestions.priority) setPriority(suggestions.priority);
    if (suggestions.tags) setTagInput(prev => prev ? prev + "," + suggestions.tags.join(",") : suggestions.tags.join(","));
    if (suggestions.dueDate) setDueDate(suggestions.dueDate);
  };

  const scrollToTask = (taskId: string) => {
    const element = document.getElementById("task-" + taskId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("ring-4", "ring-purple-500");
      setTimeout(() => {
        element.classList.remove("ring-4", "ring-purple-500");
      }, 2000);
    }
  };

  const importTasks = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setTasks([...imported, ...tasks]);
      } catch (error) {
        alert("Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const handleTimerComplete = (taskId: string, timeSpent: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, timeSpent: (task.timeSpent || 0) + timeSpent, completed: true, completedAt: Date.now() } : task
    ));
    setActiveTimer(null);
  };

  const saveNotes = (taskId: string, notes: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, notes } : task
    ));
  };

  const addSubtask = (taskId: string) => {
    if (!subtaskInput.trim()) return;
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newSubtask: Subtask = {
          id: Date.now().toString(),
          text: subtaskInput.trim(),
          completed: false,
        };
        return {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask],
        };
      }
      return task;
    }));
    setSubtaskInput("");
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && task.subtasks) {
        return {
          ...task,
          subtasks: task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          ),
        };
      }
      return task;
    }));
  };

  const handleCalendarDateClick = (date: string) => {
    setSearchQuery("");
    setFilter("all");
    const tasksForDate = tasks.filter(t => t.dueDate === date);
    if (tasksForDate.length > 0) {
      setSearchQuery(date);
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === "active") return !task.completed;
      if (filter === "completed") return task.completed;
      return true;
    })
    .filter(task => {
      if (advancedSearchFilter) {
        return advancedSearch([task], advancedSearchFilter).length > 0;
      }
      if (!searchQuery) return true;
      return task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
             task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "alphabetical") {
        return a.text.localeCompare(b.text);
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return b.createdAt - a.createdAt;
    });

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    highPriority: tasks.filter(t => !t.completed && t.priority === "high").length,
  };

  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const priorityColors = {
    high: "bg-red-100 text-red-700 border-red-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
    low: "bg-green-100 text-green-700 border-green-300",
  };

  const bgClass = darkMode ? "bg-gray-900" : "bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50";
  const cardClass = darkMode ? "bg-gray-800" : "bg-white";
  const textClass = darkMode ? "text-gray-400" : "text-gray-600";
  const inputClass = darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200";

  return (
    <main className={"min-h-screen " + bgClass + " p-4 md:p-8 transition-colors"}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 mt-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Nemra
            </h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
          <p className={textClass}>Stay organized, stay productive</p>
        </div>

        <TaskStats tasks={tasks} />

        <SmartSuggestions tasks={tasks} onSelectTask={scrollToTask} />

        <QuickActions
          tasks={tasks}
          onBulkComplete={bulkCompleteActiveTasks}
          onBulkDelete={bulkDeleteCompleted}
          onArchiveCompleted={archiveCompleted}
        />

        {activeTimer && (
          <div className="mb-6">
            <TaskTimer
              taskId={activeTimer}
              taskName={tasks.find(t => t.id === activeTimer)?.text || ""}
              onComplete={handleTimerComplete}
            />
          </div>
        )}

        {showNotes && (
          <TaskNotes
            taskId={showNotes}
            initialNotes={tasks.find(t => t.id === showNotes)?.notes}
            onSave={saveNotes}
            onClose={() => setShowNotes(null)}
          />
        )}

        {showAnalytics && (
          <AnalyticsDashboard
            tasks={tasks}
            onClose={() => setShowAnalytics(false)}
          />
        )}

        {showTemplates && (
          <TemplateSelector
            onApply={applyTaskTemplate}
            onClose={() => setShowTemplates(false)}
          />
        )}

        {showBackupManager && (
          <BackupManager
            onRestore={(tasks) => setTasks(tasks)}
            onClose={() => setShowBackupManager(false)}
          />
        )}

        {showAdvancedSearch && (
          <AdvancedSearch
            onSearch={(filter) => {
              setAdvancedSearchFilter(filter);
              setSearchQuery("");
            }}
            onClose={() => setShowAdvancedSearch(false)}
            allTags={allTags}
          />
        )}

        <div className={cardClass + " rounded-2xl shadow-xl p-6 mb-6"}>
          <form onSubmit={addTask} className="space-y-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What needs to be done?"
              className={"w-full px-4 py-3 border " + inputClass + " rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"}
            />
            
            <AIAssistant taskText={input} onApplySuggestions={applyAISuggestions} />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className={"block text-sm " + textClass + " mb-1"}>Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={"w-full px-3 py-2 border " + inputClass + " rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                </select>
              </div>

              <div>
                <label className={"block text-sm " + textClass + " mb-1"}>Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className={"w-full px-3 py-2 border " + inputClass + " rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className={"block text-sm " + textClass + " mb-1"}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={"w-full px-3 py-2 border " + inputClass + " rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"}
                />
              </div>
              
              <div>
                <label className={"block text-sm " + textClass + " mb-1"}>Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="work, urgent"
                  className={"w-full px-3 py-2 border " + inputClass + " rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
            >
              Add Task
            </button>
          </form>
        </div>

        <div className={cardClass + " rounded-2xl shadow-xl p-6 mb-6"}>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setAdvancedSearchFilter(null);
              }}
              placeholder="Search tasks or tags..."
              className={"flex-1 px-4 py-2 border " + inputClass + " rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"}
            />
            <button
              onClick={() => setShowAdvancedSearch(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              title="Advanced Search"
            >
              🔍+
            </button>
            <button
              onClick={() => setShowBackupManager(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all"
              title="Backup Manager"
            >
              💾
            </button>
            <button
              onClick={() => saveBackup(tasks)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
              title="Create Backup"
            >
              📦
            </button>
            <button
              onClick={() => setViewMode(viewMode === "list" ? "kanban" : "list")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              {viewMode === "list" ? "📊 Kanban" : "📝 List"}
            </button>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
            >
              {showCalendar ? "📋 Tasks" : "📅 Calendar"}
            </button>
            <button
              onClick={() => setShowAnalytics(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all"
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all"
            >
              📋 Templates
            </button>
            <div className="relative group">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                📥 Export ▼
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button onClick={exportTasks} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg">JSON</button>
                <button onClick={exportTasksCSV} className="block w-full text-left px-4 py-2 hover:bg-gray-100">CSV</button>
                <button onClick={exportTasksMarkdown} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Markdown</button>
                <button onClick={exportTasksPDF} className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg">HTML/PDF</button>
              </div>
            </div>
            <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer">
              📤 Import
              <input type="file" accept=".json" onChange={importTasks} className="hidden" />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={"px-4 py-2 rounded-lg font-medium transition-all capitalize " + (filter === f ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
              >
                {f}
              </button>
            ))}
            
            <div className="ml-auto flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="dueDate">Sort by Due Date</option>
                <option value="alphabetical">Sort A-Z</option>
              </select>
              
              {stats.completed > 0 && (
                <button
                  onClick={clearCompleted}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  Clear Completed
                </button>
              )}
            </div>
          </div>

          <div className={"flex flex-wrap gap-4 text-sm " + textClass + " mb-4 pb-4 border-b"}>
            <span>Total: {stats.total}</span>
            <span>Active: {stats.active}</span>
            <span>Completed: {stats.completed}</span>
            {stats.highPriority > 0 && (
              <span className="text-red-600 font-medium">High Priority: {stats.highPriority}</span>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
              <span className={"text-sm " + textClass}>Tags:</span>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {showCalendar ? (
            <TaskCalendar tasks={tasks} onDateClick={handleCalendarDateClick} />
          ) : viewMode === "kanban" ? (
            <KanbanView
              tasks={filteredTasks}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onEdit={startEdit}
              onUpdateCategory={updateCategory}
            />
          ) : (
            <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-center text-gray-400 py-8">
                {searchQuery ? "No tasks match your search" : filter === "all" ? "No tasks yet. Add one above!" : "No " + filter + " tasks"}
              </p>
            ) : (
              filteredTasks.map((task) => (
                <div
                  id={"task-" + task.id}
                  key={task.id}
                  className={"p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group border-l-4 " + (task.priority === "high" ? "border-red-500" : task.priority === "medium" ? "border-yellow-500" : "border-green-500")}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="w-5 h-5 mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEdit(task.id)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={task.completed ? "line-through text-gray-400" : "text-gray-800"}>
                              {task.text}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <select
                              value={task.priority}
                              onChange={(e) => updatePriority(task.id, e.target.value as any)}
                              className={"px-2 py-1 rounded border " + priorityColors[task.priority] + " cursor-pointer"}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            
                            {task.dueDate && (
                              <span className={isOverdue(task.dueDate) && !task.completed ? "px-2 py-1 rounded bg-red-100 text-red-700" : "px-2 py-1 rounded bg-blue-100 text-blue-700"}>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                            
                            {task.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-purple-100 text-purple-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                            
                            {task.timeSpent && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                ⏱ {Math.floor(task.timeSpent / 60)}m
                              </span>
                            )}
                            
                            {task.notes && (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded">
                                📝 Notes
                              </span>
                            )}
                          </div>
                          
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {task.subtasks.map(subtask => (
                                <div key={subtask.id} className="flex items-center gap-2 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={subtask.completed}
                                    onChange={() => toggleSubtask(task.id, subtask.id)}
                                    className="w-3 h-3"
                                  />
                                  <span className={subtask.completed ? "line-through text-gray-400" : "text-gray-600"}>
                                    {subtask.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {showSubtasks === task.id && (
                            <div className="mt-2 flex gap-2">
                              <input
                                type="text"
                                value={subtaskInput}
                                onChange={(e) => setSubtaskInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addSubtask(task.id)}
                                placeholder="Add subtask..."
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                              <button
                                onClick={() => addSubtask(task.id)}
                                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {editingId !== task.id && (
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <div className="flex gap-1">
                          <button
                            onClick={() => setActiveTimer(task.id)}
                            className={"px-2 py-1 rounded-lg text-xs " + (darkMode ? "text-indigo-400 hover:bg-gray-700" : "text-indigo-600 hover:bg-indigo-50")}
                            title="Start timer"
                          >
                            ⏱
                          </button>
                          <button
                            onClick={() => setShowNotes(task.id)}
                            className={"px-2 py-1 rounded-lg text-xs " + (darkMode ? "text-amber-400 hover:bg-gray-700" : "text-amber-600 hover:bg-amber-50")}
                            title="Add notes"
                          >
                            📝
                          </button>
                          <button
                            onClick={() => setShowSubtasks(showSubtasks === task.id ? null : task.id)}
                            className={"px-2 py-1 rounded-lg text-xs " + (darkMode ? "text-purple-400 hover:bg-gray-700" : "text-purple-600 hover:bg-purple-50")}
                            title="Add subtask"
                          >
                            ➕
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => duplicateTask(task)}
                            className={"px-2 py-1 rounded-lg text-xs " + (darkMode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-green-50")}
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => startEdit(task)}
                            className={"px-2 py-1 rounded-lg text-xs " + (darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50")}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className={"px-2 py-1 rounded-lg text-xs " + (darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50")}
                          >
                            Del
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
