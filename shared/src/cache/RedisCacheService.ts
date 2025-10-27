import { createClient, RedisClientType } from 'redis';
import { injectable } from "tsyringe";
import { ICacheService } from './ICacheService';

@injectable()
export class RedisCacheService implements ICacheService {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        const redisUrl = process.env.REDIS_URL;
        this.client = createClient({ 
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
                connectTimeout: 3000,
            },
        });
        
        this.client.on('error', (err) => {
            console.error('❌ Redis Client Error:', err.message);
            this.isConnected = false;
        });
        
        this.client.on('ready', () => {
            console.log('✅ Redis connected and ready');
            this.isConnected = true;
        });
        
        // Connect in background, don't block
        this.connectInBackground();
    }

    private async connectInBackground(): Promise<void> {
        try {
            await this.client.connect();
            this.isConnected = true;
            console.log('🧠 Redis connected successfully');
        } catch (error) {
            console.error('❌ Failed to connect to Redis:', error);
            // Retry in background
            setTimeout(() => this.connectInBackground(), 5000);
        }
    }

    async disconnect(): Promise<void> {
        if (this.client.isOpen) {
            await this.client.quit();
            this.isConnected = false;
        }
    }

    async get<T = any>(key: string): Promise<T | null> {
        if (!this.isConnected) return null;

        // Fire and forget with timeout
        return Promise.race([
            this.client.get(key).then(value => value ? JSON.parse(value) : null),
            new Promise<T | null>((resolve) => 
                setTimeout(() => resolve(null), 200) // Fast timeout
            )
        ]).catch(() => null);
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (!this.isConnected) return;

        const stringValue = JSON.stringify(value);
        
        // Fire and forget
        const operation = ttl ? 
            this.client.setEx(key, ttl, stringValue) : 
            this.client.set(key, stringValue);
            
        operation.catch(error => {
            console.error('❌ Redis set failed (non-blocking):', error.message);
            this.isConnected = false;
        });
    }

    async delete(key: string): Promise<void> {
        if (!this.isConnected) return;

        // Fire and forget
        this.client.del(key).catch(error => {
            console.error('❌ Redis delete failed (non-blocking):', error.message);
            this.isConnected = false;
        });
    }

    async exists(key: string): Promise<boolean> {
        if (!this.isConnected) return false;

        // Fire and forget with timeout
        return Promise.race([
            this.client.exists(key).then(result => result === 1),
            new Promise<boolean>((resolve) => 
                setTimeout(() => resolve(false), 200) // Fast timeout
            )
        ]).catch(() => false);
    }
}