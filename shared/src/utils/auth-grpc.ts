import { status, Metadata, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import jwt from "jsonwebtoken";

export type Roles = "Admin" | "Customer" | "Supplier" | "Guess";

export type AuthedUser = {
  sub: string;
  roles: Roles[];
};

type AuthedUnaryCall<Req, Res> = ServerUnaryCall<Req, Res> & { context?: CallContext };
type UnaryHandler<Req, Res> = (
  call: AuthedUnaryCall<Req, Res>,
  callback: sendUnaryData<Res>,
) => void;

type UnaryInterceptor<Req, Res> = (
  call: AuthedUnaryCall<Req, Res>,
  callback: sendUnaryData<Res>,
  next: () => void,
) => void;

export type CallContext = {
  user?: AuthedUser;
};

const JWT_SECRET: string = process.env.JWT_SECRET ?? "dev-secret";

export function getBearerToken(md: Metadata): string | null {
  const raw = md.get("authorization")[0];
  if (!raw || typeof raw !== "string") return null;

  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export function verifyJwt(token: string): AuthedUser {
  const payload = jwt.verify(token, JWT_SECRET);

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Invalid JWT payload");
  }

  const sub = String((payload as any).sub);
  const rolesRaw = (payload as any).roles;

  return {
    sub,
    roles: Array.isArray(rolesRaw) ? (rolesRaw as Roles[]) : [],
  };
}

export function requiredRoles(required: Roles[]) {
  return (user?: AuthedUser) => {
    if (!user) return false;
    const roles = user.roles ?? [];
    return required.some((role) => roles.includes(role));
  };
}

export const authUnaryInterceptor = (roles: Roles[]) => {
  const rolecheck = requiredRoles(roles);

  return function <Req, Res>(
    call: ServerUnaryCall<Req, Res> & { context?: CallContext },
    callback: sendUnaryData<Res>,
    next: () => void,
  ) {
    try {
      const token = getBearerToken(call.metadata);
      if (!token) {
        callback({ code: status.UNAUTHENTICATED, message: "Missing bearer token" });
        return;
      }

      const user = verifyJwt(token);
      call.context = { ...(call.context ?? {}), user };

      if (!rolecheck(user)) {
        callback({
          code: status.PERMISSION_DENIED,
          message: "Insufficient permissions",
        });
        return;
      }
      next();
    } catch {
      callback({
        code: status.UNAUTHENTICATED,
        message: "Invalid token",
      });
    }
  };
};

export function wrapUnary<Req, Res>(
  handler: UnaryHandler<Req, Res>,
  interceptor: UnaryInterceptor<Req, Res>,
): UnaryHandler<Req, Res> {
  return (call, callback) => {
    interceptor(call, callback, () => handler(call, callback));
  };
}
