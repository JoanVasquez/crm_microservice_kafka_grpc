import { NextFunction, Request, Response } from "express";
import { HttpStatus, ResponseTemplate, UserServiceClient } from "shared/dist";

export class UserController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const user = await this.userService.getUser(userId);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          user,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userEmail = req.params.email;
      const user = await this.userService.getUserByEmail(userEmail);

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          user,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const { email, firstName, lastName, password, roles } = req.body;
      const updatedUser = await this.userService.updateUser(userId, {
        email,
        firstName,
        lastName,
        password,
        roles,
      });

      res
        .status(HttpStatus.OK.code)
        .send(
          new ResponseTemplate(
            HttpStatus.OK.code,
            HttpStatus.OK.status,
            HttpStatus.OK.description,
            { updatedUser },
          ),
        );
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.id;
      const isDeleted = await this.userService.deleteUser(userId);

      res
        .status(HttpStatus.OK.code)
        .send(
          new ResponseTemplate(
            HttpStatus.OK.code,
            HttpStatus.OK.status,
            HttpStatus.OK.description,
            { isDeleted },
          ),
        );
    } catch (error) {
      next(next);
    }
  }
}
