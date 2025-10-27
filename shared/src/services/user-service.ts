import { config } from "../config/config";
import { GrpcService } from "../utils/grpc-service";

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface ValidateUserRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export interface ValidateUserResponse {
  valid: boolean;
  user?: UserResponse;
}

export class UserServiceClient {
  private grpcService: GrpcService;

  constructor() {
    this.grpcService = new GrpcService(
      'user',
      '/app/shared/proto/user.proto',
      config.services.user.host,
      config.services.user.port
    );
  }

  async createUser(request: CreateUserRequest): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>('CreateUser', request);
  }

  async validateUser(request: ValidateUserRequest): Promise<ValidateUserResponse> {
    return this.grpcService.call<ValidateUserResponse>('ValidateUser', request);
  }

  async getUser(id: string): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>('GetUser', { id });
  }

  async updateUser(id: string, request: CreateUserRequest): Promise<UserResponse> {
    return this.grpcService.call<UserResponse>('UpdateUser', { id, ...request });
  }

  async deleteUser(id: string): Promise<void> {
    return this.grpcService.call<void>('DeleteUser', { id });
  }
}