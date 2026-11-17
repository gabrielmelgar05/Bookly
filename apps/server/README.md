# Bookly API

Backend NestJS com ESM/NodeNext, Prisma 7 e PostgreSQL 17. Os imports relativos terminam em `.js`, inclusive nos arquivos TypeScript, para corresponder ao JavaScript compilado.

Consulte o [README principal](../../README.md) para preparar o banco e as variáveis de ambiente.

## Desenvolvimento

```bash
npm ci
npm run start:dev
```

O `postinstall` gera o Prisma Client. A API usa a porta 3001 e o prefixo `/api`. `GET /api/health` consulta o banco; responde 200 quando conectado e 503 quando a consulta falha.

## Verificações

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:status
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

Os testes e2e exigem PostgreSQL real e fazem apenas consultas. O Vitest compartilha a configuração de decorators e metadados entre as suítes unitária e e2e.

## Produção local

```bash
npm run build
npm run start:prod
```

`prisma7.config.ts` é reconhecido pela CLI 7.10.1 instalada. Os scripts também fornecem `--config` explicitamente. O schema permanece sem modelos nesta etapa; migrações serão criadas quando houver alterações reais de domínio. O comando `npm run prisma:deploy` aplica apenas migrações já criadas e revisadas.

Detalhes e pendências estão no [relatório da auditoria](../../docs/etapa-00-auditoria.md).
