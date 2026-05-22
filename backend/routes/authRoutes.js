import express from 'express';
import { register, login, refreshToken, logout, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validateRequest.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
