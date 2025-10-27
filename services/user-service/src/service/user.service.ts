import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../repository/IUserRepository";
import { ICacheService, IMessagingService, UserCreatedEvent, UserUpdatedEvent } from "shared";
import { CreateUserDto, UpdateUserDto } from "../dtos/user.dto";
import { User } from "../entities/user.entity";
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

@injectable()
export class UserService {
    constructor(
        @inject('UserRepository') private userRepository: IUserRepository,
        @inject('CacheService') private cacheService: ICacheService,
        @inject('KafkaMessagingService') private messagingService: IMessagingService
    ) { }

    async CreateUser(userData: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const user = await this.userRepository.create({ ...userData, password: hashedPassword });

        // Non-blocking cache and Kafka operations
        this.cacheService.set(`user_${user.id}`, JSON.stringify(user), 3600)
            .then(() => console.log('✅ User cached successfully'))
            .catch(error => console.warn('⚠️ Cache set failed:', error.message));

        // // Non-blocking Kafka
        // const event: UserCreatedEvent = {
        //     id: randomUUID(),
        //     type: 'user.created',
        //     timestamp: new Date(),
        //     version: '1.0',
        //     data: {
        //         userId: user.id,
        //         email: user.email,
        //         firstName: user.firstName,
        //         lastName: user.lastName,
        //     },
        // };
        // this.messagingService.publish('user.events', event)
        //     .then(() => console.log('✅ User created event published'))
        //     .catch(error => console.warn('⚠️ Kafka publish failed:', error.message));

        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        // Try cache with fast timeout, then fall back to DB
        const cachedUser = await this.cacheService.get<User>(`user:${id}`)
            .catch(() => null);

        if (cachedUser) {
            console.log('✅ User retrieved from cache');
            return cachedUser;
        }

        const user = await this.userRepository.findById(id);
        if (user) {
            // Cache in background without waiting
            this.cacheService.set(`user:${user.id}`, user, 3600)
                .catch(error => console.warn('⚠️ Background cache set failed:', error.message));
        }

        return user;
    }

    // ... rest of methods with similar non-blocking patterns
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.isActive) {
            return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        return isValid ? user : null;
    }

    async updateUser(id: string, userData: UpdateUserDto): Promise<User | null> {
        const user = await this.userRepository.update(id, userData);
        if (user) {
            // Non-blocking cache update
            this.cacheService.set(`user:${user.id}`, user, 3600)
                .catch(error => console.warn('⚠️ Background cache update failed:', error.message));

            // Non-blocking Kafka
            // const event: UserUpdatedEvent = {
            //     id: randomUUID(),
            //     type: 'user.updated',
            //     timestamp: new Date(),
            //     version: '1.0',
            //     data: {
            //         userId: user.id,
            //         changes: userData,
            //     },
            // };
            // this.messagingService.publish('user.events', event)
            //     .catch(error => console.warn('⚠️ Background Kafka publish failed:', error.message));
        }

        return user;
    }

    async deleteUser(id: string): Promise<boolean> {
        const success = await this.userRepository.delete(id);
        if (success) {
            // Non-blocking cache delete
            this.cacheService.delete(`user:${id}`)
                .catch(error => console.warn('⚠️ Background cache delete failed:', error.message));
        }
        return success;
    }

    async getUsers(page: number, limit: number): Promise<{ users: User[]; total: number }> {
        return this.userRepository.findAll(page, limit);
    }
}