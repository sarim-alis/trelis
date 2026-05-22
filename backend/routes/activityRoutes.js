import express from 'express';
import { getActivities } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/board/:boardId', getActivities);

export default router;
