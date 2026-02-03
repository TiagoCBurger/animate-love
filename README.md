# Animalove

Monorepo com Next.js e Supabase.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Deploy na Vercel

Para o Vercel identificar o projeto Next.js no monorepo:

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard) → seu projeto
2. **Settings** → **Build and Deployment** → **Root Directory**
3. Clique em **Edit** e defina: **`next-app`**
4. Salve e faça um novo deploy

O app Next.js está em `next-app/`. O Vercel precisa dessa configuração para rodar o build corretamente.
