import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/useBoardStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { BoardModal } from '../components/BoardModal';
import { Plus, LogOut, Moon, Sun, Trash2 } from 'lucide-react';

export const Dashboard = () => {
  const { boards, fetchBoards, createBoard, deleteBoard } = useBoardStore();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const handleCreateBoard = async (data) => {
    const board = await createBoard(data.title, data.description);
    navigate(`/board/${board._id}`);
  };

  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this board?')) {
      await deleteBoard(boardId);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Boards
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user?.username}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mb-4">
              <Plus size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No boards yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first board to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board._id}
                onClick={() => navigate(`/board/${board._id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {board.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteBoard(e, board._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  >
                    <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                  </button>
                </div>
                {board.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {board.description}
                  </p>
                )}
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                  Created {new Date(board.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBoard}
      />
    </div>
  );
};
