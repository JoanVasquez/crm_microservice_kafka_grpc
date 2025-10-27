import { injectable } from "tsyringe";
import { OrderService } from "../service/order.service";

@injectable()
export class OrderController {
    constructor(private orderService: OrderService) { }

    async CreateOrder(call: any, callback: any): Promise<void> {
        try {
            console.log('TEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEST', call.request.items)
            const order = await this.orderService.createOrder({
                userId: call.request.userId,
                items: call.request.items,
            });

            const response = {
                id: order.id,
                userId: order.userId,
                items: order.items,
                createdAt: order.createdAt.toISOString(),
                updatedAt: order.updatedAt.toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async GetOrder(call: any, callback: any): Promise<void> {
        try {
            const order = await this.orderService.getOrderById(call.request.id);

            if (!order) {
                callback({
                    code: 5,
                    message: 'Order not found'
                });
                return;
            }

            const response = {
                id: order.id,
                userId: order.userId,
                items: order.items,
                createdAt: order.createdAt.toISOString(),
                updatedAt: order.updatedAt.toISOString()
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }

    async GetUserOrders(call: any, callback: any): Promise<void> {
        try {
            const orders = await this.orderService.getOrdersByUserId(call.request.userId);

            const response = {
                orders: orders.map(order => ({
                    id: order.id,
                    userId: order.userId,
                    items: order.items,
                    createdAt: order.createdAt.toISOString(),
                    updatedAt: order.updatedAt.toISOString()
                }))
            };

            callback(null, response);
        } catch (error) {
            callback({
                code: 3,
                message: (error as Error).message
            });
        }
    }
}