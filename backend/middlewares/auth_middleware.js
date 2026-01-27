import jwt from 'jsonwebtoken';
import { logger, LOG_TYPES } from '../utility/logger.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        logger('No token provided', LOG_TYPES.WARNING);
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Add user ID to request object
        req.userId = decoded.user.id;
        
        logger(`Token verified for user: ${req.userId}`, LOG_TYPES.INFORMATION);
        next();
    } catch (error) {
        logger(`Invalid token: ${error.message}`, LOG_TYPES.WARNING);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
