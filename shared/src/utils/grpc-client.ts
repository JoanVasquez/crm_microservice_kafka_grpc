import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

export class GrpcClient {
  static async getClient(serviceName: string, proto_path: string, serviceHost: string, servicePort: number): Promise<any> {
    // const PROTO_PATH = '/app/shared/proto/user.proto';
    
    console.log(`🔍 Loading proto from: ${proto_path}`);
    console.log(`🔗 Creating new connection to ${serviceName} service at ${serviceHost}:${servicePort}`);

    try {
      const packageDefinition = protoLoader.loadSync(proto_path, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
      const serviceKey = `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Service`;
      
      if (!protoDescriptor[serviceName] || !protoDescriptor[serviceName][serviceKey]) {
        throw new Error(`Service ${serviceKey} not found in proto definition for ${serviceName}`);
      }

      const ServiceConstructor = protoDescriptor[serviceName][serviceKey];

      const client = new ServiceConstructor(
        `${serviceHost}:${servicePort}`,
        grpc.credentials.createInsecure(),
        {
          // Optimize for short-lived connections
          'grpc.keepalive_time_ms': 5000,
          'grpc.keepalive_timeout_ms': 1000,
          'grpc.max_connection_age_ms': 30000, // Close after 30 seconds
        }
      );

      // Simple connection check with shorter timeout
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + 3);

      await new Promise((resolve, reject) => {
        grpc.waitForClientReady(client, deadline, (error) => {
          if (error) {
            reject(new Error(`Failed to connect to ${serviceName} service: ${error.message}`));
          } else {
            console.log(`✅ Connected to ${serviceName} service at ${serviceHost}:${servicePort}`);
            resolve(true);
          }
        });
      });

      return client;

    } catch (error) {
      console.error(`❌ Failed to create gRPC client for ${serviceName}:`, error);
      throw error;
    }
  }

  // Remove closeClient method since we're not caching anymore
}