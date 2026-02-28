import { status, Metadata, ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";
import jwt from "jsonwebtoken";

export type Roles = "Admin" | "Customer" | "Guess";

export type AuthedUser = {
  sub: string;
  roles: Roles[];
};

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
  const payload = jwt.verify(token, JWT_SECRET) as AuthedUser;
  return {
    sub: String(payload.sub),
    roles: Array.isArray(payload.roles) ? payload.roles : [],
  };
}

export function requiredRoles() { }
