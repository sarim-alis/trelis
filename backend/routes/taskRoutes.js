import express from 'express';
import { createTask, getTasks, updateTask, updateTaskOrder, deleteTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validateTask } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateTask, createTask);
router.get('/board/:boardId', getTasks);
router.put('/:id', updateTask);
router.put('/board/:boardId/reorder', updateTaskOrder);
router.delete('/:id', deleteTask);

export default router;
