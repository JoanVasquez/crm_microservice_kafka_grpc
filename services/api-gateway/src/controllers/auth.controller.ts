import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserServiceClient } from 'shared/dist';
import { config } from 'shared/dist';

export class AuthController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async register(req: Request, res: Response): Promise<void> {
    const { email, firstName, lastName, password } = req.body;
    
    console.log(`📝 Registration attempt for: ${email}`);

    const user = await this.userService.createUser({
      email,
      firstName,
      lastName,
      password
    });

    console.log('✅ User created successfully');
    res.status(201).json(user);
  }

  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    console.log(`🔐 Login attempt for: ${email}`);

    const response = await this.userService.validateUser({ email, password });

    if (!response.valid || !response.user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: response.user.id, email: response.user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    console.log(`✅ Login successful for: ${email}`);
    res.json({ 
      user: response.user, 
      token,
      message: 'Login successful'
    });
  }
}