import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function hashPassword(
  password: string,
  saltRounds: number = 10,
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateVerificationToken(): string {
  const token = crypto.randomBytes(16).toString('hex');
  return token;
}
