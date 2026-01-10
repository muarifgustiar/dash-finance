/**
 * Auth Domain - User Entity
 * ✅ PURE TypeScript (no external dependencies)
 */

export interface UserProps {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    // Enforce invariants
    if (!props.id || props.id.trim() === "") {
      throw new Error("User ID is required");
    }
    if (!props.email || props.email.trim() === "") {
      throw new Error("Email is required");
    }
    if (!props.name || props.name.trim() === "") {
      throw new Error("Name is required");
    }

    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
