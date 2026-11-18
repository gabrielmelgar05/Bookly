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

Os testes e2e exigem PostgreSQL real; a suíte de autenticação cria e remove apenas suas próprias contas sintéticas. O Vitest compartilha a configuração de decorators e metadados entre as suítes unitária e e2e.

## Produção local

```bash
npm run build
npm run start:prod
```

`prisma7.config.ts` é reconhecido pela CLI 7.10.1 instalada. Os scripts também fornecem `--config` explicitamente. O schema possui os modelos `User` e `Session`, criados na migração versionada da etapa 02. O comando `npm run prisma:deploy` aplica apenas migrações já criadas e revisadas.

Detalhes e pendências estão no [relatório da auditoria](../../docs/etapa-00-auditoria.md).

## Autenticação

- `POST /api/auth/register`: nome, e-mail e senha; conta e sessão são criadas atomicamente.
- `POST /api/auth/login`: credenciais; retorna somente o usuário público.
- `GET /api/auth/me`: exige sessão válida; retorna id, nome e e-mail.
- `POST /api/auth/logout`: revoga a sessão atual e limpa o cookie, inclusive para sessão expirada.

Os POSTs exigem `Origin` igual a `CORS_ORIGIN` e conteúdo `application/json`. No navegador, as requisições enviam `credentials: "include"`. Senhas têm de 15 a 128 caracteres no cadastro; a confirmação é feita no frontend.

Sessões duram sete dias, com somente o hash SHA-256 do token salvo no PostgreSQL. Senhas usam Argon2id. O cookie é HTTP-only, SameSite=Lax, sem Domain e com Path=/. Em produção, use `NODE_ENV=production` e `CORS_ORIGIN` com HTTPS; o cookie usa Secure.

Login e cadastro têm limites por IP e por e-mail normalizado. O armazenamento do rate limiter é local ao processo; múltiplas instâncias exigem um armazenamento compartilhado.

O lint existente do backend é Oxlint com análise de tipos, preservado nesta etapa. Consulte [etapa 02](../../docs/etapa-02-autenticacao.md) para todos os resultados e limitações.
