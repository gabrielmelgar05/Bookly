import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthErrorsFilter } from './auth-errors.filter.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard.js';
import { OriginGuard } from './guards/origin.guard.js';
import { SessionGuard } from './guards/session.guard.js';
import {
  SESSION_COOKIE,
  readSessionToken,
  sessionCookieOptions,
} from './session-cookie.js';

@Controller('auth')
@UseFilters(AuthErrorsFilter)
@UseGuards(OriginGuard)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions() {
    return sessionCookieOptions(
      this.config.getOrThrow<boolean>('SESSION_COOKIE_SECURE'),
    );
  }

  private setSessionCookie(
    response: Response,
    session: { token: string; expiresAt: Date },
  ) {
    response.cookie(SESSION_COOKIE, session.token, {
      ...this.cookieOptions(),
      maxAge: Math.max(0, session.expiresAt.getTime() - Date.now()),
    });
  }

  @Post('register')
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthThrottlerGuard)
  async register(
    @Body() input: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.register(input, readSessionToken(request));
    this.setSessionCookie(response, session);
    return session.user;
  }

  @Post('login')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(AuthThrottlerGuard)
  async login(
    @Body() input: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.auth.login(input, readSessionToken(request));
    this.setSessionCookie(response, session);
    return session.user;
  }

  @Get('me')
  @Header('Cache-Control', 'no-store')
  @UseGuards(SessionGuard)
  me(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Post('logout')
  @HttpCode(204)
  @Header('Cache-Control', 'no-store')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(readSessionToken(request));
    response.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }
}
