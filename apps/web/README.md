# Bookly Web

Frontend Next.js 16 com App Router, React, TypeScript, Tailwind CSS e Lucide React.

Consulte o [README principal](../../README.md) para a preparação completa. Configure `.env.local` a partir de `.env.example`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Desenvolvimento

```bash
npm ci
npm run dev
```

Abra <http://localhost:3000>. A página temporária consulta o healthcheck da API no navegador, com estados de carregamento, sucesso e falha e timeout de 10 segundos.

## Verificações e produção local

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

O build não depende da API nem de downloads de fontes. A chamada ao backend acontece após a página carregar. Refazer o build é necessário quando `NEXT_PUBLIC_API_URL` mudar.

O loader `@tailwindcss/turbopack` existente foi preservado. Esta configuração usa o Turbopack padrão do Next.js para desenvolvimento e build.

Detalhes e pendências estão no [relatório da auditoria](../../docs/etapa-00-auditoria.md).
