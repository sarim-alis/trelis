import Task from '../models/Task.js';
import Board from '../models/Board.js';
import ActivityLog from '../models/ActivityLog.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, status, boardId } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const maxOrder = await Task.findOne({ board: boardId, status: status || 'todo' })
      .sort({ order: -1 })
      .select('order');

    const task = new Task({
      title,
      description,
      status: status || 'todo',
      order: maxOrder ? maxOrder.order + 1 : 0,
      board: boardId,
      createdBy: req.user._id
    });

    await task.save();

    await ActivityLog.create({
      user: req.user._id,
      board: boardId,
      action: 'created_task',
      details: `Created task "${title}"`,
      taskId: task._id
    });

    const io = req.app.get('io');
    io.to(boardId).emit('task:created', task);

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { search } = req.query;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = { board: boardId };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'username')
      .sort({ status: 1, order: 1 });

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, order } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = task.status;
    
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (order !== undefined) task.order = order;

    await task.save();

    let activityDetails = `Updated task "${task.title}"`;
    if (status && status !== oldStatus) {
      activityDetails = `Moved task "${task.title}" from ${oldStatus} to ${status}`;
    }

    await ActivityLog.create({
      user: req.user._id,
      board: task.board,
      action: 'updated_task',
      details: activityDetails,
      taskId: task._id
    });

    const io = req.app.get('io');
    io.to(task.board.toString()).emit('task:updated', task);

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

export const updateTaskOrder = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { tasks } = req.body;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const bulkOps = tasks.map(({ id, status, order }) => ({
      updateOne: {
        filter: { _id: id, board: boardId },
        update: { status, order }
      }
    }));

    await Task.bulkWrite(bulkOps);

    const io = req.app.get('io');
    io.to(boardId).emit('tasks:reordered', { tasks });

    res.json({ message: 'Task order updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task order', error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const board = await Board.findById(task.board);
    const isMember = board.members.some(member => member.toString() === req.user._id.toString());
    if (!isMember && board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await ActivityLog.create({
      user: req.user._id,
      board: task.board,
      action: 'deleted_task',
      details: `Deleted task "${task.title}"`
    });

    await Task.findByIdAndDelete(id);

    const io = req.app.get('io');
    io.to(task.board.toString()).emit('task:deleted', { id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};
