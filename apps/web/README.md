# Bookly Web

Frontend Next.js 16 com App Router, React, TypeScript, Tailwind CSS e Lucide React. A etapa 01 implementa a interface; a etapa 02 adiciona autenticação por sessão. Os demais módulos de negócio continuam sem CRUD ou persistência.

Consulte o [README principal](../../README.md) para preparar a infraestrutura. O arquivo `.env.local` mantém:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Desenvolvimento

```bash
npm ci
npm run dev
```

Abra <http://localhost:3000> e use **Criar minha conta**, ou acesse `/login`. A API e o PostgreSQL são necessários para o indicador de conexão ficar online; o dashboard exige confirmação da sessão pelo backend. A página inicial permanece pública.

## Rotas

| Rota | Interface |
| --- | --- |
| `/` | Apresentação breve do Bookly e acesso à demonstração |
| `/register` | Cadastro com validação e confirmação de senha |
| `/login` | Login com retorno seguro ao destino solicitado |
| `/dashboard` | Métricas indisponíveis, próximos agendamentos vazios, calendário e primeiros passos |
| `/dashboard/calendar` | Calendário mensal, semanal e diário, com seleção e navegação de datas |
| `/dashboard/bookings` | Estrutura da listagem, busca e filtros futuros, estado vazio |
| `/dashboard/services` | Catálogo vazio e indicação de cadastro futuro |
| `/dashboard/availability` | Sete dias da semana, sem horários configurados |
| `/dashboard/settings` | Informações do profissional, conta, preferências e fuso horário |

## Organização

- `src/app/`: páginas e layouts do App Router. O conteúdo estático permanece em Server Components.
- `src/components/layout/`: shell compartilhado, sidebar, header e navegação mobile.
- `src/components/ui/`: botões, links de ação, badges e cards reutilizados.
- `src/components/shared/`: branding, status da API, títulos, estados vazios e estrutura das listagens.
- `src/features/`: calendário, resumo do dashboard e visualização do fuso do navegador.
- `src/hooks/`: healthcheck, data local e fuso horário, com renderização inicial estável.
- `src/lib/`: operações de datas, navegação e composição de classes.
- `src/types/`: estado e validação da resposta do healthcheck.
- `src/styles/`: estilos separados por componentes e áreas da interface.
- `src/app/globals.css`: tokens, base, animações e ajustes responsivos.
- `test/`: testes do calendário e da resposta de saúde com o runner nativo do Node.js 24.

As cores, raios, tipografia e espaçamentos são definidos por tokens CSS e pelo tema do Tailwind. As fontes usam a pilha do sistema, sem downloads no build. O favicon é um SVG alinhado ao branding.

## Interações e acessibilidade

- Next.js Link e rota ativa com `aria-current`.
- Menu mobile em `dialog` nativo, com fechamento por botão, backdrop, Escape ou navegação; foco contido e restauração da rolagem.
- Link para pular ao conteúdo, estados de foco visíveis e suporte a movimento reduzido.
- Calendário com botões acessíveis, setas de teclado e Page Up/Page Down, além de botões para mudar o período e retornar a Hoje.
- Datas apresentadas em português e calculadas sem desvios nas transições de mês, ano e horário de verão. O dia atual segue o fuso do navegador.
- Indicador de API com timeout, falha genérica, confirmação real do banco e botão para consultar novamente.
- Controles futuros desabilitados; sem métricas numéricas, reservas ou usuários fictícios.

## Verificações

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Os sete testes preservados da etapa 01 cobrem limites de meses e anos, ano bissexto, grade de calendário, semana, fusos/horário de verão e rejeição de respostas incompletas do healthcheck. Eles não dependem do backend ou de bibliotecas extras. O runner usa um único processo; a variável de fuso é restaurada após o teste. O Node pode emitir `MODULE_TYPELESS_PACKAGE_JSON` ao detectar o ESM dos utilitários TypeScript fora do Next.js; esse aviso não é erro e o sistema de módulos do projeto foi preservado.

O build não consulta a API. A chamada é feita no navegador após carregar a página. Refaça o build quando mudar `NEXT_PUBLIC_API_URL`.

O loader `@tailwindcss/turbopack`, os tsconfigs, o ambiente e os lockfiles da infraestrutura foram preservados. A documentação completa e os resultados da validação estão no [relatório da etapa 01](../../docs/etapa-01-interface.md).

## Sessões e testes de autenticação

Todas as páginas `/dashboard/*` consultam a sessão no servidor Next.js. O `proxy.ts` só faz a verificação preliminar do cookie; a confirmação definitiva é feita por `/api/auth/me`. Cookies privados são encaminhados explicitamente e as respostas não usam cache persistente.

O header mostra o nome real da sessão e permite sair da conta. O logout revoga o registro no PostgreSQL, limpa o cookie e renova a navegação do Next.js. Nenhum token é colocado em localStorage ou sessionStorage.

O cliente `src/lib/api-client.ts` trata credenciais, JSON, timeout, erros de rede e HTTP 400/401/403/409/429/5xx. Os formulários usam POST também no HTML, evitando senhas em query strings antes da hidratação.

`npm test` executa os sete testes anteriores e os 37 testes de autenticação com Vitest. A configuração ESM fica em `vitest.config.mts`; Testing Library e jsdom verificam os formulários e os estados de interação. Use `npm run test:auth` para executar apenas a suíte nova.

Em produção, frontend e API devem compartilhar o hostname, normalmente expondo o Nest em `/api` por um proxy reverso. O cookie host-only precisa chegar também ao servidor Next.js. Use HTTPS e mantenha `NEXT_PUBLIC_API_URL` coerente com essa origem.

Consulte [etapa 02](../../docs/etapa-02-autenticacao.md) para as decisões de segurança, o inventário de arquivos e as verificações completas.
