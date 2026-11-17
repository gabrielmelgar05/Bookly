# Etapa 01 — Design system, dashboard e navegação

Implementação realizada em **17/11/2026**, no fuso America/Porto_Velho. Escopo: interface e navegação do frontend, com a infraestrutura da etapa 00 preservada.

## Páginas entregues

| Rota | Conteúdo e comportamento |
| --- | --- |
| `/` | Apresentação breve, branding, proposta do produto, calendário ilustrando a interface real e CTA para `/dashboard` |
| `/dashboard` | Boas-vindas neutras, três indicadores sem dados, próximos agendamentos vazios, calendário compacto e links de primeiros passos |
| `/dashboard/calendar` | Visões de mês, semana e dia; navegação entre períodos, seleção de datas, botão Hoje e agenda diária vazia |
| `/dashboard/bookings` | Estrutura de listagem, busca e filtros desabilitados, estado vazio e ação futura de novo agendamento |
| `/dashboard/services` | Catálogo vazio, campos previstos de um serviço e ação futura de cadastro |
| `/dashboard/availability` | Sete dias da semana sem configuração e explicação da futura definição de horários |
| `/dashboard/settings` | Seções de profissional, conta, preferências e fuso; nenhuma informação de usuário inventada |

O indicador da API continua disponível no header interno e no rodapé da página inicial. As telas funcionam independentemente da disponibilidade do backend.

## Design e componentes

- Fundo cinza muito claro, superfícies brancas, bordas suaves e destaque azul-índigo.
- Tokens CSS de cor, espaçamento, tipografia e raios integrados ao Tailwind. Fontes do sistema, sem downloads no build.
- Logo com ícone Lucide e nome Bookly; favicon SVG correspondente, substituindo o favicon inicial do Next.js.
- Tipografia hierarquizada, animações curtas e discretas e alternativa com movimento reduzido.
- Sidebar fixa em desktop e drawer com `dialog` nativo em tablet/celular.
- Header com página atual, healthcheck e espaço neutro para uma futura área da conta.
- Estados vazios explícitos. Métricas indisponíveis usam travessões, sem valores ou tendências fictícias.
- Ações futuras identificadas como “Em breve” ou desabilitadas; os links habilitados abrem páginas reais.

Componentes efetivamente utilizados:

| Área | Componentes |
| --- | --- |
| Layout | `DashboardShell`, `Sidebar` |
| UI | `Button`, `ButtonLink`, `Badge`, `Card`, `CardHeader` |
| Compartilhados | `Brand`, `ApiStatus`, `PageHeading`, `EmptyState`, `ResourceList` |
| Calendário | `CalendarPicker`, `AgendaOverview`, `CalendarWorkspace` |
| Visão geral | `StatCard`, `TodayLabel` |
| Configurações | `TimezoneCard` |

## Arquitetura e interações

As páginas e os componentes estáticos permanecem Server Components. O shell com rota ativa, o calendário, a leitura do ambiente do navegador e o healthcheck usam Client Components. Os componentes interativos são isolados por responsabilidade; não houve alteração dos tsconfigs nem das opções do Next.js.

A navegação usa Next.js Link, com `aria-current="page"` na rota ativa. O menu mobile contém o foco, aceita Tab/Shift+Tab, restaura o foco após Escape, fecha por botão, backdrop ou navegação e libera a rolagem ao encerrar. A sincronização também trata reaberturas rápidas e a transição para o layout desktop. Há link para pular ao conteúdo e foco visível nos controles.

O calendário usa datas civis no formato `YYYY-MM-DD` e operações em UTC para evitar desvios por horário de verão. A data atual segue o fuso do navegador; ela é lida com `useSyncExternalStore`, mantendo o HTML inicial estável durante a hidratação. O calendário não consulta reservas nem calcula disponibilidade. A visão mensal aceita setas e Page Up/Page Down, com foco mantido na data selecionada.

O healthcheck foi extraído da antiga página inicial para `useApiHealth` e `ApiStatus`. Foram preservados a variável `NEXT_PUBLIC_API_URL`, a consulta real a `/api/health`, a validação do JSON, o cancelamento ao desmontar e o timeout de 10 segundos. O indicador tem carregamento, falha discreta e botão para consultar novamente. Um HTTP 200 com banco desconectado continua sendo rejeitado.

## Arquivos criados ou modificados

