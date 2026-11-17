import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  const queryRaw = vi.fn();
  let controller: HealthController;

  beforeEach(async () => {
    queryRaw.mockReset();
    const module = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();
    controller = module.get(HealthController);
  });

  it('confirma a conexão somente depois de consultar o banco', async () => {
    queryRaw.mockResolvedValue([{ '?column?': 1 }]);
    await expect(controller.check()).resolves.toEqual({
      status: 'ok',
      service: 'bookly-api',
      database: 'connected',
    });
    expect(queryRaw).toHaveBeenCalledWith(['SELECT 1']);
  });

  it('responde 503 sem expor o erro de conexão', async () => {
    queryRaw.mockRejectedValue(
      new Error('postgresql://private:secret@host/db'),
    );
    const error = await controller.check().catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getStatus()).toBe(503);
    expect((error as ServiceUnavailableException).getResponse()).toEqual({
      status: 'error',
      service: 'bookly-api',
      database: 'disconnected',
    });
  });
});
