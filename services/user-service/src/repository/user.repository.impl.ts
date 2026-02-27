import { inject, injectable } from "tsyringe";
import { User } from "../entities/user.entity";
import { IUserRepository } from "./IUserRepository";
import { AppDataSource } from "../config/database";
import { GenericRepository } from "shared";

@injectable()
export class UserRepository extends GenericRepository<User> implements IUserRepository {
  private readonly userRepository = AppDataSource.getRepository(User);

  constructor(
    @inject("AppDataSource")
    dataSource: ConstructorParameters<typeof GenericRepository<User>>[0],
  ) {
    super(dataSource, User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }
}
