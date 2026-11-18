import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../../prisma/prisma.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from './password.service.js';
import { AuthErrorsFilter } from './auth-errors.filter.js';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard.js';
import { OriginGuard } from './guards/origin.guard.js';
import { SessionGuard } from './guards/session.guard.js';

@Module({
  imports: [
    PrismaModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'ip', ttl: 60000, limit: 20 },
        { name: 'account', ttl: 900000, limit: 10 },
      ],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    AuthErrorsFilter,
    AuthThrottlerGuard,
    OriginGuard,
    SessionGuard,
  ],
  exports: [SessionGuard, AuthService],
})
export class AuthModule {}
