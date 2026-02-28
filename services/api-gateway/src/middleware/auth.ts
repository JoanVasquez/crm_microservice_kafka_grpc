import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthedUser, AuthError, config, UserResponse } from "shared/dist";

export interface AuthenticatedRequest extends Request {
  user?: AuthedUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);

  if (!token) {
    return next(new AuthError("Unauthorized: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthedUser;
    const response = await fetch(
      `${config.services.user.host}${config.services.user.port}/${decoded.id}`,
    );

    const fetchUserWithRoles: UserResponse = (await response.json()) as UserResponse;
    const shouldAllowReq = fetchUserWithRoles.roles.every((role) => decoded.roles.includes(role));

    if (shouldAllowReq) {
      req.user = {
        sub: decoded.sub,
        id: decoded.id,
        roles: decoded.roles,
      };
      next();
    }
  } catch (error) {
    next(error);
    // res.status(403).json({ error: "Invalid or expired token" });
  }
};
