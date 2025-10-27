import { config } from "../config/config";
import { GrpcService } from "../utils/grpc-service";

export interface CreateOrderRequest {
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
}

export interface OrderResponse {
    id: string;
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export class OrderServiceClient {
    private grpcService: GrpcService;

    constructor() {
        this.grpcService = new GrpcService(
            'order',
            '/app/shared/proto/order.proto',
            config.services.order.host,
            config.services.order.port
        );
    }

    async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
        return this.grpcService.call<OrderResponse>('CreateOrder', request);
    }

    async getOrderById(id: string): Promise<OrderResponse> {
        return this.grpcService.call<OrderResponse>('GetOrder', { id });
    }

    async getOrdersByUserId(userId: string): Promise<OrderResponse[]> {
        return this.grpcService.call<OrderResponse[]>('GetUserOrders', { userId });
    }
}