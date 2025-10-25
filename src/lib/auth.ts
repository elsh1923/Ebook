import { verifyToken } from "./jwt";

export function getUserFromToken(token: string | undefined) {
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || typeof payload === 'string') return null;

  // Type assertion since we know the structure of our JWT payload
  const jwtPayload = payload as { name: string; email: string; role: string; userId: string; iat?: number; exp?: number };

  return {
    id: jwtPayload.userId,
    role: jwtPayload.role,
  };
}
