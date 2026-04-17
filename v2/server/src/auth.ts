import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from './env.js';

export type Role = 'admin' | 'user';

export interface TokenPayload {
  sub: string;
  role: Role;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.jwtSecret, opts);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === 'string') throw new Error('Invalid token payload');
  const { sub, role, name } = decoded as jwt.JwtPayload & Partial<TokenPayload>;
  if (!sub || !role || !name) throw new Error('Invalid token payload');
  return { sub, role, name };
}
