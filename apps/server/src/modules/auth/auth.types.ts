import type { Request } from 'express';

export const publicUserSelect = { id: true, name: true, email: true } as const;

export type PublicUser = { id: string; name: string; email: string };
export type AuthenticatedRequest = Request & {
  user: PublicUser;
  sessionId: string;
};
