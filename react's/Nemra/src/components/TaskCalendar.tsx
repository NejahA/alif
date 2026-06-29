import { Task } from "../types";

type Props = {
  tasks: Task[];
  onDateClick: (date: string) => void;
};

export default function TaskCalendar({ tasks, onDateClick }: Props) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const getTasksForDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate === dateStr);
  };
  
  const days: React.ReactNode[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-20"></div>);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    const tasksForDay = getTasksForDate(day);
    const isToday = day === today.getDate();
    
    days.push(
      <div
        key={day}
        onClick={() => {
          const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          onDateClick(dateStr);
        }}
        className={`h-20 border border-gray-200 p-2 cursor-pointer hover:bg-purple-50 transition-all ${isToday ? 'bg-purple-100 font-bold' : ''}`}
      >
        <div className="text-sm">{day}</div>
        {tasksForDay.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tasksForDay.slice(0, 3).map(task => (
              <div
                key={task.id}
                className={`w-2 h-2 rounded-full ${
                  task.completed ? 'bg-green-500' :
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}
              />
            ))}
            {tasksForDay.length > 3 && (
              <span className="text-xs text-gray-500">+{tasksForDay.length - 3}</span>
            )}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-xl font-bold mb-4 text-center">
        {monthNames[currentMonth]} {currentYear}
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}