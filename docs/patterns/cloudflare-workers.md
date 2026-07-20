# Cloudflare Workers patterns para Cinnamon Drinks

> Quando trabalhar com Cloudflare Workers neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: Wrangler 3.x · workerd runtime

## Princípios

- O Worker deste projeto é **pequeno e único**: OAuth proxy GitHub para Sveltia/Decap CMS, em `cms-oauth/`.
- **Secrets via `wrangler secret put`** — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. **Nunca** hardcoded em `wrangler.toml`, **nunca** em commit.
- `wrangler.toml` versionado tem só **nome do worker, compat date, rota**. IDs sensíveis (`account_id`) ficam de fora — Wrangler lê de `~/.wrangler` ou env.
- Worker **não armazena tokens server-side**: ele só faz a troca `code → access_token` e devolve via `postMessage` para a janela do CMS.
- 3 endpoints só: `GET /auth` (redirect GitHub), `GET /callback` (troca code), erro 404 no resto.
- `.dev.vars` para dev local — **gitignored**, nunca committado.

## ✅ Bom

```toml
# cms-oauth/wrangler.toml — mínimo viável, sem secrets
name = "cinnamon-cms-oauth"
main = "src/index.ts"
compatibility_date = "2026-05-01"

# rota custom no domínio Cloudflare (workers.dev é o default em dev)
# routes = [{ pattern = "cms-oauth.cinnamondrinks.com.br/*", zone_name = "cinnamondrinks.com.br" }]

[vars]
# Vars públicas só. NUNCA tokens.
SCOPES = "repo,user"
REDIRECT_URI = "https://cinnamondrinks.com.br/admin/"
```
**Por quê:** `[vars]` é texto cleartext que vai pro bundle. Tokens vão em `secret put`. `compatibility_date` trava o runtime — sem isso, breaking change da Cloudflare quebra o worker silenciosamente.

```bash
# Setup secrets (uma vez por ambiente)
cd cms-oauth
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET

# Dev local com .dev.vars (gitignored)
cat > .dev.vars <<'EOF'
GITHUB_CLIENT_ID=Iv1.dev_only_id
GITHUB_CLIENT_SECRET=dev_only_secret_xxxxx
EOF
echo ".dev.vars" >> .gitignore

npx wrangler dev
```
**Por quê:** `secret put` armazena criptografado na Cloudflare; só o worker rodando tem acesso. `.dev.vars` permite dev sem deploy. Diff de `.gitignore` deve sempre incluir esse arquivo.

```ts
// cms-oauth/src/index.ts — handler tipado, env injetado pelo runtime
export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  SCOPES: string;
  REDIRECT_URI: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: env.SCOPES,
        redirect_uri: `${url.origin}/callback`
      });
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('missing code', { status: 400 });

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code
        })
      });
      const data = (await tokenRes.json()) as { access_token?: string; error?: string };

      // Devolve via postMessage para a janela do CMS (padrão Decap/Sveltia)
      const payload = data.access_token
        ? { token: data.access_token, provider: 'github' }
        : { error: data.error ?? 'unknown' };
      const html = `<script>
        window.opener.postMessage('authorization:github:${data.access_token ? 'success' : 'error'}:${JSON.stringify(payload)}', '*');
        window.close();
      </script>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('not found', { status: 404 });
  }
} satisfies ExportedHandler<Env>;
```
**Por quê:** `Env` interface tipada → autocomplete em `env.GITHUB_CLIENT_ID`, erro em compile-time se faltar secret. `satisfies ExportedHandler<Env>` valida formato sem perder tipo. Token não é persistido — devolve e fecha.

```bash
# Deploy
npx wrangler deploy
# verificar logs em produção
npx wrangler tail
```
**Por quê:** `wrangler tail` mostra console.log + erros em tempo real — essencial para debugar OAuth flow sem precisar de Sentry/observability.

## ❌ Ruim

```toml
# wrangler.toml com secrets hardcoded
[vars]
GITHUB_CLIENT_ID = "Iv1.abc123"
GITHUB_CLIENT_SECRET = "ghs_supersecret"  # ← NUNCA
```
**Problema:** `wrangler.toml` é committado. Secret no git history = secret comprometido para sempre (mesmo após rebase). Use `wrangler secret put`.

```ts
// Worker que armazena token em KV ou cookie
await env.TOKENS.put(`user:${userId}`, accessToken);
```
**Problema:** padrão Decap/Sveltia é **stateless**: token vai pro browser via `postMessage`, CMS guarda em localStorage e usa em chamadas REST do GitHub. Worker armazenar token aumenta superfície de ataque sem ganho.

```ts
// fetch sem narrowing do JSON
const data = await tokenRes.json();
const html = `...${data.access_token}...`;
```
**Problema:** `data` é `any` (em strict TS, `unknown`). Se GitHub mudar formato, runtime quebra. Faça cast explícito com type ou Zod parse.

```toml
# Sem compatibility_date
name = "cinnamon-cms-oauth"
main = "src/index.ts"
```
**Problema:** Cloudflare atualiza runtime regularmente. Sem `compatibility_date`, mudanças breaking entram silenciosamente. Sempre fixe a data e atualize conscientemente.

```bash
# Commitar .dev.vars
git add .dev.vars
git commit -m "feat: env vars locais"
```
**Problema:** mesmo "dev" tokens são exposição — se o repo for público, qualquer um consegue spoofar. `.dev.vars` no `.gitignore` desde o primeiro commit, sem exceção.

## Referências

- Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/commands/
- Decap CMS GitHub OAuth: https://decapcms.org/docs/github-backend/
- Cross-ref: `docs/patterns/sveltia-cms.md` (config CMS), `docs/patterns/typescript.md` (`Env` typing)
- Spec: §5 (estrutura `cms-oauth/`) e §7 (fluxo OAuth)
