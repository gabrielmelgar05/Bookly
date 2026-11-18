import { createHash, randomBytes } from 'node:crypto';
import type { CookieOptions, Request } from 'express';

export const SESSION_COOKIE = 'bookly_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieOptions(secure: boolean): CookieOptions {
  return { httpOnly: true, sameSite: 'lax', secure, path: '/' };
}

export function readSessionToken(request: Request): string | undefined {
  const token: unknown = request.cookies?.[SESSION_COOKIE];
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token)
    ? token
    : undefined;
}

export function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function newSession() {
  const token = randomBytes(32).toString('base64url');
  return {
    token,
    tokenHash: hashSessionToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  };
}
