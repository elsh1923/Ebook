import jwt, { SignOptions, Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "your-secret-key";

export function signToken(payload: object, expiresIn: string = "7d"): string {
  const options: SignOptions = {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"], // <-- cast fixes TypeScript
  };

  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
