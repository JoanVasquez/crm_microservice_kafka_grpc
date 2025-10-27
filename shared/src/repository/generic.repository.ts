import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import { IRepository } from '../types/IRepository';

export class GenericRepository<T extends ObjectLiteral> implements IRepository<T> {
  protected repo: Repository<T>;

  constructor(datasource: DataSource, entityClass: new () => T) {
    this.repo = datasource.getRepository(entityClass);
  }

  async create(data: T): Promise<T> {
    const entity = await this.repo.create(data);
    return this.repo.save(entity);
  }

  async findById(id: string): Promise<T | null> {
    return this.repo.findOneBy({ id } as any);
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repo.delete(id);
    return result.affected! > 0;
  }

  async findAll(page: number, limit: number): Promise<{ items: T[]; total: number }> {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }
}