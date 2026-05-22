import { useEffect } from 'react';
import { getSocket } from '../lib/socket';
import { useBoardStore } from '../store/useBoardStore';

export const useSocket = (boardId) => {
  const { addTask, removeTask, updateTaskInStore } = useBoardStore();

  useEffect(() => {
    if (!boardId) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit('join:board', boardId);

    const handleTaskCreated = (task) => {
      addTask(task);
    };

    const handleTaskUpdated = (task) => {
      updateTaskInStore(task);
    };

    const handleTaskDeleted = ({ id }) => {
      removeTask(id);
    };

    const handleTasksReordered = ({ tasks }) => {
      tasks.forEach(({ id, status, order }) => {
        const task = useBoardStore.getState().tasks.find(t => t._id === id);
        if (task) {
          updateTaskInStore({ ...task, status, order });
        }
      });
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('tasks:reordered', handleTasksReordered);

    return () => {
      socket.emit('leave:board', boardId);
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('tasks:reordered', handleTasksReordered);
    };
  }, [boardId, addTask, removeTask, updateTaskInStore]);
};
