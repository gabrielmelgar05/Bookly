import { type ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected override generateKey(
    context: ExecutionContext,
    suffix: string,
    name: string,
  ) {
    if (name === 'account') {
      const request = context
        .switchToHttp()
        .getRequest<Request<unknown, unknown, Record<string, unknown>>>();
      const email = request.body?.email;
      suffix =
        typeof email === 'string'
          ? email.trim().toLowerCase().slice(0, 254)
          : `invalid:${suffix}`;
    }
    // The first-party guard hashes the key, keeping email addresses out of storage.
    return super.generateKey(context, suffix, name);
  }
}
