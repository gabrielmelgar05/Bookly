# Etapa 00 — Auditoria e finalização da infraestrutura

Auditoria executada em **17/11/2026**, no fuso America/Porto_Velho. Escopo restrito à infraestrutura e à página temporária de integração.

## Estado inicial e decisões

| Item | Diagnóstico | Decisão / correção |
| --- | --- | --- |
| Estrutura | `apps/web`, `apps/server` e Compose já existiam; faltava documentação central | Projetos preservados; README principal e relatório adicionados |
| Módulos TypeScript | Backend ESM (`type: module`) com NodeNext; frontend com resolução bundler | Configurações TypeScript preservadas; imports relativos `.js` mantidos no backend |
| Prisma | CLI, Client e adapter 7.10.1; `prisma7.config.ts` reconhecido na prática | Nome preservado, scripts explícitos com `--config`; não foi criado arquivo duplicado |
| Geração do Client | Client local existia, mas faltava geração na instalação | `postinstall` gera o Client; a configuração permite gerar sem `DATABASE_URL` |
| Inicialização Nest | Porta padrão 3000; sem prefixo, CORS, ValidationPipe ou hooks de encerramento | Porta 3001, `/api`, origem local configurável, validação global e shutdown configurados |
| Ambiente | Backend só tinha `DATABASE_URL`; frontend não tinha URL da API | Exemplos adicionados, configuração local preenchida e validação de conexão, porta e origem |
| Healthcheck | Consulta real já existia, mas falha dependia do tratamento genérico do Nest | HealthModule; sucesso 200, falha 503 genérica, sem cache ou informações de conexão |
| Conexões | Prisma conectava e desconectava no ciclo de vida, mas faltavam hooks na aplicação | Ciclo preservado; hooks ativados e timeouts de conexão/consulta de 5 segundos |
| Código inicial | Rota e teste de “Hello World!” não verificavam a infraestrutura | Controller/service iniciais removidos; testes substituídos por healthcheck e infraestrutura |
| Frontend | Página de exemplo do Next e fontes do Google exigiam rede no build | Página Bookly mínima, consulta no navegador, timeout, estados acessíveis e fontes do sistema |
| Tailwind | Loader Turbopack já configurado e válido | Preservado; estilos computados verificados no navegador |
| Raiz Turbopack | Aviso de lockfile fora do repositório no diretório do usuário | Raiz explícita em `apps/web`, sem alterar arquivos externos |
| Gitignore | Regra local do frontend escondia também `.env.example` | Exceção corrigida; cache, temporários, segredos e código gerado ignorados |
| Documentação | READMEs genéricos de Next/Nest | Instruções específicas de instalação, execução, migrações e verificações |

## Versões verificadas

| Componente | Versão instalada/testada |
| --- | --- |
| Node.js / NPM | 24.22.2 / 11.19.1 |
| Next.js / React / React DOM | 16.4.6 / 19.3.0 / 19.3.0 |
| TypeScript frontend / backend | 5.9.3 / 6.0.3 |
| Tailwind / loader Turbopack | 4.3.3 / 4.3.3 |
| Lucide React | 1.74.0 |
| Nest common/core/platform-express | 12.5.1 |
| Nest Config | 12.1.1 |
| Prisma CLI / Client / adapter-pg | 7.10.1 / 7.10.1 / 7.10.1 |
| pg | 8.23.1 |
| class-validator / class-transformer | 0.15.1 / 0.5.1 |
| Vitest / Vite | 4.1.12 / 8.3.8 |
| PostgreSQL / imagem | 17.11 / postgres:17-alpine |
| Docker / Compose | 29.8.1 / v5.5.1 |

Nenhuma biblioteca foi adicionada, removida ou substituída. As dependências existentes foram reinstaladas com `npm ci` em cada aplicação. Os manifests e lockfiles receberam os metadados de engines e os scripts necessários; a stack e as versões diretas instaladas foram mantidas. `.nvmrc` seleciona Node.js 24; os manifests declaram Node.js 24 e NPM 11.

