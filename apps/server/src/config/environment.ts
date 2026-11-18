export function validateEnvironment(config: Record<string, unknown>) {
  const databaseUrl = config.DATABASE_URL;

  try {
    if (typeof databaseUrl !== 'string') {
      throw new Error();
    }

    const url = new URL(databaseUrl);
    if (
      !['postgresql:', 'postgres:'].includes(url.protocol) ||
      !url.hostname ||
      url.pathname.length <= 1
    ) {
      throw new Error();
    }
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida.');
  }

  const port = Number(config.PORT ?? 3001);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
  }

  const corsOrigin = config.CORS_ORIGIN ?? 'http://localhost:3000';
  const nodeEnv = config.NODE_ENV ?? 'development';
  if (
    typeof nodeEnv !== 'string' ||
    !['development', 'test', 'production'].includes(nodeEnv)
  ) {
    throw new Error('NODE_ENV deve ser development, test ou production.');
  }
  try {
    if (typeof corsOrigin !== 'string') {
      throw new Error();
    }

    const url = new URL(corsOrigin);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.origin !== corsOrigin
    ) {
      throw new Error();
    }
    if (nodeEnv === 'production' && url.protocol !== 'https:') {
      throw new Error();
    }
    if (
      nodeEnv !== 'production' &&
      url.protocol === 'http:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    ) {
      throw new Error();
    }
  } catch {
    throw new Error(
      'CORS_ORIGIN deve ser uma origem HTTP válida, sem caminho.',
    );
  }

  return {
    ...config,
    DATABASE_URL: databaseUrl,
    PORT: port,
    CORS_ORIGIN: corsOrigin,
    NODE_ENV: nodeEnv,
    SESSION_COOKIE_SECURE: new URL(String(corsOrigin)).protocol === 'https:',
  };
}
