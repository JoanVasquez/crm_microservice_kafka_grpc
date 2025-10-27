import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('API Gateway Error:', {
    error: error.message,
    url: req.url,
    method: req.method,
  });

  // Handle gRPC specific errors
  if (error.code !== undefined) {
    // Special case: code 3 with "client closed" message
    if (error.code === 3 && error.message.includes('The client is closed')) {
      res.status(503).json({ error: 'Service connection issue, please try again' });
      return;
    }
    
    switch (error.code) {
      case 3: // INVALID_ARGUMENT
        res.status(400).json({ error: error.details || 'Invalid request' });
        return;
      case 5: // NOT_FOUND
        res.status(404).json({ error: 'Resource not found' });
        return;
      case 6: // ALREADY_EXISTS
        res.status(409).json({ error: 'Resource already exists' });
        return;
      case 14: // UNAVAILABLE
        res.status(503).json({ error: 'Service temporarily unavailable' });
        return;
      default:
        res.status(500).json({ error: 'Service error' });
        return;
    }
  }

  // Default error
  res.status(500).json({ error: 'Internal server error' });
};