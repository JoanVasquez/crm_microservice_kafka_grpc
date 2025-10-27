import 'reflect-metadata';
import { container } from 'tsyringe';
import { IUserRepository } from './repository/IUserRepository';
import { ICacheService, IMessagingService, KafkaMessagingService, RedisCacheService } from 'shared';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { UserRepository } from './repository/user.repository.impl';

export async function registerDependencies(): Promise<void> {
    // Register as singletons - they handle their own connection management
    container.registerSingleton<IUserRepository>('UserRepository', UserRepository);
    container.registerSingleton<ICacheService>('CacheService', RedisCacheService);
    container.registerSingleton<IMessagingService>('KafkaMessagingService', KafkaMessagingService);
    container.registerSingleton<UserService>(UserService);
    container.registerSingleton<UserController>(UserController);
}