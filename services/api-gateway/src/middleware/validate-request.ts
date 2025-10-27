import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().reduce((acc, error) => {
      const e = error as any; // ignora el tipo estricto
      acc[e.param || e.path || 'unknown'] = e.msg;
      return acc;
    }, {} as Record<string, string>);
    
    res.status(400).json({ errors: errorMessages });
    return;
  }
  
  next();
};