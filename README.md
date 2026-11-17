# Bookly

Bookly é um sistema de agendamentos online para profissionais e prestadores de serviços. A etapa 00 preparou a infraestrutura full stack; a etapa 01 adicionou a identidade visual, o dashboard responsivo e a navegação do frontend. O painel utiliza estados vazios e ainda não cria ou persiste dados de negócio.

## Stack

- Frontend: Next.js 16, React, TypeScript, App Router, Tailwind CSS e Lucide React.
- Backend: NestJS, TypeScript, Prisma 7, `@prisma/adapter-pg`, `pg`, class-validator e class-transformer.
- Banco: PostgreSQL 17 em Docker Compose.
- Ferramentas: Node.js 24, NPM 11 e Vitest. Cada aplicação tem seu próprio `package.json` e `package-lock.json`.

## Estrutura

```text
Bookly/
├── apps/
│   ├── web/                  # Next.js
│   └── server/               # NestJS
│       ├── prisma/           # Schema e futuras migrações
│       ├── prisma7.config.ts # Configuração da CLI Prisma instalada
│       ├── src/
│       │   ├── config/       # Validação do ambiente
│       │   ├── health/       # HealthModule e controller
│       │   └── prisma/       # PrismaModule e PrismaService
│       └── test/             # Testes HTTP com PostgreSQL real
├── docs/
├── compose.yaml
└── README.md
```

Os módulos Auth, Users, Professionals, Services, Availability e Bookings serão adicionados nas respectivas etapas de desenvolvimento.

## Preparação

Na raiz do repositório, com Docker e o plugin Compose disponíveis:

```bash
nvm use
cp -n apps/server/.env.example apps/server/.env
cp -n apps/web/.env.example apps/web/.env.local
npm --prefix apps/server ci
npm --prefix apps/web ci
docker compose up -d --wait postgres
npm --prefix apps/server run prisma:status
```

Se ainda não houver Node.js 24 instalado no NVM, execute `nvm install` antes de `nvm use`. Os comandos `cp -n` preservam arquivos locais existentes; confira seus valores se já tiver configurado o ambiente.

O `npm ci` do backend gera o Prisma Client automaticamente. A geração não exige acesso ao banco. Nunca edite ou versione `apps/server/src/generated/prisma/`.

## Iniciar em desenvolvimento

Banco, a partir da raiz:

```bash
docker compose up -d --wait postgres
```

Backend, em outro terminal:

```bash
npm --prefix apps/server run start:dev
```

Frontend, em outro terminal:

```bash
npm --prefix apps/web run dev
```

Abra <http://localhost:3000> e use **Explorar demonstração** para acessar <http://localhost:3000/dashboard>. O painel contém visão geral, calendário, agendamentos, serviços, disponibilidade e configurações. O calendário permite navegar entre datas e períodos sem criar reservas.

O indicador discreto da API fica no header do dashboard e no rodapé da página inicial. Ele consulta <http://localhost:3001/api/health> no navegador, com estados de carregamento, conexão e falha, limite de 10 segundos e botão para consultar novamente.

## Variáveis locais

| Aplicação | Variável | Valor de desenvolvimento |
| --- | --- | --- |
| Server | `DATABASE_URL` | `postgresql://bookly:bookly_dev@localhost:5434/bookly?schema=public` |
| Server | `PORT` | `3001` |
| Server | `CORS_ORIGIN` | `http://localhost:3000` |
| Web | `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |

As credenciais do Compose são exclusivamente locais. O PostgreSQL é exposto em `127.0.0.1:5434`, com armazenamento persistente no volume `bookly_bookly_postgres_data`. O Nest valida o ambiente ao iniciar e rejeita configurações inválidas. `CORS_ORIGIN` aceita uma única origem, sem barra final ou caminho.

Variáveis `NEXT_PUBLIC_*` são incorporadas no build: reinicie o desenvolvimento ou refaça o build depois de alterá-las.

## Verificações

```bash
# Frontend
npm --prefix apps/web run lint
npm --prefix apps/web run typecheck
npm --prefix apps/web test
npm --prefix apps/web run build

# Backend
npm --prefix apps/server run prisma:validate
npm --prefix apps/server run prisma:generate
npm --prefix apps/server run prisma:status
npm --prefix apps/server run typecheck
npm --prefix apps/server run lint
npm --prefix apps/server test
npm --prefix apps/server run test:e2e
npm --prefix apps/server run build

# Integração
docker compose ps
curl --fail http://localhost:3001/api/health
```

Os testes unitários não consultam o banco. Os testes e2e precisam do PostgreSQL e da configuração em `apps/server/.env`; fazem consultas, sem criar tabelas ou gravar dados. A rota usada para testar o ValidationPipe existe somente no módulo de testes.

O healthcheck executa `SELECT 1` via Prisma e responde HTTP 200:

```json
{"status":"ok","service":"bookly-api","database":"connected"}
```

Se a consulta falhar, responde HTTP 503 com `status: "error"` e `database: "disconnected"`, sem detalhes de conexão. Os limites de conexão e consulta do adaptador são de 5 segundos. O encerramento do Nest desconecta o Prisma e seu pool.

## Build e execução local de produção

```bash
npm --prefix apps/server run build
npm --prefix apps/web run build

# Cada serviço em um terminal
npm --prefix apps/server run start:prod
npm --prefix apps/web run start
```

## Migrações e dados

Nesta etapa, o schema não possui modelos e não há migrações a aplicar. Não foi criada uma migração artificial. Quando houver alterações reais de schema, crie e revise uma migração de desenvolvimento; aplique migrações revisadas com `npm --prefix apps/server run prisma:deploy`.

Para interromper somente o banco, use `docker compose stop postgres`. Preserve o volume existente: não utilize resets nem comandos que removam volumes.

O [relatório da etapa 00](docs/etapa-00-auditoria.md) registra os problemas encontrados, os arquivos alterados, as verificações executadas e os alertas de dependências pendentes.

O [relatório da etapa 01](docs/etapa-01-interface.md) descreve as páginas, os componentes, os tokens visuais, as interações e a validação do frontend. Os módulos de negócio, autenticação e persistência continuam reservados às próximas etapas.
