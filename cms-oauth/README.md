# cinnamon-cms-oauth

OAuth proxy do GitHub para o Sveltia CMS (`/admin/`). Worker de página única:
recebe o `code` do GitHub, troca por `access_token` no servidor (o
`client_secret` nunca chega ao browser) e devolve o token à janela do CMS.

## Checklist de deploy (manual — precisa das credenciais do Luis)

### 1. Criar o GitHub OAuth App

GitHub → Settings → Developer settings → **OAuth Apps** → New OAuth App:

- **Application name:** `Cinnamon Drinks CMS`
- **Homepage URL:** `https://cinnamondrinks.com.br`
- **Authorization callback URL:** `https://EXEMPLO.workers.dev/callback`
  (placeholder — corrigido no passo 4)

Anote o **Client ID** e gere um **Client Secret**.

### 2. Deploy do Worker

```bash
cd cms-oauth
pnpm install
pnpm run deploy    # = wrangler deploy (pede login na Cloudflare na 1ª vez)
                   # use `run`: `pnpm deploy` colide com um comando nativo do pnpm
```

O deploy imprime a URL pública, algo como
`https://cinnamon-cms-oauth.<seu-subdominio>.workers.dev`. **Anote.**

### 3. Setar os secrets

```bash
pnpm dlx wrangler secret put GITHUB_CLIENT_ID      # cole o Client ID
pnpm dlx wrangler secret put GITHUB_CLIENT_SECRET  # cole o Client Secret
```

(Os secrets ficam criptografados na Cloudflare — não vão para o git.)

### 4. Corrigir a callback URL no GitHub

Volte ao OAuth App e troque a **Authorization callback URL** pela URL real:
`https://cinnamon-cms-oauth.<seu-subdominio>.workers.dev/callback`

### 5. Me passe a URL do Worker

Com a URL em mãos, eu fecho o `base_url` em `public/admin/config.yml`
(hoje está com `PLACEHOLDER`) e faço o commit final da Phase 7.

### 6. Smoke test (após o deploy do site — Phase 12)

Acesse `https://cinnamondrinks.com.br/admin/` → **Sign In with GitHub** →
autorize → o painel abre. Edite um campo e confirme o commit no GitHub.

## Dev local

```bash
cp .dev.vars.example .dev.vars   # preencha com credenciais de teste
pnpm dev                          # = wrangler dev
```

Logs em produção: `pnpm tail` (= `wrangler tail`).
