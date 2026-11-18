# Etapa 02 — Autenticação e sessões

Implementação concluída em **17/11/2026**, no fuso America/Porto_Velho. O escopo compreende cadastro, login, consulta da sessão, logout e proteção do dashboard. Serviços, reservas e perfil comercial não foram implementados.

## Arquitetura

O backend mantém NestJS 12, ESM/NodeNext, Prisma 7, `@prisma/adapter-pg`, PostgreSQL 17, Argon2 e Vitest. O módulo `src/modules/auth` contém controller, serviço, DTOs, guards, gerenciamento do cookie e testes.

Foi conferida a implementação local do TaskFlow: o Bookly segue a mesma estratégia de token opaco aleatório no cookie, hash SHA-256 no banco e senha Argon2id. Não utiliza JWT, localStorage, sessionStorage ou autenticação externa.

No Next.js, o `proxy.ts` faz somente o redirecionamento preliminar quando o cookie está ausente ou malformado. O layout e cada página protegida chamam `requireUser()`, que consulta `/api/auth/me` no servidor. A API continua sendo a autoridade final da sessão. A mera presença de um cookie não concede acesso.

`getCurrentUser()` deduplica a leitura somente dentro da renderização/requisição usando React.cache. A consulta HTTP usa `cache: "no-store"`. O Next encaminha exclusivamente o cookie `bookly_session`, nunca todos os cookies recebidos ou cabeçalhos arbitrários do navegador. As rotas de autenticação e dashboard têm `Cache-Control: private, no-store`.

O destino de retorno é restrito a `/dashboard` e seus caminhos internos. URLs externas, caminhos com barras invertidas, controles e caminhos normalizados fora do dashboard são rejeitados. O proxy sobrescreve o cabeçalho interno que informa o destino solicitado.

## Endpoints

| Método e rota | Resultado |
| --- | --- |
| `POST /api/auth/register` | HTTP 201, usuário público e cookie de sessão |
| `POST /api/auth/login` | HTTP 200, usuário público e novo cookie |
| `GET /api/auth/me` | HTTP 200 com id, nome e e-mail; HTTP 401 sem sessão válida |
| `POST /api/auth/logout` | HTTP 204; revoga a sessão atual e limpa o cookie |
| `GET /api/health` | Preservado, com consulta real ao PostgreSQL |

Os POSTs de autenticação exigem `Origin` exatamente igual a `CORS_ORIGIN`, `Content-Type: application/json` e não aceitam `Sec-Fetch-Site: cross-site`. A API rejeita também origem ausente ou `null`. O frontend envia cookies com `credentials: "include"`; o CORS está restrito à origem configurada e permite credenciais.

O usuário público contém somente `id`, `name` e `email`. Senha, hash de senha, token de sessão e hash do token nunca são retornados em JSON.

