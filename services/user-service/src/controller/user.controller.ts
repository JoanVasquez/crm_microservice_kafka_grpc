import { injectable } from "tsyringe";
import { CreateUserDto } from "../dtos/user.dto";
import { UserService } from "../service/user.service";

@injectable()
export class UserController {
    constructor(private readonly userService: UserService) { }

    async CreateUser(call: any, callback: any): Promise<void> {
        try {
            const user = await this.userService.CreateUser({
                firstName: call.request.firstName,
                lastName: call.request.lastName,
                email: call.request.email,
                password: call.request.password,
            } as CreateUserDto);

            // FIX: Match the proto definition exactly
            const response = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(), // Convert Date to string
                updatedAt: user.updatedAt.toISOString()  // Convert Date to string
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async GetUser(call: any, callback: any): Promise<void> {
        try {
            const user = await this.userService.getUserById(call.request.id);
            if (!user) {
                return callback({
                    code: 5,
                    message: 'User not found'
                });
            }

            // FIX: Match the proto definition exactly
            const response = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                createdAt: new Date(user.createdAt).toISOString(),
                updatedAt: new Date(user.updatedAt).toISOString() 
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async ValidateUser(call: any, callback: any): Promise<void> {
        try {
            const user = await this.userService.validateUser(call.request.email, call.request.password);
            if (!user) {
                // FIX: Return proper ValidateUserResponse with valid: false
                return callback(null, { valid: false });
            }

            // FIX: Match the ValidateUserResponse proto
            const response = {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isActive: user.isActive,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString()
                }
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async UpdateUser(call: any, callback: any): Promise<void> {
        try {
            const user = await this.userService.updateUser(call.request.id, {
                firstName: call.request.firstName,
                lastName: call.request.lastName,
                isActive: call.request.isActive,
            });

            if (!user) {
                return callback({
                    code: 5,
                    message: 'User not found'
                });
            }

            // FIX: Match the proto definition exactly
            const response = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async DeleteUser(call: any, callback: any): Promise<void> {
        try {
            const result = await this.userService.deleteUser(call.request.id);
            if (!result) {
                return callback({
                    code: 5,
                    message: 'User not found'
                });
            }

            callback(null, { success: true });
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }
}