import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import validate from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema } from '../validators/userValidator.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new user account for the Time Traveling Toaster
 */
router.post('/register', validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: Authenticate user and get access tokens
 */
router.post('/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     description: Invalidate refresh token and logout user
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', authMiddleware, logout);

export default router;