import { Metadata, ServiceError, status } from "@grpc/grpc-js";
import { DuplicateRecordError } from "../errors/duplicate-record-error";
import { NotFoundError } from "../errors/not-found-error";
import { AuthError } from "../errors/auth-error";
import { DatabaseError } from "../errors/database-error";
import { BaseAppException } from "../errors/base-app-exception";

export const grpcServiceError = (code: status, message: string): ServiceError => {
  return {
    name: "ServiceError",
    message,
    code,
    details: message,
    metadata: new Metadata(),
  };
};

export const toServiceError = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);

  if (error instanceof DuplicateRecordError)
    return grpcServiceError(status.ALREADY_EXISTS, errorMessage);
  if (error instanceof NotFoundError) return grpcServiceError(status.NOT_FOUND, errorMessage);
  if (error instanceof AuthError) return grpcServiceError(status.UNAUTHENTICATED, errorMessage);
  if (error instanceof DatabaseError) return grpcServiceError(status.INTERNAL, errorMessage);
  if (error instanceof BaseAppException) return grpcServiceError(status.INTERNAL, errorMessage);

  return grpcServiceError(status.INTERNAL, errorMessage);
};
