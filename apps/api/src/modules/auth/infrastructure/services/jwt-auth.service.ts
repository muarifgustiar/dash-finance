import { SignJWT, jwtVerify } from "jose";
import type { AuthService } from "../../domain/services/auth-service";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export class JwtAuthService implements AuthService {
  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await Bun.password.hash(password);
    return hashedPassword;
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
  }

  async generateToken(userId: string): Promise<string> {
    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return token;
  }

  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return { userId: payload.userId as string };
    } catch {
      return null;
    }
  }
}
