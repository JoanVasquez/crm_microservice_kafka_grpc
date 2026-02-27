import {
  GrpcProtoNotificationMethods,
  GrpcProtoOrderMethods,
  GrpcProtoProductMethods,
  GrpcProtoUserMethods,
  GrpcServiceKey,
  GrpcServices,
} from "../types/GrpcProtoTypes";
import { GrpcClient } from "./grpc-client";

export class GrpcService {
  constructor(
    private serviceName: GrpcServices,
    private serviceKey: GrpcServiceKey,
    private protoPath: string,
    private host: string,
    private port: number,
  ) { }

  async call<T>(
    method:
      | GrpcProtoUserMethods
      | GrpcProtoProductMethods
      | GrpcProtoOrderMethods
      | GrpcProtoNotificationMethods,
    request: any,
    timeoutMs: number = 10000,
  ): Promise<T> {
    const client = await GrpcClient.getClient(
      this.serviceName,
      this.serviceKey,
      this.protoPath,
      this.host,
      this.port,
    );

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
