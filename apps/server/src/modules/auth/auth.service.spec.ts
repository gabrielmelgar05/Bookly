import {
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import type { PasswordService } from './password.service.js';
import { hashSessionToken } from './session-cookie.js';

const user = {
  id: 'test-user',
  name: 'Test Professional',
  email: 'unit@example.test',
};
const input = { ...user, password: 'a synthetic password for tests' };

describe('AuthService', () => {
  const tx = {
    user: { create: vi.fn() },
    session: { create: vi.fn(), updateMany: vi.fn() },
  };
  const prisma = {
    $transaction: vi.fn(),
    user: { findUnique: vi.fn() },
    session: { findUnique: vi.fn(), updateMany: vi.fn() },
  };
  const passwords = { hash: vi.fn(), verify: vi.fn() };
  let service: AuthService;

  beforeEach(() => {
    vi.resetAllMocks();
    tx.user.create.mockResolvedValue(user);
    passwords.hash.mockResolvedValue('argon2id-hash');
    passwords.verify.mockResolvedValue(true);
    prisma.$transaction.mockImplementation(
      (operation: (transaction: typeof tx) => unknown) => operation(tx),
    );
    service = new AuthService(
      prisma as unknown as PrismaService,
      passwords as unknown as PasswordService,
    );
  });

  it('cria usuário e sessão atomicamente, sem senha em texto puro', async () => {
    const result = await service.register(input);
    expect(result.user).toEqual(user);
    expect(tx.user.create.mock.calls[0][0].data.passwordHash).toBe(
      'argon2id-hash',
    );
    const created = tx.session.create.mock.calls[0][0].data;
    expect(created.tokenHash === result.token).toBe(false);
    expect(created.tokenHash === hashSessionToken(result.token)).toBe(true);
    expect(
      Math.abs(created.expiresAt.getTime() - Date.now() - 604800000),
    ).toBeLessThan(2000);
  });

  it('converte violação do índice único em conflito', async () => {
    tx.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('unique', {
        code: 'P2002',
        clientVersion: '7.10.1',
      }),
    );
    await expect(service.register(input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('autentica credenciais e rotaciona a sessão anterior', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      passwordHash: 'stored-hash',
    });
    const result = await service.login(input, 'x'.repeat(43));
    expect(Object.keys(result.user).sort()).toEqual(['email', 'id', 'name']);
    expect(tx.session.updateMany).toHaveBeenCalledWith({
      where: { tokenHash: hashSessionToken('x'.repeat(43)), revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });

  it.each([null, { ...user, passwordHash: 'stored-hash' }])(
    'não diferencia conta inexistente e senha incorreta',
    async (record) => {
      prisma.user.findUnique.mockResolvedValue(record);
      passwords.verify.mockResolvedValue(false);
      await expect(service.login(input)).rejects.toThrow(
        'E-mail ou senha incorretos.',
      );
      expect(passwords.verify).toHaveBeenCalled();
      expect(tx.session.create).not.toHaveBeenCalled();
    },
  );

  it.each([
    null,
    { id: 'session', expiresAt: new Date(0), revokedAt: null, user },
    {
      id: 'session',
      expiresAt: new Date(Date.now() + 60000),
      revokedAt: new Date(),
      user,
    },
  ])('rejeita sessão desconhecida, expirada ou revogada', async (record) => {
    prisma.session.findUnique.mockResolvedValue(record);
    await expect(service.authenticate('a'.repeat(43))).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejeita token malformado antes de consultar o banco', async () => {
    await expect(service.authenticate('invalid')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.session.findUnique).not.toHaveBeenCalled();
  });

  it('revoga apenas o token informado e aceita logout sem token', async () => {
    await service.logout('a'.repeat(43));
    expect(prisma.session.updateMany).toHaveBeenCalledWith({
      where: { tokenHash: hashSessionToken('a'.repeat(43)), revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    await service.logout();
    expect(prisma.session.updateMany).toHaveBeenCalledTimes(1);
  });

  it('não expõe falhas internas do banco', async () => {
    prisma.user.findUnique.mockRejectedValue(
      new Error('private connection information'),
    );
    await expect(service.login(input)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    await expect(service.login(input)).rejects.not.toThrow(
      'private connection information',
    );
  });
});
