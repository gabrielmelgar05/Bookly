import { Test } from '@nestjs/testing';
import { Body, Controller, Post, type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { setupApp } from '../src/setup-app.js';

// This route exists only in the test module to exercise the global pipe.
class ValidationProbeDto {
  @Type(() => Number)
  @IsInt()
  value!: number;
}

@Controller('_validation')
class ValidationProbeController {
  @Post()
  check(@Body() body: ValidationProbeDto) {
    return body;
  }
}

describe('Infraestrutura da API (e2e com PostgreSQL real)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ValidationProbeController],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('GET /api/health consulta o PostgreSQL e retorna 200', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect({ status: 'ok', service: 'bookly-api', database: 'connected' });
  });

  it('exige o prefixo /api', () => {
    return request(app.getHttpServer()).get('/health').expect(404);
  });

  it('permite a origem configurada para o frontend', () => {
    const origin = app.get(ConfigService).getOrThrow<string>('CORS_ORIGIN');
    return request(app.getHttpServer())
      .options('/api/health')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'GET')
      .expect(204)
      .expect('Access-Control-Allow-Origin', origin);
  });

  it('não libera uma origem diferente da configurada', async () => {
    const origin = 'https://untrusted.example';
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', origin)
      .expect(200);
    expect(response.headers['access-control-allow-origin']).not.toBe(origin);
  });

  it('retorna 503 e uma resposta genérica se a consulta falhar', async () => {
    const query = vi.spyOn(app.get(PrismaService), '$queryRaw');
    query.mockRejectedValueOnce(
      new Error('postgresql://private:secret@host/db'),
    );
    try {
      await request(app.getHttpServer()).get('/api/health').expect(503).expect({
        status: 'error',
        service: 'bookly-api',
        database: 'disconnected',
      });
    } finally {
      query.mockRestore();
    }
  });

  it('transforma o payload usando o ValidationPipe global', () => {
    return request(app.getHttpServer())
      .post('/api/_validation')
      .send({ value: '3' })
      .expect(201)
      .expect({ value: 3 });
  });

  it('rejeita um payload inválido com HTTP 400', () => {
    return request(app.getHttpServer())
      .post('/api/_validation')
      .send({ value: 'invalid' })
      .expect(400);
  });

  it('rejeita propriedades não declaradas no DTO', () => {
    return request(app.getHttpServer())
      .post('/api/_validation')
      .send({ value: 3, extra: true })
      .expect(400);
  });

  afterAll(async () => {
    await app?.close();
  });
});
