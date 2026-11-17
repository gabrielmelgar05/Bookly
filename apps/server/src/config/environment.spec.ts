import { validateEnvironment } from './environment.js';

const databaseUrl =
  'postgresql://bookly:bookly_dev@localhost:5434/bookly?schema=public';

describe('validateEnvironment', () => {
  it('usa os padrões locais e converte a porta fornecida pelo ambiente', () => {
    expect(validateEnvironment({ DATABASE_URL: databaseUrl })).toMatchObject({
      PORT: 3001,
      CORS_ORIGIN: 'http://localhost:3000',
    });
    expect(
      validateEnvironment({ DATABASE_URL: databaseUrl, PORT: '4001' }).PORT,
    ).toBe(4001);
  });

  it.each([
    undefined,
    '',
    'invalid',
    'https://example.com/db',
    'postgresql://localhost/',
  ])(
    'rejeita uma conexão inválida sem imprimir seu valor: %s',
    (DATABASE_URL) => {
      expect(() => validateEnvironment({ DATABASE_URL })).toThrow(
        'DATABASE_URL deve ser uma URL PostgreSQL válida.',
      );
    },
  );

  it.each(['', 'abc', '0', '65536', '3001.5'])(
    'rejeita a porta inválida: %s',
    (PORT) => {
      expect(() =>
        validateEnvironment({ DATABASE_URL: databaseUrl, PORT }),
      ).toThrow('PORT');
    },
  );

  it.each([
    '*',
    'http://localhost:3000/path',
    'http://localhost:3000/',
    'file:///tmp',
  ])('rejeita uma origem CORS inválida: %s', (CORS_ORIGIN) => {
    expect(() =>
      validateEnvironment({ DATABASE_URL: databaseUrl, CORS_ORIGIN }),
    ).toThrow('CORS_ORIGIN');
  });
});
