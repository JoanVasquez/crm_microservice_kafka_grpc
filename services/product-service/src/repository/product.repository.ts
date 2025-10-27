import { GenericRepository } from "shared";
import { inject, injectable } from "tsyringe";
import { Product } from "../entities/product.entity";

@injectable()
export class ProductRepository extends GenericRepository<Product> {
    constructor(@inject('AppDataSource') dataSource: any) {
    super(dataSource, Product);
  }
}