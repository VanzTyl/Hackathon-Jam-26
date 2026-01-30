// Simple in-memory database for demo purposes
// In production, use a proper database like PostgreSQL, MongoDB, etc.

interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string; // In production, this should be hashed!
  isVerified: boolean;
  createdAt: string;
}

interface VerificationCode {
  code: string;
  expires: number;
}

interface PasswordResetToken {
  token: string;
  expires: number;
}

class InMemoryDB {
  private users = new Map<string, User>();
  private verificationCodes = new Map<string, VerificationCode>();
  private passwordResetTokens = new Map<string, PasswordResetToken>();

  // User methods
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'isVerified'>): User {
    const user: User = {
      ...userData,
      isVerified: false,
      createdAt: new Date().toISOString(),
      id: crypto.randomUUID(),
    };
    this.users.set(userData.email, user);
    return user;
  }

  getUser(email: string): User | undefined {
    return this.users.get(email);
  }

  updateUser(email: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(email);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(email, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  userExists(email: string): boolean {
    return this.users.has(email);
  }

  // Verification code methods
  setVerificationCode(email: string, code: string, expiresInMinutes: number = 15): void {
    this.verificationCodes.set(email, {
      code,
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
  }

  getVerificationCode(email: string): VerificationCode | undefined {
    return this.verificationCodes.get(email);
  }

  deleteVerificationCode(email: string): void {
    this.verificationCodes.delete(email);
  }

  clearExpiredCodes(): void {
    const now = Date.now();
    for (const [email, codeData] of this.verificationCodes.entries()) {
      if (now > codeData.expires) {
        this.verificationCodes.delete(email);
      }
    }
  }

  // Password reset token methods
  setPasswordResetToken(email: string, token: string, expiresInMinutes: number = 15): void {
    this.passwordResetTokens.set(email, {
      token,
      expires: Date.now() + expiresInMinutes * 60 * 1000,
    });
  }

  getPasswordResetToken(email: string): PasswordResetToken | undefined {
    return this.passwordResetTokens.get(email);
  }

  deletePasswordResetToken(email: string): void {
    this.passwordResetTokens.delete(email);
  }

  clearExpiredPasswordResetTokens(): void {
    const now = Date.now();
    for (const [email, tokenData] of this.passwordResetTokens.entries()) {
      if (now > tokenData.expires) {
        this.passwordResetTokens.delete(email);
      }
    }
  }

  // Demo data methods
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getAllVerificationCodes(): Map<string, VerificationCode> {
    return new Map(this.verificationCodes);
  }

  // Clear all data (for testing)
  clear(): void {
    this.users.clear();
    this.verificationCodes.clear();
    this.passwordResetTokens.clear();
  }
}

// Export a singleton instance
export const db = new InMemoryDB();

// Helper function to generate verification codes
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper function to generate password reset tokens
export function generatePasswordResetToken(): string {
  return crypto.randomUUID();
}