import { useState, useEffect } from 'react';
import { Modal } from './Modal';

export const BoardModal = ({ isOpen, onClose, onSubmit, board }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [board]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title, description });
      onClose();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={board ? 'Edit Board' : 'Create Board'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter board title"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Enter board description"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? 'Creating...' : (board ? 'Update' : 'Create')}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
