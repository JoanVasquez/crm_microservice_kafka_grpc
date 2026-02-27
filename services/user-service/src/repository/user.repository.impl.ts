import { inject, injectable } from "tsyringe";
import { User } from "../entities/user.entity";
import { IUserRepository } from "./IUserRepository";
import { AppDataSource } from "../config/database";
import { GenericRepository } from "shared";

@injectable()
export class UserRepository extends GenericRepository<User> implements IUserRepository {
  private readonly userRepository;

  constructor(@inject("AppDataSource") dataSource: any) {
    super(dataSource, User);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
}
