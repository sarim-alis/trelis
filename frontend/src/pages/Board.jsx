import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useBoardStore } from '../store/useBoardStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { useSocket } from '../hooks/useSocket';
import { useDebounce } from '../hooks/useDebounce';
import { Column } from '../components/Column';
import { TaskCard } from '../components/TaskCard';
import { TaskModal } from '../components/TaskModal';
import { ArrowLeft, Search, Moon, Sun, Activity } from 'lucide-react';

export const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBoard, tasks, activities, fetchBoard, fetchTasks, fetchActivities, createTask, updateTask, deleteTask, reorderTasks } = useBoardStore();
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [activeId, setActiveId] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [showActivities, setShowActivities] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  useSocket(id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (id) {
      fetchBoard(id);
      fetchTasks(id);
      fetchActivities(id);
    }
  }, [id, fetchBoard, fetchTasks, fetchActivities]);

  useEffect(() => {
    if (id && debouncedSearch !== undefined) {
      fetchTasks(id, debouncedSearch);
    }
  }, [debouncedSearch, id, fetchTasks]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    const overTask = tasks.find(t => t._id === overId);
    
    let newStatus = activeTask.status;
    
    if (['todo', 'inprogress', 'done'].includes(overId)) {
      newStatus = overId;
    } else if (overTask) {
      newStatus = overTask.status;
    }

    if (activeTask.status !== newStatus) {
      const updatedTasks = tasks.map(t => 
        t._id === active.id ? { ...t, status: newStatus } : t
      );
      useBoardStore.setState({ tasks: updatedTasks });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    const overId = over.id;
    let newStatus = activeTask.status;
    
    if (['todo', 'inprogress', 'done'].includes(overId)) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    const statusTasks = tasks.filter(t => t.status === newStatus);
    const oldIndex = statusTasks.findIndex(t => t._id === active.id);
    const newIndex = statusTasks.findIndex(t => t._id === overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const reordered = arrayMove(statusTasks, oldIndex, newIndex);
      const updatedTasks = reordered.map((task, index) => ({
        id: task._id,
        status: newStatus,
        order: index
      }));
      
      await reorderTasks(id, updatedTasks);
    } else if (activeTask.status !== newStatus) {
      await updateTask(active.id, { status: newStatus });
    }
  };

  const handleAddTask = (status) => {
    setDefaultStatus(status);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (data) => {
    if (editingTask) {
      await updateTask(editingTask._id, data);
    } else {
      await createTask(id, data.title, data.description, data.status);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const activeTask = activeId ? tasks.find(t => t._id === activeId) : null;

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentBoard.title}
                </h1>
                {currentBoard.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {currentBoard.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowActivities(!showActivities)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Activity size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {isDark ? (
                  <Sun size={20} className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon size={20} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6 overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <Column
              status="todo"
              title="To Do"
              tasks={tasks}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
            <Column
              status="inprogress"
              title="In Progress"
              tasks={tasks}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />
            <Column
              status="done"
              title="Done"
              tasks={tasks}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTask}
            />

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3">
                  <TaskCard task={activeTask} onDelete={() => {}} onEdit={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {showActivities && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-20">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Activity Log
              </h2>
              <button
                onClick={() => setShowActivities(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No activity yet
              </p>
            ) : (
              activities.map((activity) => (
                <div key={activity._id} className="text-sm">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-medium">{activity.user?.username}</span>
                    {' '}{activity.details}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
};