Os erros de autenticação seguem `{ statusCode, code, message }`, com `details` para validação. Códigos previstos: `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `EMAIL_IN_USE`, `RATE_LIMITED` e `SERVICE_UNAVAILABLE`. Falhas internas são substituídas por mensagens genéricas, sem dados de conexão. O filtro é do módulo de autenticação, preservando o contrato original do healthcheck.

## Senhas, validação e sessões

- Nome: string de 2 a 100 caracteres, com espaços normalizados.
- E-mail: validação de formato, limite de 254 caracteres, trim e lowercase.
- Cadastro: senha de 15 a 128 caracteres, sem exigir combinações arbitrárias de símbolos; senhas compostas apenas por espaços são rejeitadas.
- Confirmação de senha: validada no frontend; não é enviada nem armazenada.
- Propriedades extras são rejeitadas pelo ValidationPipe existente.
- Senhas usam Argon2id com memória de 19 MiB, duas iterações, paralelismo 1 e salt aleatório da biblioteca. São os parâmetros mínimos indicados pela [OWASP para Argon2id](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- Para conta inexistente, o login ainda verifica um hash fictício. Senha incorreta e conta desconhecida recebem a mesma mensagem.
- O token usa `crypto.randomBytes(32)`, codificado em base64url: 256 bits aleatórios. Apenas seu SHA-256 é armazenado.
- A expiração é absoluta de sete dias; requisições autenticadas validam expiração e revogação no banco.
- Cadastro de usuário e sessão ocorre em transação. Login/cadastro geram token novo e revogam o token anterior enviado pelo mesmo navegador.
- Logout registra `revokedAt`. Repetir logout ou apresentar uma sessão expirada não causa falha nem permite reutilizar o token antigo.
- Não há gravação de senhas ou tokens em logs da aplicação.

O cookie usa `httpOnly: true`, `sameSite: "lax"`, `path: "/"`, sem Domain e duração de sete dias. `Secure` é verdadeiro quando a origem usa HTTPS. `NODE_ENV=production` exige uma origem HTTPS; o modo sem Secure fica restrito ao HTTP local de desenvolvimento/teste. As [recomendações de sessão da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) foram consideradas na definição dos atributos e do token opaco.

## Tentativas excessivas e CSRF

Foi utilizado o [rate limiter oficial do NestJS](https://docs.nestjs.com/security/rate-limiting), sem implementar um contador próprio:

- Limite por IP: 20 tentativas por minuto em cada endpoint de cadastro/login.
- Limite adicional por conta normalizada: 10 tentativas em 15 minutos, independentemente do IP.
- As chaves são hashes; e-mails não ficam em texto nas chaves do armazenamento.
- O IP vem da conexão; cabeçalhos X-Forwarded-For arbitrários não são confiados.
- As respostas de limite usam HTTP 429 e mensagem genérica.

A validação estrita de Origin, o conteúdo JSON e os cookies SameSite protegem as operações de alteração de estado, incluindo login e cadastro. Essa decisão segue a orientação de conferir a origem descrita na [referência de CSRF da OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Não há logout por GET.

## Banco e migração

O schema anterior não continha `User` ou `Session`; o banco tinha apenas a tabela de controle de migrações, sem migrações pendentes. Foi criada e aplicada a migração versionada:

`apps/server/prisma/migrations/20261117210000_create_authentication/migration.sql`

| Modelo | Campos e restrições |
| --- | --- |
| `User` | UUID, nome, e-mail único normalizado, passwordHash, createdAt |
| `Session` | UUID, userId, tokenHash único, createdAt, expiresAt e revokedAt opcional |

`Session.userId` referencia `User.id`; há índices em userId e expiresAt. UUIDs são gerados pelo Prisma. Timestamps usam fuso horário no PostgreSQL. O registro separado da sessão permite futuras expansões de gerenciamento de dispositivos, sem armazenar metadados desnecessários agora.

A migração apenas cria tabelas, índices e relacionamento. Não executa drops, resets ou recriação de banco. O volume original do PostgreSQL e os dados anteriores foram preservados. O Prisma Client foi regenerado e o status das migrações confirmou o banco atualizado.

## Frontend

Foram criadas `/register` e `/login`, com a mesma identidade índigo, fontes e componentes da etapa 01. Os formulários têm validação, mensagens acessíveis, confirmação, mostrar/ocultar senha, carregamento, prevenção síncrona contra envio duplicado e retorno seguro ao destino solicitado.

O HTML dos formulários também usa `method="post"`, evitando envio de senha em query string caso a interação ocorra antes da hidratação. O menu da conta é controlado pelo React, apresenta os dados reais da sessão e permite logout com feedback de falha. O logout bem-sucedido troca a rota e atualiza a árvore do Next.js.

A página inicial agora direciona para cadastro/login. Sidebar, calendário, estados vazios e responsividade foram preservados. Configurações exibe somente o nome e o e-mail reais da conta; o perfil comercial completo continua pendente.

O cliente HTTP compartilhado centraliza URL do ambiente, cookies, JSON, timeout, cancelamento e tratamento de HTTP 400/401/403/409/429/5xx. O indicador de healthcheck reutiliza o cliente e mantém seu comportamento anterior.

O CSS de autenticação é carregado diretamente no layout raiz, separado dos estilos anteriores, preservando o loader Tailwind/Turbopack existente.

## Dependências

| Aplicação | Dependência | Justificativa |
| --- | --- | --- |
| Backend | `@nestjs/throttler` 6.8.0 | Limites por IP e por conta; compatível com Nest 12 |
| Frontend, desenvolvimento | `vitest` 4.1.12 | Mesma versão do backend, para os novos testes |
| Frontend, desenvolvimento | `@testing-library/react` 16.3.3 | Testes de renderização, formulários e interações |
| Frontend, desenvolvimento | `jsdom` 31.0.1 | DOM para testes do React no Node |

Argon2, cookie-parser, class-validator e class-transformer já estavam instalados. Nenhuma biblioteca foi substituída. O frontend mantém os testes nativos anteriores; `npm test` executa a suíte anterior e a nova suíte Vitest configurada em `vitest.config.mts`.

O ambiente validado usa Node.js 24.22.2 e NPM 11.19.1. O jsdom 31 requer Node 24.15 ou superior dentro da série 24; `nvm use` deve selecionar uma versão compatível.

## Arquivos

- Backend: schema Prisma, migração SQL e migration_lock.toml; `src/modules/auth/` com controller, serviço, tipos, password service, cookies, DTOs, três guards, filtro e testes; `test/auth.e2e-spec.ts`.
- Infraestrutura compartilhada: `src/app.module.ts`, `src/setup-app.ts`, `src/config/environment.ts` e `.env.example` do backend para registrar o módulo, habilitar cookies/CORS com credenciais e validar o modo HTTPS.
- Frontend: `/login`, `/register`, erros de acesso, proteção do layout e das seis páginas do dashboard; `src/proxy.ts`, `src/lib/auth-server.ts`, `auth-validation.ts`, `api-client.ts` e `src/types/auth.ts`.
- Componentes: `password-field.tsx`, `features/auth/auth-form.tsx`, `auth-screen.tsx` e `account-menu.tsx`; integração no `dashboard-shell.tsx` e CSS `styles/auth.css` importado no layout raiz.
- Integração: CTA da página inicial, dados de conta em configurações e `use-api-health.ts`.
- Testes frontend: `vitest.config.mts`, stub exclusivo de testes para server-only, testes de formulários, servidor/proxy e cliente HTTP.
- Manifests e lockfiles das duas aplicações receberam somente as dependências necessárias; README principal e READMEs dos aplicativos foram atualizados.
- Compose, configurações TypeScript, configuração existente do Vitest backend e testes anteriores foram preservados.

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| Prisma validate | Schema válido |
| Prisma generate | Client regenerado |
| Prisma migrate deploy/status | Migração aplicada; banco atualizado |
| Backend TypeScript | Aprovado |
| Backend lint | Oxlint com tipos aprovado; é o linter já existente no projeto |
| Backend build | Aprovado, ESM/NodeNext preservado |
| Backend Vitest unitário | 35 testes aprovados, incluindo os 17 anteriores |
| Backend HTTP/e2e | 32 testes aprovados, incluindo os 8 anteriores |
| Frontend ESLint e TypeScript | Aprovados |
| Frontend testes anteriores | 7 testes aprovados |
| Frontend Vitest autenticação | 37 testes aprovados |
| Frontend build de produção | Aprovado, com conteúdo privado renderizado dinamicamente no servidor |
| Healthcheck real | HTTP 200, API e PostgreSQL conectados |

O backend utiliza Oxlint desde a geração do projeto; ESLint não está instalado nele. Foi executado o comando de lint existente, sem instalar um segundo linter. O frontend utiliza ESLint.

Os testes cobrem cadastro válido e concorrente, índice único, normalização, validação de entradas, hashing Argon2id, criação e rotação de sessão, login correto/incorreto, conta inexistente, sessão ausente/malformada/desconhecida/expirada/revogada, logout idempotente e expirado, replay, isolamento de contas, CSRF e limites por IP/conta. No frontend, verificam formulários, confirmação, visibilidade de senha, envio duplicado, erros e carregamento, redirecionamento seguro, SSR sem sessão, encaminhamento de cookie, ausência de cache entre contas e logout.

O aviso não bloqueante `MODULE_TYPELESS_PACKAGE_JSON` da suíte nativa anterior permanece documentado na etapa 01; os testes novos usam configuração ESM explícita. Os avisos anteriores do NPM sobre scripts de instalação continuam sem mudança automática da política allowScripts.

## Fluxo real no navegador

O Chrome headless validou o fluxo completo com contas sintéticas em desktop **1440 × 1000** e mobile **390 × 844**:

1. Acesso anônimo ao calendário redireciona para login preservando o destino.
2. Cadastro com validação, confirmação e alternância de visibilidade de senha.
3. Consulta ao PostgreSQL confirma o usuário, Argon2id e hash do token.
4. Cookie HTTP-only, SameSite=Lax e ausência do token em document.cookie/localStorage/sessionStorage confirmados.
5. Dashboard acessível e sessão preservada após atualizar a página.
6. Todas as seis páginas internas funcionam com o nome real da conta, sem overflow horizontal.
7. Usuário autenticado que abre cadastro retorna ao painel.
8. Logout revoga no banco e limpa o cookie; o token anterior recebe HTTP 401.
9. Acesso direto posterior ao dashboard retorna ao login.
10. Login incorreto mostra mensagem; o login correto restaura o acesso.
11. Um cookie aleatório forjado não autoriza o SSR nem exibe dados privados.

Nenhum erro de JavaScript ou hidratação foi observado na execução final. As contas sintéticas foram removidas exclusivamente pelos seus identificadores de teste; nenhum registro anterior foi removido. Senhas e tokens não foram registrados no relatório.

## Testar localmente

Na raiz:

```bash
nvm use
cp -n apps/server/.env.example apps/server/.env
cp -n apps/web/.env.example apps/web/.env.local
npm --prefix apps/server ci
npm --prefix apps/web ci
docker compose up -d --wait postgres
npm --prefix apps/server run prisma:deploy
npm --prefix apps/server run prisma:status
```

Configure os arquivos de ambiente pelos exemplos existentes. Em desenvolvimento local:

```dotenv
# apps/server/.env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000
# DATABASE_URL conforme o compose e o exemplo do backend

# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Inicie API e frontend em terminais separados:

```bash
npm --prefix apps/server run start:dev
npm --prefix apps/web run dev
```

Abra <http://localhost:3000/register>, crie uma conta de teste, atualize a página, use **Sair da conta** no header e entre novamente em <http://localhost:3000/login>. Nenhuma credencial inicial ou usuário de demonstração é fornecido.

Os testes e2e precisam do banco migrado. Criam dados sintéticos com identificadores aleatórios e limpam somente seus próprios registros. Nunca devem ser executados contra um banco de produção.

## Limitações e próximos passos

- O rate limiter usa memória por processo: reinício limpa os contadores. Antes de executar várias instâncias, configure um armazenamento compartilhado e a política de proxies confiáveis da implantação.
- Cookies host-only precisam chegar também ao servidor Next.js. Em produção, use o mesmo hostname para frontend e API, normalmente expondo o Nest em `/api` por proxy reverso, com HTTPS. Subdomínios distintos sem essa arquitetura não são suportados pela configuração atual.
- HTTPS/Secure de produção foi verificado por testes de política/configuração; não houve implantação HTTPS real nesta etapa.
- Sessões expiradas e revogadas ficam no banco, sendo rejeitadas em toda validação. A limpeza periódica e a tela de gerenciamento de dispositivos ficam para uma evolução futura.
- Recuperação/verificação de e-mail, autenticação social e MFA não foram implementados, conforme o escopo. Não há links que simulem esses fluxos.
- Perfil comercial, serviços, disponibilidade e reservas continuam reservados às próximas etapas.

Nenhum reset, remoção de volume, recriação de banco, commit ou push foi executado.
