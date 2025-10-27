import { injectable } from "tsyringe";
import { User } from "../entities/user.entity";
import { IUserRepository } from "./IUserRepository";
import { AppDataSource } from "../config/database";

@injectable()
export class UserRepository implements IUserRepository {
    private readonly userRepository;

    constructor() {
        // Use the initialized data source
        this.userRepository = AppDataSource.getRepository(User);
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

    async findById(id: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async update(id: string, userData: Partial<User>): Promise<User | null> {
        await this.userRepository.update(id, userData);
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return (result.affected || 0) > 0;
    }

    async findAll(page: number, limit: number): Promise<{ users: User[]; total: number; }> {
        const [users, total] = await this.userRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { users, total };
    }
}