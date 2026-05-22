import express from 'express';
import { createBoard, getBoards, getBoard, updateBoard, deleteBoard } from '../controllers/boardController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBoard } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateBoard, createBoard);
router.get('/', getBoards);
router.get('/:id', getBoard);
router.put('/:id', validateBoard, updateBoard);
router.delete('/:id', deleteBoard);

export default router;
