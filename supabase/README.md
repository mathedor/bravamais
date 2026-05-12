# Supabase — BRAVA+

## Projeto

- URL: https://iwmlyiyyhjrllndcjfnm.supabase.co
- Project ref: `iwmlyiyyhjrllndcjfnm`

## Aplicar schema inicial

A primeira migração não roda via CLI (precisaria de access token + db password). Para o setup inicial:

1. Abrir o **SQL Editor** no Supabase Studio: https://supabase.com/dashboard/project/iwmlyiyyhjrllndcjfnm/sql/new
2. Copiar todo o conteúdo de [migrations/20260512000001_initial_schema.sql](migrations/20260512000001_initial_schema.sql)
3. Colar no editor e clicar em **Run**
4. Confirmar no menu **Table Editor** que as 21 tabelas foram criadas

Esse script é idempotente (`if not exists` em tudo + `drop policy if exists` antes do create), então pode rodar de novo sem quebrar.

## Tabelas (21)

- **Identidade**: `profiles` (com role: subscriber/establishment/commercial/admin)
- **Catálogo**: `categories`, `establishments`, `establishment_categories`, `establishment_promotions`, `products`
- **Promoções**: `coupons`, `coupon_redemptions`, `gift_cards`, `loyalty_clubs`, `loyalty_progress`
- **Compras**: `orders`, `order_items`
- **Fidelidade**: `qr_cards`, `visits`
- **Assinatura**: `subscription_plans` (Básico/Premium/VIP) + `subscriptions`
- **Chat**: `conversations`, `messages`
- **Engajamento**: `notifications`, `access_logs`

## Triggers automáticos

- Ao criar um usuário em `auth.users`, dispara `handle_new_user()`:
  - cria `profiles` (role=subscriber por padrão)
  - emite um `qr_cards` único com código aleatório
  - cria `subscriptions` em trial de 7 dias no plano Básico

## RLS

Tudo com RLS ativo. Padrões:
- Usuário vê/edita só o que é seu
- Estabelecimento (`owner_id`) vê/edita os dados da sua loja, cupons, pedidos, visitas etc.
- Admin (`profiles.role = 'admin'`) vê tudo
- Catálogo público (`categories`, `establishments` ativos, `products` ativos) é legível pra todos

## Próximas migrações

A partir da segunda alteração, vamos usar Supabase CLI (`pnpm dlx supabase migration new <nome>` → escrever SQL → `supabase db push`). Pra isso precisamos primeiro:
1. Logar: `pnpm dlx supabase login`
2. Linkar: `pnpm dlx supabase link --project-ref iwmlyiyyhjrllndcjfnm`
