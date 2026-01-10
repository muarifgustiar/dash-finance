import { ErrInvalid, ErrNotFound } from "../../../../shared/errors/canonical";
import type { User } from "../../domain/entities/user";
import type { AuthRepository } from "../../domain/repositories/auth-repository";
import type { AuthService } from "../../domain/services/auth-service";

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export class LoginUseCase {
  constructor(
    private authRepository: AuthRepository,
    private authService: AuthService
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const user = await this.authRepository.findByEmail(command.email);

    if (!user) {
      throw new ErrNotFound("User tidak ditemukan");
    }

    const isValidPassword = await this.authService.comparePassword(
      command.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new ErrInvalid("Email atau password salah");
    }

    if (user.status !== "ACTIVE") {
      throw new ErrInvalid("Akun tidak aktif");
    }

    const token = await this.authService.generateToken(user.id);

    return {
      user,
      token,
    };
  }
}
