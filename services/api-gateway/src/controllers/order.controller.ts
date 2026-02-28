import { NextFunction, Request, Response } from "express";
import { HttpStatus, OrderServiceClient, ResponseTemplate } from "shared";

export class OrderController {
  private orderService: OrderServiceClient;

  constructor() {
    this.orderService = new OrderServiceClient();
  }

  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, items } = req.body;
      const newOrder = await this.orderService.createOrder({
        userId,
        items,
      });

      res.status(HttpStatus.CREATED.code).send(
        new ResponseTemplate(
          HttpStatus.CREATED.code,
          HttpStatus.CREATED.status,
          HttpStatus.CREATED.description,
          {
            newOrder,
          },
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      res
        .status(HttpStatus.OK.code)
        .send(
          new ResponseTemplate(
            HttpStatus.OK.code,
            HttpStatus.OK.status,
            HttpStatus.OK.description,
            { order },
          ),
        );
    } catch (error) {
      next(error);
    }
  }
  async getOrdersByUserId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const orders = await this.orderService.getOrdersByUserId(userId);

      res
        .status(HttpStatus.OK.code)
        .send(
          new ResponseTemplate(
            HttpStatus.OK.code,
            HttpStatus.OK.status,
            HttpStatus.OK.description,
            { orders },
          ),
        );
    } catch (error) {
      next(error);
    }
  }
}
