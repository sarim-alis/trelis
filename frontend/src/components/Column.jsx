import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

export const Column = ({ status, title, tasks, onAddTask, onDeleteTask, onEditTask }) => {
  const { setNodeRef } = useDroppable({ id: status });

  const columnTasks = tasks.filter(task => task.status === status);

  return (
    <div className="flex-1 min-w-[300px]">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {title}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({columnTasks.length})
            </span>
          </h2>
          <button
            onClick={() => onAddTask(status)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <Plus size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[200px]"
        >
          <SortableContext
            items={columnTasks.map(t => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {columnTasks.map(task => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </SortableContext>

          {columnTasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
