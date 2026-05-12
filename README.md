# BRAVA+

Clube de vantagens via assinatura. Web + apps mobile.

## Stack

- **Monorepo**: pnpm + Turborepo
- **Web** (`apps/web`): Next.js 15, TypeScript, Tailwind, shadcn/ui
- **Mobile** (`apps/mobile`): Expo / React Native
- **Backend**: Supabase (Postgres + Auth + Realtime + Storage)
- **Pagamentos**: Efí Bank (PIX + cartão recorrente)

## Quickstart

```bash
pnpm install
pnpm dev            # roda todos os apps em paralelo
pnpm --filter @brava/web dev
pnpm --filter @brava/mobile start
```

## Estrutura

```
brava-mais/
├── apps/
│   ├── web/        # Next.js 15
│   └── mobile/     # Expo
├── packages/
│   └── (compartilhados)
├── brand/          # logos, paleta, identidade
└── turbo.json
```

## Identidade visual

Paleta: amarelo `#FBBF24` · azul `#1E3A8A` · preto `#0A0A0A`. Logo em [brand/](brand/).
