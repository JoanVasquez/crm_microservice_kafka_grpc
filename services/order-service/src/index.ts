import 'reflect-metadata';
import { container } from 'tsyringe';
import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from '@grpc/proto-loader';
import { register } from 'shared/dist/utils/metrics';
import { registerDependencies } from "./containers";
import { initializeDatabase } from './config/database';
import { OrderController } from './controller/order.controller';

const PROTO_PATH = '/app/shared/proto/order.proto';

async function startServer() {
    try {
        await initializeDatabase();
        await registerDependencies();

        const packageDefinition = loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        const orderProto: any = loadPackageDefinition(packageDefinition).order;
        const server = new Server();

        const orderController: OrderController = container.resolve(OrderController);

        server.addService(orderProto.OrderService.service, {
            CreateOrder: orderController.CreateOrder.bind(orderController),
            GetOrder: orderController.GetOrder.bind(orderController),
            GetUserOrders: orderController.GetUserOrders.bind(orderController)
        });

        register.setDefaultLabels({ service: 'order-service' });
        register.metrics().then(metrics => {
            console.log('Metrics registered:', metrics);
        });

        const port = process.env.ORDER_SERVICE_PORT || '50053';

        server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                console.error('Error binding server:', error);
                return;
            }
            console.log(`Server listening on port ${port}`);
            server.start();
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error starting server: ${error.message}`);
        } else {
            console.error('Unknown error starting server');
        }
    }
}

startServer();