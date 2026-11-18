import { Injectable, type OnModuleInit } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { argon2id, hash, verify } from 'argon2';

@Injectable()
export class PasswordService implements OnModuleInit {
  private dummyHash = '';

  async onModuleInit() {
    this.dummyHash = await this.hash(randomBytes(32).toString('base64url'));
  }

  hash(password: string) {
    return hash(password, {
      type: argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
  }

  async verify(password: string, storedHash?: string) {
    try {
      return await verify(storedHash ?? this.dummyHash, password);
    } catch {
      return false;
    }
  }
}
