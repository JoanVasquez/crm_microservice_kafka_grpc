import { Request, Response } from 'express';
import { UserServiceClient } from 'shared/dist';

export class UserController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async getUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    
    const user = await this.userService.getUser(userId);
    res.json(user);
  }

    async updateUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;
    const { email, firstName, lastName, password } = req.body;

    const updatedUser = await this.userService.updateUser(userId, {
      email,
      firstName,
      lastName,
      password,
    });
    res.json(updatedUser);
  }

    async deleteUser(req: Request, res: Response): Promise<void> {
    const userId = req.params.id;

    await this.userService.deleteUser(userId);
    res.status(204).send();
  }
}