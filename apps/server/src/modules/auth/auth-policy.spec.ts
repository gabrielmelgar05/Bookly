import { validateEnvironment } from '../../config/environment.js';

const base = {
  DATABASE_URL: 'postgresql://bookly:bookly_dev@localhost:5434/bookly',
};

describe('Política de cookies e ambiente', () => {
  it('permite cookie sem Secure somente para HTTP local de desenvolvimento', () => {
    expect(validateEnvironment(base).SESSION_COOKIE_SECURE).toBe(false);
    expect(() =>
      validateEnvironment({ ...base, CORS_ORIGIN: 'http://public.example' }),
    ).toThrow('CORS_ORIGIN');
  });
  it('obriga HTTPS em produção', () => {
    expect(() =>
      validateEnvironment({ ...base, NODE_ENV: 'production' }),
    ).toThrow('CORS_ORIGIN');
    expect(
      validateEnvironment({
        ...base,
        NODE_ENV: 'production',
        CORS_ORIGIN: 'https://bookly.example',
      }).SESSION_COOKIE_SECURE,
    ).toBe(true);
  });
  it('usa Secure também quando o desenvolvimento usa HTTPS', () => {
    expect(
      validateEnvironment({ ...base, CORS_ORIGIN: 'https://localhost:3000' })
        .SESSION_COOKIE_SECURE,
    ).toBe(true);
  });
  it('rejeita um ambiente inválido', () => {
    expect(() => validateEnvironment({ ...base, NODE_ENV: {} })).toThrow(
      'NODE_ENV',
    );
  });
});