- `README.md`: descrição da etapa atual, navegação, healthcheck e comandos de testes.
- `apps/web/README.md`: rotas, estrutura, execução e testes do frontend.
- `docs/etapa-01-interface.md`: este relatório.
- `apps/web/package.json`: script `test` com o runner nativo do Node.js, sem dependências novas.
- `apps/web/src/app/`: `page.tsx`, `layout.tsx`, `globals.css`, `icon.svg` e as sete entradas de layout/páginas em `dashboard/`.
- `apps/web/src/app/favicon.ico`: removido ao substituir o favicon padrão pela identidade Bookly.
- `apps/web/src/components/layout/`: `dashboard-shell.tsx`, `sidebar.tsx`.
- `apps/web/src/components/ui/`: `button.tsx`, `badge.tsx`, `card.tsx`.
- `apps/web/src/components/shared/`: `brand.tsx`, `api-status.tsx`, `page-heading.tsx`, `empty-state.tsx`, `resource-list.tsx`.
- `apps/web/src/features/calendar/`: `calendar-picker.tsx`, `agenda-overview.tsx`, `calendar-workspace.tsx`, `use-calendar.ts`.
- `apps/web/src/features/dashboard/`: `stat-card.tsx`, `today-label.tsx`.
- `apps/web/src/features/settings/`: `timezone-card.tsx`.
- `apps/web/src/hooks/`: `use-api-health.ts`, `use-today.ts`.
- `apps/web/src/lib/`: `calendar.ts`, `navigation.ts`, `utils.ts`.
- `apps/web/src/types/health.ts`: estado da conexão e validação da resposta.
- `apps/web/src/styles/`: `ui.css`, `layout.css`, `dashboard.css`, `calendar.css`, `resources.css`, `landing.css`.
- `apps/web/test/`: `calendar.test.mjs`, `health.test.mjs`.

Os estilos foram separados por área; o arquivo global concentra tokens, base, animações e ajustes responsivos. Não há dependência de imagens externas ou serviços de fontes.

## Validação

| Verificação | Resultado |
| --- | --- |
| Frontend ESLint | Aprovado |
| Frontend `next typegen` e TypeScript | Aprovado |
| Frontend build de produção | Aprovado; sete páginas e favicon gerados, sem consulta ao backend durante o build |
| Frontend testes nativos do Node.js | 7 testes aprovados |
| Backend Vitest existente | 17 testes unitários e 8 testes HTTP aprovados, sem modificar os testes |
| Rotas em navegador | As sete páginas retornaram HTTP 200 em 320, 390, 768 e 1440 px |
| Responsividade | Nenhum scroll horizontal involuntário nas larguras verificadas |
| Navegação | CTA funcional, links sem recarga do documento e rota ativa correta |
| Ações futuras | Criação de reservas/serviços, horários e salvamento permanecem desabilitados |
| Menu mobile | Foco contido, Tab/Shift+Tab, Escape, backdrop, link, restauração de foco e mudança de breakpoint aprovados |
| Calendário | Mês/semana/dia, períodos, seleção, Hoje e teclado aprovados |
| Healthcheck no navegador | Carregamento, HTTP 503, resposta inválida, consulta novamente, recuperação com API real e timeout de 10 segundos aprovados |
| JavaScript e hidratação | Nenhum erro nas sete rotas durante a validação completa |

Os sete testes do frontend cobrem mudança de mês/ano, limites de dia ao trocar o mês, ano bissexto, grade contínua iniciada na segunda-feira, semana entre anos, fusos/horário de verão e resposta de saúde sem falso sucesso. Não exigem banco ou bibliotecas extras.

O Node pode emitir o aviso `MODULE_TYPELESS_PACKAGE_JSON` ao importar os utilitários TypeScript nos testes fora do Next.js. O ESM é detectado corretamente e os sete testes passam; o sistema de módulos do Next.js não foi alterado para suprimir esse aviso.

A validação visual usou o Chrome headless e os serviços de desenvolvimento que o usuário já mantinha em execução. Capturas locais e scripts temporários de inspeção ficaram em `.cache/`, ignorado pelo Git. Os processos de frontend e backend do usuário foram preservados.

## Pendências das próximas etapas

- Autenticação e menu real da conta.
- Cadastro e edição de informações do profissional e serviços.
- Regras e persistência de disponibilidade e fuso horário.
- Criação, consulta e gerenciamento de reservas reais.
- Busca, filtros, métricas e notificações conectados aos futuros endpoints.

Essas ações não foram simuladas. Nenhum CRUD, motor de reservas ou persistência foi implementado. Não houve instalação de bibliotecas, alteração do backend, banco, migrações, Compose, arquivos de ambiente, lockfiles ou configuração do Vitest. Nenhum commit ou push foi realizado.

Para iniciar o frontend, execute `npm --prefix apps/web run dev` a partir da raiz e abra <http://localhost:3000>. Consulte o [README principal](../README.md) para iniciar API e PostgreSQL.