## PostgreSQL e migrações

- `docker compose config --quiet`: válido.
- `docker compose up -d --wait postgres`: contêiner existente em execução e saudável.
- Contêiner: `bookly-postgres`; porta `127.0.0.1:5434` → `5432`.
- Banco/usuário: `bookly`; URL local conferida contra a especificação.
- Volume original preservado: `bookly_bookly_postgres_data`.
- Inspeção SQL inicial: apenas `_prisma_migrations`, sem registros.
- Não há diretório com migrações existentes nem modelos no schema.
- `prisma migrate status`: “No migration found” e “Database schema is up to date!”.
- Nenhuma migração, tabela, dado ou volume foi apagado ou recriado. Nenhum reset ou `db push` foi executado; nenhuma migração nova foi necessária.

A CLI instalada procura expressamente `prisma7.config.*` antes dos nomes anteriores, conforme seu código em `node_modules/@prisma/config/dist/index.js`. A execução de `prisma validate`, `generate` e `migrate status` confirmou o carregamento de `prisma7.config.ts`. A configuração utiliza `process.env.DATABASE_URL` para permitir geração sem ambiente; operações que acessam o banco continuam exigindo a conexão. A [referência do Prisma Config](https://docs.prisma.io/docs/orm/reference/prisma-config-reference) explica a diferença entre leitura das variáveis e comandos que não dependem do banco.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm ci` frontend | Aprovado, instalação a partir do lockfile |
| `npm ci` backend + postinstall | Aprovado, Client 7.10.1 gerado |
| Frontend ESLint | Aprovado |
| Frontend `next typegen` + `tsc --noEmit` | Aprovado |
| Frontend `next build` | Aprovado com Turbopack, incluindo TypeScript e geração das páginas |
| Backend `prisma validate` | Schema válido |
| Backend `prisma generate` | Client gerado no diretório ignorado |
| Geração sem ambiente | Aprovada com `DATABASE_URL` removida do processo e leitura do `.env` desabilitada |
| Backend `prisma migrate status` | Banco atualizado; nenhuma migração pendente |
| Backend `tsc --noEmit` | Aprovado |
| Backend Oxlint com tipos | Aprovado |
| Backend `nest build` | Aprovado, ESM compilado em `dist/main.js` |
| Vitest unitário | 17 testes aprovados em 2 arquivos |
| Vitest e2e com PostgreSQL real | 8 testes aprovados |
| API compilada `GET /api/health` | HTTP 200, JSON esperado, CORS local e `Cache-Control: no-store` |
| API compilada `GET /health` | HTTP 404, confirmando prefixo obrigatório |
| API temporária com porta de banco inacessível | HTTP 503, JSON genérico e sem URL ou credenciais |
| Next compilado `GET /` | HTTP 200 |
| Chrome headless, requisição real | Página → API → Prisma → PostgreSQL confirmado |
| Chrome, resposta pausada | Estado de carregamento confirmado |
| Chrome, resposta HTTP 503 | Mensagem de falha confirmada |
| Chrome, HTTP 200 com banco desconectado | Resposta rejeitada; sem falso sucesso |
| Chrome, falha de rede | Mensagem de falha confirmada |
| Chrome, resposta retida | Timeout de 10 segundos confirmado |
| Chrome, idioma/estilos/JavaScript | `pt-BR`, Tailwind aplicado e nenhum erro JavaScript não tratado |
| Encerramento das APIs por SIGTERM | Processos encerrados; conexões das APIs no PostgreSQL passaram de 1 para 0 |
| Regras Gitignore | `.env`, `.env.local`, builds, Client e cache ignorados; exemplos disponíveis para versionamento |

Os testes e2e cobrem consulta real, prefixo, CORS permitido e origem divergente, resposta 503 sem dados sensíveis, transformação do DTO, rejeição de valor inválido e rejeição de propriedades extras. O controller de validação é exclusivo do módulo de testes e não é incluído na aplicação de produção.

O primeiro build do frontend falhou ao baixar fontes do Google; a página temporária passou a usar fontes do sistema. Uma execução com restrições de sockets também armazenou uma falha no cache do Turbopack. O diretório gerado `.next` foi movido para o cache local ignorado, e o build completo passou em uma execução com acesso aos sockets locais. O Compose e o PostgreSQL não foram alterados por esse procedimento.

## Alertas do NPM e pendências

| Auditoria em 17/11/2026 | Resultado |
| --- | --- |
| Backend completo | 16 alertas: 13 altos, 1 moderado e 2 baixos |
| Frontend completo | 14 alertas altos |
| Backend `npm audit --omit=dev` | Zero vulnerabilidades reportadas |
| Frontend `npm audit --omit=dev` | Zero vulnerabilidades reportadas |

Os alertas completos atingem ferramentas de desenvolvimento. A cadeia de `picomatch` aparece no Nest CLI, Vite/Vitest e ferramentas ESLint; o registro consultado ainda apresentava 4.0.7 como última versão. No backend, `@nestjs/mau` também traz alertas por `undici`, `inquirer`, `external-editor` e `tmp`. As correções automáticas propostas incluem downgrades de Nest CLI, Vitest, Vite e configuração ESLint para versões incompatíveis com o projeto. Essas sugestões não foram aplicadas.

O NPM também avisou que ESLint 9.39.5 está fora do suporte e listou scripts de instalação de `prisma`, `@prisma/engines` e `argon2` ainda sem configuração explícita em `allowScripts`. Os scripts foram enumerados para revisão; nenhuma política de execução foi modificada automaticamente. As instalações, a CLI Prisma e os builds funcionaram no ambiente verificado.

Pendências: acompanhar correções compatíveis das ferramentas de desenvolvimento, avaliar a atualização coordenada do ESLint e revisar a política `allowScripts` antes de adotá-la. Esses alertas permanecem documentados; não foi executado `npm audit fix --force`, downgrade ou atualização incompatível. Não houve teste de deploy/hosting remoto, que está fora desta etapa.

## Arquivos criados e modificados

- Raiz: `.gitignore`, `.nvmrc` e `README.md`.
- Documentação: `docs/etapa-00-auditoria.md`, `apps/server/README.md` e `apps/web/README.md`.
- Backend: `package.json`, `package-lock.json`, `prisma7.config.ts`, `.env.example`, ambiente local ignorado, `src/main.ts`, `src/app.module.ts`, `src/setup-app.ts`, `src/config/environment.ts`, `src/config/environment.spec.ts`, `src/prisma/prisma.module.ts`, `src/prisma/prisma.service.ts`, `src/health/health.module.ts`, `src/health/health.controller.ts`, `src/health/health.controller.spec.ts`, `test/app.e2e-spec.ts`, `vitest.config.ts` e `vitest.config.e2e.ts`.
- Frontend: `package.json`, `package-lock.json`, `.gitignore`, `.env.example`, `.env.local` ignorado, `next.config.ts`, `src/app/page.tsx`, `src/app/layout.tsx` e `src/app/globals.css`.
- Removidos apenas os arquivos iniciais de “Hello World!”: `apps/server/src/app.controller.ts`, `apps/server/src/app.service.ts` e `apps/server/src/app.controller.spec.ts`. O health controller original saiu de `src/health.controller.ts` e passou a integrar o módulo `src/health/`.
- Preservados sem mudança: `compose.yaml`, schema Prisma, tsconfigs, configurações ESLint/Oxlint e instruções `AGENTS.md`.
- Artefatos gerados (dependências, builds, logs e materiais da verificação no navegador) ficam ignorados pelo Git.

Nenhuma funcionalidade de autenticação, usuários, serviços ou agendamentos foi implementada. Não foram criados commits nem executado push. Os comandos para iniciar os três serviços estão no [README principal](../README.md).

Ao terminar, as APIs, o frontend e o navegador temporários foram encerrados. O PostgreSQL original permaneceu em execução e saudável. O repositório já estava sem commits e com os arquivos iniciais não rastreados; esse estado de versionamento foi preservado.
