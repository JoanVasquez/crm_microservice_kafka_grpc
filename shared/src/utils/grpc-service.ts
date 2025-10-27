import { GrpcClient } from './grpc-client';

export class GrpcService {
  constructor(
    private serviceName: string,
    private protoPath: string,
    private host: string,
    private port: number
  ) {}

  async call<T>(method: string, request: any, timeoutMs: number = 10000): Promise<T> {
    // Always get a fresh client - no connection pooling
    const client = await GrpcClient.getClient(this.serviceName, this.protoPath, this.host, this.port);
    
    return new Promise<T>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`gRPC call timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      client[method](request, (error: any, response: any) => {
        clearTimeout(timeoutId);
        
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }
}