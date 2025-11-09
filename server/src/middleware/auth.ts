import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication invalid',
      });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      // Attach the user to the request object
      req.user = await User.findById(payload.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Authentication invalid',
      });
    }
  } catch (error) {
    next(error);
  }
};

export default auth;
