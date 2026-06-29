import { Task } from "../types";

export function exportToCSV(tasks: Task[]): void {
  const headers = ["ID", "Task", "Status", "Priority", "Due Date", "Tags", "Created", "Completed", "Time Spent (min)", "Notes"];
  
  const rows = tasks.map(task => [
    task.id,
    task.text.replace(/"/g, '""'),
    task.completed ? "Completed" : "Active",
    task.priority,
    task.dueDate || "",
    task.tags.join("; "),
    new Date(task.createdAt).toLocaleString(),
    task.completedAt ? new Date(task.completedAt).toLocaleString() : "",
    task.timeSpent ? Math.floor(task.timeSpent / 60).toString() : "",
    task.notes ? task.notes.replace(/"/g, '""') : ""
  ]);
  
  const csv = [
    headers.map(h => `"${h}"`).join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  downloadFile(csv, "tasks.csv", "text/csv");
}

export function exportToMarkdown(tasks: Task[]): void {
  let markdown = "# Nemra Export\n\n";
  markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  const active = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  
  if (active.length > 0) {
    markdown += "## Active Tasks\n\n";
    active.forEach(task => {
      markdown += `- [ ] **${task.text}**\n`;
      markdown += `  - Priority: ${task.priority}\n`;
      if (task.dueDate) markdown += `  - Due: ${task.dueDate}\n`;
      if (task.tags.length > 0) markdown += `  - Tags: ${task.tags.join(", ")}\n`;
      if (task.notes) markdown += `  - Notes: ${task.notes}\n`;
      markdown += "\n";
    });
  }
  
  if (completed.length > 0) {
    markdown += "## Completed Tasks\n\n";
    completed.forEach(task => {
      markdown += `- [x] ~~${task.text}~~\n`;
      if (task.completedAt) {
        markdown += `  - Completed: ${new Date(task.completedAt).toLocaleDateString()}\n`;
      }
      markdown += "\n";
    });
  }
  
  downloadFile(markdown, "tasks.md", "text/markdown");
}

export function exportToPDF(tasks: Task[]): void {
  // Create HTML content for PDF
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #7c3aed; }
        .task { margin: 15px 0; padding: 10px; border-left: 4px solid #7c3aed; background: #f9fafb; }
        .completed { opacity: 0.6; text-decoration: line-through; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .meta { font-size: 12px; color: #6b7280; margin-top: 5px; }
        .tag { display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 2px 8px; border-radius: 12px; margin: 2px; font-size: 11px; }
      </style>
    </head>
    <body>
      <h1>Nemra Export</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
  `;
  
  tasks.forEach(task => {
    html += `
      <div class="task priority-${task.priority} ${task.completed ? 'completed' : ''}">
        <strong>${task.text}</strong>
        <div class="meta">
          Priority: ${task.priority.toUpperCase()} | 
          Created: ${new Date(task.createdAt).toLocaleDateString()}
          ${task.dueDate ? ` | Due: ${task.dueDate}` : ''}
          ${task.completed && task.completedAt ? ` | Completed: ${new Date(task.completedAt).toLocaleDateString()}` : ''}
        </div>
        ${task.tags.length > 0 ? `<div>${task.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        ${task.notes ? `<div style="margin-top: 8px; font-size: 13px;">${task.notes}</div>` : ''}
      </div>
    `;
  });
  
  html += `
    </body>
    </html>
  `;
  
  downloadFile(html, "tasks.html", "text/html");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}