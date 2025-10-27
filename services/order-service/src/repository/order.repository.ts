import { GenericRepository } from "shared";
import { inject, injectable } from "tsyringe";
import { Order } from "../entities/order.entity";

@injectable()
export class OrderRepository extends GenericRepository<Order> {
    constructor(@inject('AppDataSource') private dataSource: any) {
    super(dataSource, Order);
  }

  getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.dataSource.getRepository(Order).find({ where: { userId } });
  }
}