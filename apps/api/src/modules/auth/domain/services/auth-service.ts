export interface AuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
  generateToken(userId: string): Promise<string>;
  verifyToken(token: string): Promise<{ userId: string } | null>;
}
