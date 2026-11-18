import {
  ConflictException,
  HttpException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { publicUserSelect } from './auth.types.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import { PasswordService } from './password.service.js';
import { hashSessionToken, newSession } from './session-cookie.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}

  private databaseError(error: unknown): never {
    if (error instanceof HttpException) throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }
    throw new ServiceUnavailableException(
      'Não foi possível acessar o serviço. Tente novamente em instantes.',
    );
  }

  private async rotatePreviousSession(
    tx: Prisma.TransactionClient,
    previousToken?: string,
  ) {
    if (previousToken)
      await tx.session.updateMany({
        where: { tokenHash: hashSessionToken(previousToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
  }

  async register(input: RegisterDto, previousToken?: string) {
    const passwordHash = await this.passwords.hash(input.password);
    const session = newSession();
    try {
      const user = await this.prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { name: input.name, email: input.email, passwordHash },
          select: publicUserSelect,
        });
        await tx.session.create({
          data: {
            userId: created.id,
            tokenHash: session.tokenHash,
            expiresAt: session.expiresAt,
          },
        });
        await this.rotatePreviousSession(tx, previousToken);
        return created;
      });
      return { user, token: session.token, expiresAt: session.expiresAt };
    } catch (error) {
      this.databaseError(error);
    }
  }

  async login(input: LoginDto, previousToken?: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: input.email },
        select: { ...publicUserSelect, passwordHash: true },
      });
      const valid = await this.passwords.verify(
        input.password,
        user?.passwordHash,
      );
      if (!user || !valid)
        throw new UnauthorizedException('E-mail ou senha incorretos.');
      const session = newSession();
      await this.prisma.$transaction(async (tx) => {
        await tx.session.create({
          data: {
            userId: user.id,
            tokenHash: session.tokenHash,
            expiresAt: session.expiresAt,
          },
        });
        await this.rotatePreviousSession(tx, previousToken);
      });
      return {
        user: { id: user.id, name: user.name, email: user.email },
        token: session.token,
        expiresAt: session.expiresAt,
      };
    } catch (error) {
      this.databaseError(error);
    }
  }

  async authenticate(token?: string) {
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token))
      throw new UnauthorizedException('Entre na sua conta para continuar.');
    try {
      const session = await this.prisma.session.findUnique({
        where: { tokenHash: hashSessionToken(token) },
        select: {
          id: true,
          expiresAt: true,
          revokedAt: true,
          user: { select: publicUserSelect },
        },
      });
      if (
        !session ||
        session.revokedAt ||
        session.expiresAt.getTime() <= Date.now()
      )
        throw new UnauthorizedException('Entre na sua conta para continuar.');
      return { user: session.user, sessionId: session.id };
    } catch (error) {
      this.databaseError(error);
    }
  }

  async logout(token?: string) {
    if (!token) return;
    try {
      await this.prisma.session.updateMany({
        where: { tokenHash: hashSessionToken(token), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch (error) {
      this.databaseError(error);
    }
  }
}
