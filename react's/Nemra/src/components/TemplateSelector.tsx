import { templates, applyTemplate } from "../utils/taskTemplates";
import { Task } from "../types";

type Props = {
  onApply: (tasks: Task[]) => void;
  onClose: () => void;
};

export default function TemplateSelector({ onApply, onClose }: Props) {
  const handleApply = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      const newTasks = applyTemplate(template);
      onApply(newTasks);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Task Templates
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 transition-all cursor-pointer"
              onClick={() => handleApply(template.id)}
            >
              <h3 className="text-xl font-bold mb-2">{template.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{template.description}</p>
              <div className="space-y-1">
                {template.tasks.slice(0, 3).map((task, index) => (
                  <div key={index} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    {task.text}
                  </div>
                ))}
                {template.tasks.length > 3 && (
                  <div className="text-xs text-gray-400">
                    +{template.tasks.length - 3} more tasks
                  </div>
                )}
              </div>
              <button className="mt-4 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                Apply Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}