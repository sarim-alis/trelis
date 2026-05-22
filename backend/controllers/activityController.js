import ActivityLog from '../models/ActivityLog.js';
import Board from '../models/Board.js';

export const getActivities = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { limit = 50 } = req.query;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const activities = await ActivityLog.find({ board: boardId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
  }
};
