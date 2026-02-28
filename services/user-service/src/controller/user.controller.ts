import { injectable } from "tsyringe";
import { Metadata, sendUnaryData, ServerUnaryCall, ServiceError, status } from "@grpc/grpc-js";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { UserService } from "../service/user.service";
import { User } from "../entities/user.entity";
import {
  CreateUserRequest,
  DeleteUserRequest,
  DeleteUserResponse,
  GetUserByEmailRequest,
  GetUserRequest,
  grpcServiceError,
  mapGrpcResponse,
  toServiceError,
  UpdateUserRequest,
  UserResponse,
  ValidateUserRequest,
  ValidateUserResponse,
} from "shared/dist";

@injectable()
export class UserController {
  constructor(private readonly userService: UserService) { }

  async CreateUser(
    call: ServerUnaryCall<CreateUserRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const createdUser: User = await this.userService.CreateUser({
        firstName: call.request.firstName,
        lastName: call.request.lastName,
        email: call.request.email,
        password: call.request.password,
        roles: call.request.roles,
      } as CreateUserDto);

      const userResponse: UserResponse = this.mapUserResponse(createdUser);
      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  async GetUser(
    call: ServerUnaryCall<GetUserRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const user: User | null = await this.userService.getUserById(call.request.id);
      if (!user) {
        return callback(grpcServiceError(status.NOT_FOUND, "User not found"));
      }

      const userResponse: UserResponse = this.mapUserResponse(user);
      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(toServiceError(error));
    }
  }

  async GetUserByEmail(
    call: ServerUnaryCall<GetUserByEmailRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const user: User | null = await this.userService.getUserByEmail(call.request.email);
      if (!user) {
        return callback(grpcServiceError(status.NOT_FOUND, "User not found"));
      }

      const userResponse: UserResponse = this.mapUserResponse(user);
      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(grpcServiceError(status.INVALID_ARGUMENT, (error as Error).message));
    }
  }

  async ValidateUser(
    call: ServerUnaryCall<ValidateUserRequest, ValidateUserResponse>,
    callback: sendUnaryData<ValidateUserResponse>,
  ): Promise<void> {
    try {
      const user: User | null = await this.userService.validateUser(
        call.request.email,
        call.request.password,
      );

      const userResponse: UserResponse | undefined = user ? this.mapUserResponse(user) : undefined;
      const validResponse: ValidateUserResponse = {
        valid: user ? true : false,
        user: userResponse,
      };

      callback(null, mapGrpcResponse(validResponse));
    } catch (error) {
      callback(grpcServiceError(status.INVALID_ARGUMENT, (error as Error).message));
    }
  }

  async UpdateUser(
    call: ServerUnaryCall<UpdateUserRequest, UserResponse>,
    callback: sendUnaryData<UserResponse>,
  ): Promise<void> {
    try {
      const user: User | null = await this.userService.updateUser(call.request.id, {
        firstName: call.request.firstName,
        lastName: call.request.lastName,
        isActive: call.request.isActive,
      } as UpdateUserDto);

      if (!user) {
        return callback(grpcServiceError(status.NOT_FOUND, "User not found"));
      }

      const userResponse: UserResponse = this.mapUserResponse(user);

      callback(null, mapGrpcResponse(userResponse));
    } catch (error) {
      callback(grpcServiceError(status.INVALID_ARGUMENT, (error as Error).message));
    }
  }

  async DeleteUser(
    call: ServerUnaryCall<DeleteUserRequest, DeleteUserResponse>,
    callback: sendUnaryData<DeleteUserResponse>,
  ): Promise<void> {
    try {
      const result: boolean = await this.userService.deleteUser(call.request.id);
      if (!result) {
        return callback(grpcServiceError(status.NOT_FOUND, "User not found"));
      }

      callback(null, { success: true } as DeleteUserResponse);
    } catch (error) {
      callback(grpcServiceError(status.INVALID_ARGUMENT, (error as Error).message));
    }
  }

  private mapUserResponse(user: User) {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive,
      createdAt: user.createdAt.toString(),
      updatedAt: user.updatedAt.toString(),
    };
  }
}
