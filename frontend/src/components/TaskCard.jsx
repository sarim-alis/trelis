import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';

export const TaskCard = ({ task, onDelete, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 cursor-pointer" onClick={() => onEdit(task)}>
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            {task.createdBy?.username || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={18} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
