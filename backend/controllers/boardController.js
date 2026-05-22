import Board from '../models/Board.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';

export const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    const board = new Board({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    await board.save();

    await ActivityLog.create({
      user: req.user._id,
      board: board._id,
      action: 'created_board',
      details: `Created board "${title}"`
    });

    res.status(201).json({ message: 'Board created successfully', board });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create board', error: error.message });
  }
};

export const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    }).populate('owner', 'username email').sort({ createdAt: -1 });

    res.json({ boards });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch boards', error: error.message });
  }
};

export const getBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id).populate('owner', 'username email').populate('members', 'username email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some(member => member._id.toString() === req.user._id.toString());
    if (!isMember && board.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ board });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch board', error: error.message });
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can update the board' });
    }

    board.title = title || board.title;
    board.description = description !== undefined ? description : board.description;
    await board.save();

    await ActivityLog.create({
      user: req.user._id,
      board: board._id,
      action: 'updated_board',
      details: `Updated board "${board.title}"`
    });

    res.json({ message: 'Board updated successfully', board });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update board', error: error.message });
  }
};

export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findById(id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the owner can delete the board' });
    }

    await Task.deleteMany({ board: id });
    await ActivityLog.deleteMany({ board: id });
    await Board.findByIdAndDelete(id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete board', error: error.message });
  }
};
