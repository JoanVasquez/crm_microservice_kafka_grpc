import 'reflect-metadata';
import { container } from 'tsyringe';
import { Server, ServerCredentials, loadPackageDefinition } from "@grpc/grpc-js";
import { loadSync } from '@grpc/proto-loader';
import { register } from 'shared/dist/utils/metrics';
import { UserController } from "./controller/user.controller";
import { registerDependencies } from "./containers";
import { initializeDatabase } from './config/database';

const PROTO_PATH = '/app/shared/proto/user.proto';

async function startServer() {
    try {
        // 1. Initialize database first
        await initializeDatabase();
        
        // 2. Register dependencies
        await registerDependencies();

        // Load the protobuf
        const packageDefinition = loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        const userProto: any = loadPackageDefinition(packageDefinition).user;
        const server = new Server();
        
        // Get UserController from container (it will have RedisCacheService injected)
        const userController: UserController = container.resolve(UserController);

        server.addService(userProto.UserService.service, {
            CreateUser: userController.CreateUser.bind(userController),
            GetUser: userController.GetUser.bind(userController),
            ValidateUser: userController.ValidateUser.bind(userController),
            UpdateUser: userController.UpdateUser.bind(userController),
            DeleteUser: userController.DeleteUser.bind(userController)
        });

        register.setDefaultLabels({ service: 'user-service' });
        register.metrics().then(metrics => {
            console.log('Metrics registered:', metrics);
        });

        const port = process.env.USER_SERVICE_PORT || '50051';

        server.bindAsync(`0.0.0.0:${port}`, ServerCredentials.createInsecure(), (error, port) => {
            if (error) {
                console.error(`Failed to bind server: ${error.message}`);
                return;
            }
            console.log(`User service running at http://0.0.0.0:${port}`);
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