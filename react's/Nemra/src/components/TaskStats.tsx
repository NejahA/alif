import { Task } from "../types";

type Props = {
  tasks: Task[];
};

export default function TaskStats({ tasks }: Props) {
  const completedToday = tasks.filter(t => {
    if (!t.completed || !t.completedAt) return false;
    const today = new Date().toDateString();
    return new Date(t.completedAt).toDateString() === today;
  }).length;

  const streak = calculateStreak(tasks);
  const productivity = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <div className="text-3xl font-bold">{completedToday}</div>
        <div className="text-green-100">Completed Today</div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
        <div className="text-3xl font-bold">{streak} 🔥</div>
        <div className="text-orange-100">Day Streak</div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="text-3xl font-bold">{productivity}%</div>
        <div className="text-blue-100">Productivity Rate</div>
      </div>
    </div>
  );
}

function calculateStreak(tasks: Task[]): number {
  const completedDates = tasks
    .filter(t => t.completed && t.completedAt)
    .map(t => new Date(t.completedAt!).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (completedDates.length === 0) return 0;

  const uniqueDates = Array.from(new Set(completedDates));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    
    if (uniqueDates.includes(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}