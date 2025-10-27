import { Request, Response } from 'express';
import { OrderServiceClient } from 'shared';

export class OrderController {
    private orderService: OrderServiceClient;

    constructor() {
        this.orderService = new OrderServiceClient();
    }

    async createOrder(req: Request, res: Response): Promise<void> {
        const { userId, items } = req.body;
        const newOrder = await this.orderService.createOrder({
            userId,
            items,
        });
        res.status(201).json(newOrder);
    }

    async getOrderById(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const order = await this.orderService.getOrderById(id);
        res.status(200).json(order);
    }

    async getOrdersByUserId(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
        const orders = await this.orderService.getOrdersByUserId(userId);
        res.status(200).json(orders);
    }
}