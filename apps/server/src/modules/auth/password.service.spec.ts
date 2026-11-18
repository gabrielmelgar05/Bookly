import { PasswordService } from './password.service.js';
import {
  SESSION_DURATION_MS,
  newSession,
  sessionCookieOptions,
} from './session-cookie.js';

describe('Senhas e tokens', () => {
  it('gera Argon2id com salt distinto e verifica a senha', async () => {
    const service = new PasswordService();
    await service.onModuleInit();
    const password = 'synthetic validation password';
    const a = await service.hash(password);
    const b = await service.hash(password);
    expect(a.startsWith('$argon2id$v=19$m=19456,t=2,p=1$')).toBe(true);
    expect(a === b).toBe(false);
    expect(await service.verify(password, a)).toBe(true);
    expect(await service.verify('incorrect', a)).toBe(false);
    expect(await service.verify(password)).toBe(false);
  });

  it('gera tokens aleatórios com 256 bits e duração de sete dias', () => {
    const a = newSession();
    const b = newSession();
    expect(/^[A-Za-z0-9_-]{43}$/.test(a.token)).toBe(true);
    expect(a.token === b.token).toBe(false);
    expect(a.tokenHash.length).toBe(64);
    expect(SESSION_DURATION_MS).toBe(604800000);
  });

  it('usa cookies HTTP-only sem Domain e com Secure configurável', () => {
    expect(sessionCookieOptions(true)).toEqual({
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
    });
    expect(sessionCookieOptions(false).secure).toBe(false);
  });
});
