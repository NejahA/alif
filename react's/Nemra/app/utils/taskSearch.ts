import { Task } from "../types";

export type SearchFilter = {
  query?: string;
  priority?: ("low" | "medium" | "high")[];
  tags?: string[];
  dateRange?: { start: string; end: string };
  completed?: boolean;
  hasNotes?: boolean;
  hasDueDate?: boolean;
};

export function advancedSearch(tasks: Task[], filter: SearchFilter): Task[] {
  return tasks.filter(task => {
    // Text search
    if (filter.query) {
      const query = filter.query.toLowerCase();
      const matchesText = task.text.toLowerCase().includes(query);
      const matchesTags = task.tags.some(tag => tag.toLowerCase().includes(query));
      const matchesNotes = task.notes?.toLowerCase().includes(query);
      
      if (!matchesText && !matchesTags && !matchesNotes) {
        return false;
      }
    }
    
    // Priority filter
    if (filter.priority && filter.priority.length > 0) {
      if (!filter.priority.includes(task.priority)) {
        return false;
      }
    }
    
    // Tags filter
    if (filter.tags && filter.tags.length > 0) {
      const hasTag = filter.tags.some(tag => task.tags.includes(tag));
      if (!hasTag) {
        return false;
      }
    }
    
    // Date range filter
    if (filter.dateRange) {
      const taskDate = task.dueDate || new Date(task.createdAt).toISOString().split('T')[0];
      if (taskDate < filter.dateRange.start || taskDate > filter.dateRange.end) {
        return false;
      }
    }
    
    // Completion filter
    if (filter.completed !== undefined) {
      if (task.completed !== filter.completed) {
        return false;
      }
    }
    
    // Has notes filter
    if (filter.hasNotes !== undefined) {
      const hasNotes = !!task.notes && task.notes.length > 0;
      if (hasNotes !== filter.hasNotes) {
        return false;
      }
    }
    
    // Has due date filter
    if (filter.hasDueDate !== undefined) {
      const hasDueDate = !!task.dueDate;
      if (hasDueDate !== filter.hasDueDate) {
        return false;
      }
    }
    
    return true;
  });
}

export function fuzzySearch(tasks: Task[], query: string): Task[] {
  const lowerQuery = query.toLowerCase();
  
  return tasks
    .map(task => {
      let score = 0;
      const lowerText = task.text.toLowerCase();
      
      // Exact match
      if (lowerText === lowerQuery) score += 100;
      
      // Starts with
      if (lowerText.startsWith(lowerQuery)) score += 50;
      
      // Contains
      if (lowerText.includes(lowerQuery)) score += 25;
      
      // Word match
      const words = lowerQuery.split(' ');
      words.forEach(word => {
        if (lowerText.includes(word)) score += 10;
      });
      
      // Tag match
      task.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) score += 15;
      });
      
      return { task, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.task);
}

export function searchByRegex(tasks: Task[], pattern: string): Task[] {
  try {
    const regex = new RegExp(pattern, 'i');
    return tasks.filter(task => 
      regex.test(task.text) || 
      task.tags.some(tag => regex.test(tag)) ||
      (task.notes && regex.test(task.notes))
    );
  } catch (error) {
    return [];
  }
}

export function getSearchSuggestions(tasks: Task[], query: string): string[] {
  const suggestions = new Set<string>();
  const lowerQuery = query.toLowerCase();
  
  tasks.forEach(task => {
    // Suggest task text
    if (task.text.toLowerCase().includes(lowerQuery)) {
      suggestions.add(task.text);
    }
    
    // Suggest tags
    task.tags.forEach(tag => {
      if (tag.toLowerCase().includes(lowerQuery)) {
        suggestions.add(tag);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 5);
}
