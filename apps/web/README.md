# Bookly Web

Frontend Next.js 16 com App Router, React, TypeScript, Tailwind CSS e Lucide React. A etapa 01 implementa a apresentação do produto e a interface do dashboard, sem autenticação, CRUD ou persistência de dados.

Consulte o [README principal](../../README.md) para preparar a infraestrutura. O arquivo `.env.local` mantém:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Desenvolvimento

```bash
npm ci
npm run dev
```

Abra <http://localhost:3000> e use **Explorar demonstração**. A API e o PostgreSQL são necessários para o indicador de conexão ficar online; todas as páginas e a navegação continuam disponíveis quando a API está inacessível.

## Rotas

| Rota | Interface |
| --- | --- |
| `/` | Apresentação breve do Bookly e acesso à demonstração |
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

Os sete testes do frontend cobrem limites de meses e anos, ano bissexto, grade de calendário, semana, fusos/horário de verão e rejeição de respostas incompletas do healthcheck. Eles não dependem do backend ou de bibliotecas extras. O runner usa um único processo; a variável de fuso é restaurada após o teste. O Node pode emitir `MODULE_TYPELESS_PACKAGE_JSON` ao detectar o ESM dos utilitários TypeScript fora do Next.js; esse aviso não é erro e o sistema de módulos do projeto foi preservado.

O build não consulta a API. A chamada é feita no navegador após carregar a página. Refaça o build quando mudar `NEXT_PUBLIC_API_URL`.

O loader `@tailwindcss/turbopack`, os tsconfigs, o ambiente e os lockfiles da infraestrutura foram preservados. A documentação completa e os resultados da validação estão no [relatório da etapa 01](../../docs/etapa-01-interface.md).
