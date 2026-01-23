import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { logger, LOG_TYPES } from '../utility/logger.js';
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Route 1: Create User. POST '/auth/createuser'. No login required
router.post('/createuser', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            logger('Email and password are required', LOG_TYPES.WARNING);
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            logger('Password must be at least 6 characters long', LOG_TYPES.WARNING);
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            logger(`User creation failed: Email ${email} already exists`, LOG_TYPES.WARNING);
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password with salt
        const saltRounds = 10;
        const passwordhash = await bcrypt.hash(password, saltRounds);

        // Create user in database
        const user = await prisma.user.create({
            data: {
                email,
                passwordhash
            }
        });

        // Create JWT token
        const token = jwt.sign(
            { user: { id: user.id } },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger(`User created successfully: ${email}`, LOG_TYPES.SUCCESS);
        res.json({ token });

    } catch (error) {
        logger(`Error in createuser: ${error.message}`, LOG_TYPES.ERROR);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route 2: Login User. POST '/auth/login'. No login required
router.get('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            logger('Email and password are required', LOG_TYPES.WARNING);
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            logger(`Login failed: User with email ${email} not found`, LOG_TYPES.WARNING);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.passwordhash);

        if (!isPasswordValid) {
            logger(`Login failed: Invalid password for ${email}`, LOG_TYPES.WARNING);
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign(
            { user: { id: user.id } },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        logger(`User logged in successfully: ${email}`, LOG_TYPES.SUCCESS);
        res.json({ token });

    } catch (error) {
        logger(`Error in login: ${error.message}`, LOG_TYPES.ERROR);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
