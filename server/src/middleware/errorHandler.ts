import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = `Duplicate value entered for ${Object.keys(
      (err as any).keyValue
    )} field, please choose another value`;
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id: ${(err as any).value}`;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export default errorHandler;
