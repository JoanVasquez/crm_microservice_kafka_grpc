import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "http";
import jwt from "jsonwebtoken";
import {
  AuthedUser,
  HttpStatus,
  ResponseTemplate,
  UserServiceClient,
  ValidateUserResponse,
} from "shared/dist";
import { config } from "shared/dist";

export class AuthController {
  private userService: UserServiceClient;

  constructor() {
    this.userService = new UserServiceClient();
  }

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, firstName, lastName, password, roles } = req.body;
      const user = await this.userService.createUser({
        email,
        firstName,
        lastName,
        password,
        roles,
      });
      res.status(HttpStatus.CREATED.code).send(
        new ResponseTemplate(
          HttpStatus.CREATED.code,
          HttpStatus.CREATED.status,
          HttpStatus.CREATED.description,
          {
            user,
          },
        ),
      );
    } catch (error) {
      console.error("Error registering User", error);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const response: ValidateUserResponse = await this.userService.validateUser({
        email,
        password,
      });

      if (!response.valid || !response.user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = jwt.sign(
        {
          sub: response.user.id,
          id: response.user.id,
          roles: response.user.roles,
        } as AuthedUser,
        config.jwtSecret,
        {
          expiresIn: config.jwtExpiresIn,
        },
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 3600000,
      });

      res.status(HttpStatus.OK.code).send(
        new ResponseTemplate(HttpStatus.OK.code, HttpStatus.OK.status, HttpStatus.OK.description, {
          token,
        }),
      );
    } catch (error) {
      next(error);
    }
  }
}
