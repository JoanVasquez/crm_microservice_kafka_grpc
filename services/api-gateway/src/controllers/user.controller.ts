import { NextFunction, Request, Response } from "express";
import { HttpStatus, ResponseTemplate, Role, UserServiceClient } from "shared";

type UserIdParams = {
  id: string;
};

type UserEmailParams = {
  email: string;
};

type GatewayUpdateUserBody = {
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  roles?: Role[];
};

export class UserController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async getUser(req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<void> {
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

  async getUserByEmail(
    req: Request<UserEmailParams>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
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

  async updateUser(
    req: Request<UserIdParams, unknown, GatewayUpdateUserBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.params.id;
      const { firstName, lastName, isActive, roles } = req.body;
      const updateRequest: GatewayUpdateUserBody = {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(roles !== undefined ? { roles } : {}),
      };
      const updatedUser = await this.userService.updateUser(userId, updateRequest);

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

  async deleteUser(req: Request<UserIdParams>, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }
}
