import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import request from 'supertest';
import { randomBytes, randomUUID } from 'node:crypto';
import { verify } from 'argon2';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { setupApp } from '../src/setup-app.js';
import { hashSessionToken } from '../src/modules/auth/session-cookie.js';

const origin = 'http://localhost:3000';
const password = 'synthetic password for automated validation';

describe('Autenticação HTTP com PostgreSQL real', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let emails: string[];

  function email() {
    const value = `auth-test-${randomUUID()}@example.test`;
    emails.push(value);
    return value;
  }
  function cookie(response: request.Response) {
    return String(response.headers['set-cookie']?.[0]).split(';')[0];
  }
  function post(path: string) {
    return request(app.getHttpServer())
      .post(`/api/auth/${path}`)
      .set('Origin', origin);
  }
  async function register(address = email()) {
    return post('register')
      .send({ name: 'Synthetic Professional', email: address, password })
      .expect(201);
  }

  beforeEach(async () => {
    emails = [];
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    // Delete only exact, randomly generated fixture addresses owned by this test.
    if (prisma && emails.length)
      await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await app?.close();
  });

  it('cadastra, normaliza, armazena somente hashes e cria sessão de sete dias', async () => {
    const address = email();
    const response = await post('register')
      .send({
        name: '  Synthetic   Professional  ',
        email: ` ${address.toUpperCase()} `,
        password,
      })
      .expect(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      name: 'Synthetic Professional',
      email: address,
    });
    expect(Object.keys(response.body).sort()).toEqual(['email', 'id', 'name']);
    const header = String(response.headers['set-cookie'][0]);
    for (const flag of ['HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=604'])
      expect(header.includes(flag)).toBe(true);
    expect(header.includes('Domain=')).toBe(false);
    expect(header.includes('Secure')).toBe(false);
    const stored = await prisma.user.findUniqueOrThrow({
      where: { email: address },
    });
    expect(stored.passwordHash.startsWith('$argon2id$')).toBe(true);
    expect(await verify(stored.passwordHash, password)).toBe(true);
    const token = cookie(response).split('=')[1];
    const session = await prisma.session.findUniqueOrThrow({
      where: { tokenHash: hashSessionToken(token) },
    });
    expect(session.tokenHash === token).toBe(false);
    expect(
      Math.abs(session.expiresAt.getTime() - Date.now() - 604800000),
    ).toBeLessThan(3000);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie(response))
      .expect(200)
      .expect(response.body);
  });

  it('resolve cadastros concorrentes pelo índice único sem criar duas contas', async () => {
    const address = email();
    const responses = await Promise.all([
      post('register').send({ name: 'Test One', email: address, password }),
      post('register').send({
        name: 'Test Two',
        email: address.toUpperCase(),
        password,
      }),
    ]);
    expect(responses.map((r) => r.status).sort((a, b) => a - b)).toEqual([
      201, 409,
    ]);
    expect(await prisma.user.count({ where: { email: address } })).toBe(1);
    expect(responses.find((r) => r.status === 409)?.body.code).toBe(
      'EMAIL_IN_USE',
    );
  });

  it.each([
    { name: '', email: 'bad', password: 'short' },
    { name: 'A', email: 'valid@example.test', password },
    { name: 'Test Name', email: 'bad', password },
    { name: 'Test Name', email: 'valid@example.test', password: 'short' },
    {
      name: 'Test Name',
      email: 'valid@example.test',
      password: 'x'.repeat(129),
    },
    { name: 'Test Name', email: 'valid@example.test', password, role: 'admin' },
  ])('rejeita entradas inválidas e propriedades extras', async (body) => {
    const response = await post('register')
      .send(
        body.email === 'valid@example.test'
          ? { ...body, email: email() }
          : body,
      )
      .expect(400);
    expect(response.body.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(response.body.details)).toBe(true);
  });

  it('faz login e rotaciona o token sem expor segredos', async () => {
    const address = email();
    const signup = await register(address);
    const login = await post('login')
      .set('Cookie', cookie(signup))
      .send({ email: address, password })
      .expect(200);
    expect(login.body).toEqual(signup.body);
    expect(cookie(login) === cookie(signup)).toBe(false);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie(signup))
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie(login))
      .expect(200);
  });

  it('usa a mesma resposta para senha incorreta e usuário inexistente', async () => {
    const address = email();
    await register(address);
    const wrong = await post('login')
      .send({ email: address, password: 'incorrect' })
      .expect(401);
    const missing = await post('login')
      .send({ email: email(), password })
      .expect(401);
    expect(wrong.body).toEqual(missing.body);
    expect(wrong.headers['set-cookie']).toBeUndefined();
  });

  it.each(['missing', 'malformed', 'unknown', 'expired', 'revoked'])(
    'rejeita sessão %s',
    async (kind) => {
      let sessionCookie = '';
      if (kind === 'malformed') sessionCookie = 'bookly_session=invalid';
      if (kind === 'unknown')
        sessionCookie = `bookly_session=${randomBytes(32).toString('base64url')}`;
      if (kind === 'expired' || kind === 'revoked') {
        const signup = await register();
        sessionCookie = cookie(signup);
        await prisma.session.updateMany({
          where: { userId: signup.body.id },
          data:
            kind === 'expired'
              ? { expiresAt: new Date(0) }
              : { revokedAt: new Date() },
        });
      }
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', sessionCookie)
        .expect(401);
      expect(response.body.code).toBe('UNAUTHENTICATED');
      if (kind === 'expired')
        await post('logout').set('Cookie', sessionCookie).send({}).expect(204);
    },
  );

  it('logout revoga no banco, limpa cookie e impede replay', async () => {
    const signup = await register();
    const oldCookie = cookie(signup);
    const logout = await post('logout')
      .set('Cookie', oldCookie)
      .send({})
      .expect(204);
    expect(
      String(logout.headers['set-cookie'][0]).startsWith('bookly_session=;'),
    ).toBe(true);
    expect(
      (
        await prisma.session.findFirstOrThrow({
          where: { userId: signup.body.id },
        })
      ).revokedAt,
    ).not.toBeNull();
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', oldCookie)
      .expect(401);
    await post('logout').set('Cookie', oldCookie).send({}).expect(204);
    await post('logout').send({}).expect(204);
  });

  it.each([
    undefined,
    'https://evil.example',
    'null',
    'http://localhost:3000.evil.example',
  ])('rejeita CSRF com origem ausente ou inválida', async (badOrigin) => {
    const operation = request(app.getHttpServer()).post('/api/auth/register');
    if (badOrigin) operation.set('Origin', badOrigin);
    const response = await operation
      .send({ name: 'Test Name', email: email(), password })
      .expect(403);
    expect(response.body.code).toBe('FORBIDDEN');
  });

  it('rejeita formulário e metadados cross-site sem encerrar sessão válida', async () => {
    const signup = await register();
    await post('logout')
      .set('Cookie', cookie(signup))
      .set('Sec-Fetch-Site', 'cross-site')
      .send({})
      .expect(403);
    await post('login')
      .type('form')
      .send({ email: email(), password })
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie(signup))
      .expect(200);
  });

  it('isola os dados de duas contas', async () => {
    const a = await register();
    const b = await register();
    await request(app.getHttpServer())
      .get(`/api/auth/me?userId=${b.body.id}`)
      .set('Cookie', cookie(a))
      .expect(200)
      .expect(a.body);
    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Cookie', cookie(b))
      .expect(200)
      .expect(b.body);
  });

  it('bloqueia tentativas repetidas por conta normalizada antes do limite de IP', async () => {
    const address = email();
    for (let i = 0; i < 10; i++)
      await post('login')
        .send({ email: i % 2 ? address.toUpperCase() : address, password })
        .expect(401);
    const response = await post('login')
      .send({ email: address, password })
      .expect(429);
    expect(response.body.code).toBe('RATE_LIMITED');
  });

  it('limita IP mesmo variando e-mails e forjando X-Forwarded-For', async () => {
    for (let i = 0; i < 20; i++)
      await post('login')
        .set('X-Forwarded-For', `192.0.2.${i + 1}`)
        .send({ email: email(), password })
        .expect(401);
    await post('login')
      .set('X-Forwarded-For', '198.51.100.1')
      .send({ email: email(), password })
      .expect(429);
  });
});
