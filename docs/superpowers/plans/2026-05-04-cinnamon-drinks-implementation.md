# Cinnamon Drinks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o export Webflow estático da Cinnamon Drinks para Astro 5 + Sveltia CMS, hospedado em Cloudflare Pages, com captação de lead via Formspree + WhatsApp, atingindo Lighthouse ≥ 90 em todas as 4 categorias e custo recorrente R$ 0 para a CONTRATANTE.

**Architecture:** SSG com Astro 5 (Content Collections + Image API). Conteúdo editável via Sveltia CMS (`/admin`), git-based via GitHub OAuth proxy num Cloudflare Worker dedicado. Animações: webflow.js IX2 (legado) preservado nas seções herdadas + Motion (build mini, 2.3kb) na seção nova `#estrutura`. Form com defesa em 3 camadas (honeypot + Turnstile widget + Formspree antispam) e duplo destino (email backup + WhatsApp Comercial com mensagem pré-formatada).

**Tech Stack:** Astro 5.x · pnpm · TypeScript · Zod · Sveltia CMS · Cloudflare Pages · Cloudflare Workers (OAuth) · Cloudflare Turnstile · Formspree · Motion · Sharp (built-in Astro)

**Spec de referência:** `docs/superpowers/specs/2026-05-01-cinnamon-drinks-design.md` (v2, 2026-05-04)

---

## File Structure

Layout final do repo após migração (subset relevante; ver §5 do spec para árvore completa):

| Arquivo | Responsabilidade | Origem |
|---|---|---|
| `astro.config.mjs` | Config do Astro: integrações Sharp, output static | Novo |
| `package.json` | Deps (astro, sharp, motion, zod, @astrojs/check) | Novo |
| `pnpm-lock.yaml` | Lockfile pnpm | Gerado |
| `.npmrc` | `shamefully-hoist=true` se necessário pra compat | Novo |
| `tsconfig.json` | TS strict, paths Astro | Gerado por Astro |
| `src/content.config.ts` | Loaders + schemas Zod das 10 collections | Novo |
| `src/content/*.yml` | Dados (placeholder agora, real via Sveltia) | Novo |
| `src/content/{drinks,bars,testimonials}/*.yml` | Folders com 1 arquivo por entrada | Novo |
| `src/layouts/Base.astro` | <html>, fontes, jQuery local, webflow.js, CSS global | Novo |
| `src/pages/index.astro` | Landing (compõe os 10 componentes) | Novo |
| `src/pages/404.astro` | Página de erro customizada | Novo |
| `src/components/Navbar.astro` | Navbar sticky desktop + drawer mobile | Extraído de `index.html` |
| `src/components/Hero.astro` | Seção 1 — Início | Extraído |
| `src/components/About.astro` | Seção 2 — Sobre | Extraído de `about.html` |
| `src/components/Team.astro` | Seção 3 — Equipe | Extraído |
| `src/components/Menu.astro` | Seção 4 — Menu (tabs + cards) | Extraído de `menus/menu-1.html` |
| `src/components/Bars.astro` | Seção 5 — Estrutura · Bloco A (Bares) | NOVO |
| `src/components/Included.astro` | Seção 6 — Estrutura · Bloco B (Inclusos) | NOVO |
| `src/components/Testimonials.astro` | Seção 7 — Depoimentos | Extraído |
| `src/components/ReserveForm.astro` | Seção 8 — Form de captação | Extraído de `reserve.html` |
| `src/components/Footer.astro` | Footer | Extraído |
| `src/styles/global.css` | Reescrito de `css/cinnamon-drinks.webflow.css` | Migrado |
| `src/styles/new-sections.css` | Estilos da seção Estrutura | Novo |
| `src/scripts/motion.ts` | Animações Motion da seção nova | Novo |
| `public/admin/index.html` | Sveltia CMS shell (carrega CDN unpkg) | Novo |
| `public/admin/config.yml` | Collections + media + backend config | Novo |
| `public/vendor/jquery-3.5.1.min.js` | jQuery local (substitui CDN Webflow) | Baixado |
| `public/webflow.js` | IX2 runtime — copiado de `js/webflow.js` | Movido |
| `public/videos/` | Vídeos comprimidos do hero (≤10MB cada, máx 3) | Comprimido |
| `public/favicon.ico`, `public/robots.txt` | Estáticos | Novo |
| `src/assets/logo/*.png` | 6 logos PNG (substitui `images/logo/`) | Movido |
| `src/assets/{bars,drinks,team,hero}/` | Imagens otimizadas no build | Movido/extraído |
| `_archive/` | HTMLs do export que não vão pro site final | Movido |
| `cms-oauth/` | Repo separado do Cloudflare Worker (OAuth) | Novo (sub-repo) |

---

## Phase 0 — Pre-flight

### Task 0.1: Inicializar git e snapshot do export atual

**Files:**
- Modify: working tree (init git)

- [ ] **Step 1: Verificar que não há `.git` ainda**

```bash
ls -la /Users/luiscarlos/Documents/Dev/cinnamon-drinks.webflow/cinnamon-drinks/.git 2>&1
```
Expected: `No such file or directory`

- [ ] **Step 2: Inicializar git e fazer snapshot do export**

```bash
cd /Users/luiscarlos/Documents/Dev/cinnamon-drinks.webflow/cinnamon-drinks
git init -b main
git add -A
git commit -m "snapshot: webflow export pré-migração Astro

inclui: HTMLs, CSS, JS Webflow, images/logo (6 PNGs Outfit aplicada),
videos do template, brandbook (PDF + IDV transcrita), spec v2."
```

- [ ] **Step 3: Criar branch de trabalho**

```bash
git checkout -b feature/astro-migration
```

- [ ] **Step 4: Verificar estado**

```bash
git log --oneline
git branch
```
Expected: 1 commit em `main`, branch `feature/astro-migration` checked out

### Task 0.2: Verificar versões de Node e pnpm

- [ ] **Step 1: Checar Node**

```bash
node --version
```
Expected: v18.17.1+ ou v20+ (Astro 5 requer Node ≥ 18.17.1)

- [ ] **Step 2: Checar/instalar pnpm**

```bash
pnpm --version || npm install -g pnpm@latest
pnpm --version
```
Expected: 9.x ou superior

- [ ] **Step 3: Configurar pnpm para o projeto**

Criar `.npmrc` na raiz:

```
shamefully-hoist=false
strict-peer-dependencies=false
auto-install-peers=true
```

```bash
git add .npmrc && git commit -m "chore: configure pnpm via .npmrc"
```

---

## Phase 1 — Astro project initialization

### Task 1.1: Inicializar projeto Astro in-place

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/`, `public/`

- [ ] **Step 1: Criar package.json mínimo**

Como o projeto JÁ tem arquivos no root, NÃO podemos rodar `pnpm create astro` direto (ele esperaria diretório vazio). Vamos inicializar manualmente.

Criar `package.json`:

```json
{
  "name": "cinnamon-drinks",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "cms:proxy": "pnpm dlx @sveltia/cms-proxy-server"
  },
  "dependencies": {
    "astro": "^5.0.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.5.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

- [ ] **Step 2: Instalar deps**

```bash
pnpm install
```
Expected: cria `pnpm-lock.yaml` e `node_modules/`. Sem erros.

- [ ] **Step 3: Criar astro.config.mjs**

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://cinnamondrinks.com.br', // confirmado 2026-05-04 (Registro.br)
  build: {
    assets: 'assets-built'
  },
  image: {
    // Sharp é o default no Astro 5
  },
  vite: {
    server: {
      fs: { strict: false }
    }
  }
});
```

- [ ] **Step 4: Criar tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "_archive", "node_modules"]
}
```

- [ ] **Step 5: Criar .gitignore**

```
node_modules/
.astro/
dist/
.DS_Store
.env
.env.local
.env.production
*.log
```

- [ ] **Step 6: Verificar build vazio**

Criar `src/pages/index.astro` mínimo só pra validar:

```astro
---
---
<html><body>placeholder</body></html>
```

```bash
pnpm dev
```
Expected: servidor sobe em `http://localhost:4321/`, página renderiza "placeholder". Ctrl+C pra encerrar.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json .gitignore src/pages/index.astro
git commit -m "feat(astro): initialize project skeleton with pnpm"
```

### Task 1.2: Configurar Biome + simple-git-hooks (lint, format, pre-commit)

**Files:**
- Create: `biome.json`
- Modify: `package.json`

> Spec de referência: §4.6.3. Biome cobre lint+format; simple-git-hooks roda biome em pre-commit via lint-staged.

- [ ] **Step 1: Instalar deps**

```bash
pnpm add -D @biomejs/biome simple-git-hooks lint-staged
```

- [ ] **Step 2: Criar biome.json**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "files": {
    "ignore": [
      "dist",
      "node_modules",
      ".astro",
      "_archive",
      "public/webflow.js",
      "public/vendor",
      "public/admin/index.html"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": { "useImportType": "warn", "useNamingConvention": "off" },
      "suspicious": { "noExplicitAny": "error" },
      "correctness": { "noUnusedVariables": "warn" }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "none"
    }
  }
}
```

- [ ] **Step 3: Atualizar `package.json` com scripts e hooks**

Adicionar/atualizar nos campos correspondentes:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "biome check .",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "ts:check": "astro check",
    "test": "vitest run",
    "cms:proxy": "pnpm dlx @sveltia/cms-proxy-server",
    "prepare": "simple-git-hooks"
  },
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*.{ts,astro,json,css,md}": "biome check --write --no-errors-on-unmatched"
  }
}
```

> O script `check` original (que era `astro check`) foi renomeado para `ts:check` para liberar `check` ao Biome (uso CI dry-run).

- [ ] **Step 4: Ativar git hooks**

```bash
pnpm install
pnpm prepare
```
Expected: `simple-git-hooks` cria/atualiza `.git/hooks/pre-commit`.

- [ ] **Step 5: Smoke test do Biome**

```bash
pnpm check
```
Expected: passa (poucos arquivos no projeto ainda; talvez warnings benignos no `index.astro` placeholder).

```bash
pnpm format
```
Expected: 0 arquivos modificados (já formatados) ou só reindentações benignas.

- [ ] **Step 6: Smoke test do pre-commit**

Criar arquivo de teste com formatação intencionalmente errada:

```bash
echo "const   x   =    1" > /tmp/test-format.ts
git add /tmp/test-format.ts 2>/dev/null || true
```

Não vai funcionar fora do repo. Em vez disso, rodar lint-staged diretamente:

```bash
pnpm lint-staged --concurrent false || true
```
Expected: lint-staged roda; sem mudanças se árvore estiver limpa.

- [ ] **Step 7: Commit**

```bash
git add biome.json package.json pnpm-lock.yaml
git commit -m "feat(tooling): configure Biome + simple-git-hooks pre-commit"
```

### Task 1.3: Gerar `docs/patterns/` via Context7 MCP (9 stacks)

**Files:**
- Create: `docs/patterns/{astro,typescript,sveltia-cms,cloudflare-workers,motion,css,forms,git,seo-a11y}.md`

> Spec §4.6.4 lista os 9 stacks. Cada arquivo segue o template `## Princípios → ## ✅ Bom → ## ❌ Ruim` com exemplos de código curados de Context7 + decisões deste projeto.

- [ ] **Step 1: Criar diretório**

```bash
mkdir -p docs/patterns
```

- [ ] **Step 2: Gerar `docs/patterns/astro.md`**

Comando esperado (no Claude Code com Context7 MCP habilitado):

```
Use Context7 MCP query-docs para "astro 5 content collections", "astro Image component v5", "astro layout slots", "astro hydration directives is:inline client:load".

Sintetize 4 ✅ Bom + 4 ❌ Ruim usando o template em §4.6.4 do spec.

Decisões load-bearing deste projeto a destacar:
- Content Collections com loaders explícitos (file/glob) — não usar formato Astro v3/v4
- getEntry para singletons, getCollection para folders
- <script> dentro de .astro deve ser curto; lógica vai para src/scripts/*.ts
- is:inline para scripts que precisam rodar antes de hidratação (jQuery, webflow.js)
- Image API obriga import; nunca <img src="/src/assets/..."> direto

Output: docs/patterns/astro.md
```

> Esse step se repete 9 vezes — uma por stack. Os comandos abaixo seguem o mesmo padrão; só muda o stack e os keywords.

- [ ] **Step 3: Gerar `docs/patterns/typescript.md`**

Keywords Context7: "typescript strict config", "zod schema patterns", "discriminated unions". 

Decisões deste projeto: TS strict on; sem `any` (regra Biome `noExplicitAny: error`); types de domínio em `src/scripts/types.ts`; Zod schemas em `src/content.config.ts` são source of truth (não duplicar com types manuais — usar `z.infer`).

- [ ] **Step 4: Gerar `docs/patterns/sveltia-cms.md`**

Keywords Context7: "sveltia cms config", "decap cms widgets" (Sveltia herda formato), "git-based cms oauth flow".

Decisões: backend GitHub; `local_backend: true` em dev; mapear cada Sveltia widget para o type Zod correspondente; `media_folder: src/assets/uploads`.

- [ ] **Step 5: Gerar `docs/patterns/cloudflare-workers.md`**

Keywords Context7: "cloudflare workers wrangler", "cf workers oauth proxy", "wrangler secrets".

Decisões: Worker em sub-pasta `cms-oauth/` do mesmo repo; secrets via `wrangler secret put`; nunca commitar IDs/secrets; OAuth flow padrão Decap/Sveltia (3 endpoints: `/auth`, `/callback`, retorno via `postMessage`).

- [ ] **Step 6: Gerar `docs/patterns/motion.md`**

Keywords Context7: "motion mini animate inView", "motion v12 reduced motion".

Decisões: import APENAS de `motion/mini` (2.3kb); sempre checar `prefers-reduced-motion`; `inView` para gatilhos de scroll; nunca importar build completo (`motion`).

- [ ] **Step 7: Gerar `docs/patterns/css.md`**

Sem Context7 (decisões 100% deste projeto):

Decisões: única fonte = Outfit; paleta IDV; branco como default em UI; classes Webflow `w-*` imutáveis; estados com prefixo `is-`; preferir `<style>` interno em `.astro` para CSS específico de componente; CSS variables para cores (`--color-pink`, `--color-orange`, etc.).

- [ ] **Step 8: Gerar `docs/patterns/forms.md`**

Decisões: honeypot em campo invisível; Turnstile como deterrente (não validado server-side); validação HTML5 + reportValidity; máscara client-side com testes; submit redireciona para WhatsApp via util `buildWhatsappUrl`; consentimento LGPD inline.

- [ ] **Step 9: Gerar `docs/patterns/git.md`**

Decisões: Conventional Commits PT-BR (`feat`, `fix`, `chore`, `docs`, `refactor`, `test`); branches com prefixo (`feature/`, `fix/`, `chore/`); proibido `--no-verify`; nunca force-push em `main`; preferir commit pequeno frequente sobre commit grande raro.

- [ ] **Step 10: Gerar `docs/patterns/seo-a11y.md`**

Keywords Context7: "schema.org LocalBusiness", "axe-core CLI", "WCAG AA contrast".

Decisões: meta tags base em `Base.astro`; OG image 1200×630; JSON-LD `LocalBusiness`/`BarOrPub`; alt-text obrigatório nos schemas Zod; contraste mínimo 4.5:1; `:focus-visible` com outline rosa `#F26294`.

- [ ] **Step 11: Verificar resultado**

```bash
ls docs/patterns/
wc -l docs/patterns/*.md
```
Expected: 9 arquivos, cada um entre 80-200 linhas.

- [ ] **Step 12: Commit**

```bash
git add docs/patterns/
git commit -m "docs: generate 9 stack pattern guardrails via Context7

cobre astro, typescript, sveltia-cms, cloudflare-workers, motion, css,
forms, git, seo-a11y. baseado em §4.6.4 do spec — consultados pelo
CLAUDE.md em mudanças futuras."
```

### Task 1.4: Criar `CLAUDE.md` na raiz

**Files:**
- Create: `CLAUDE.md`

> Spec §4.6.4 dá o template completo. Esta task transcreve para o repo.

- [ ] **Step 1: Escrever `CLAUDE.md`**

Conteúdo (copiar do template em §4.6.4 do spec, com substituições do path absoluto e versões reais):

```markdown
# Cinnamon Drinks — Instruções para LLMs

## Antes de qualquer mudança de código

1. Identifique o(s) stack(s) afetado(s) na mudança
2. Leia o(s) arquivo(s) correspondentes em `docs/patterns/`
3. Verifique se existem decisões na spec `docs/superpowers/specs/2026-05-01-cinnamon-drinks-design.md` sobre o componente em questão
4. Se mexer em conteúdo: confirme schema em `src/content.config.ts`

## Stack guardrails (consulta condicional)

| Se mexer em… | Leia |
|---|---|
| `*.astro` | `docs/patterns/astro.md`, `docs/patterns/css.md` |
| `*.ts` em `src/scripts/` | `docs/patterns/typescript.md` |
| `src/content/` ou schemas | `docs/patterns/astro.md` (Content Collections) |
| `public/admin/config.yml` | `docs/patterns/sveltia-cms.md` |
| `cms-oauth/` | `docs/patterns/cloudflare-workers.md` |
| Animações | `docs/patterns/motion.md` |
| Form (`ReserveForm`, `whatsapp.ts`, `reserve-form.ts`) | `docs/patterns/forms.md` |
| CSS / cor / fonte | `docs/patterns/css.md` + `docs/brandbook/IDENTIDADE_VISUAL.md` |
| Estilo de commit | `docs/patterns/git.md` |
| SEO/A11y | `docs/patterns/seo-a11y.md` |

## Decisões load-bearing (não reverter sem explicitar)

- Outfit é a fonte; **NUNCA** Nexa, **NUNCA** Poppins
- Paleta: preto/rosa/laranja/branco. Branco é default em UI; rosa/laranja só em destaques pontuais
- `#000000` em vez de `#00324E` mesmo onde brandbook lista `#00324E`
- Classes Webflow (`w-*`) são imutáveis — webflow.js depende delas
- pnpm é o package manager; `npm`/`yarn` proibidos no projeto
- Biome é o linter+formatter; sem ESLint, sem Prettier
- Conteúdo editável só vive em `src/content/*.yml`, nunca hardcoded em componentes

## Comandos comuns

| Comando | Uso |
|---|---|
| `pnpm dev` | Dev server Astro em :4321 |
| `pnpm cms:proxy` | Proxy Sveltia local (terminal separado quando editar via /admin) |
| `pnpm build` | Build de produção em `dist/` |
| `pnpm preview` | Servir `dist/` para QA local |
| `pnpm check` | Biome lint + format check (CI) |
| `pnpm format` | Biome format --write |
| `pnpm ts:check` | `astro check` (TypeScript) |
| `pnpm test` | Vitest run (suite atual: whatsapp.test.ts) |

## Arquivos críticos a NÃO editar sem cuidado

- `public/webflow.js` — IX2 runtime exportado do Webflow; não otimizado, não formatado, não nosso. Re-exportar ou trocar por equivalente puro só com aprovação Luis.
- `public/vendor/jquery-3.5.1.min.js` — jQuery vendored; webflow.js depende.
- `_archive/` — referência visual; não importar nada daqui em código de produção.
- `docs/brandbook/Brand Book _ Cinnamon Drinks.pdf` — binário; não editar.

## Quando em dúvida

1. Reler a spec inteira (`docs/superpowers/specs/2026-05-01-...md`)
2. Reler o pattern relevante em `docs/patterns/`
3. Conferir o memory do projeto: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/`
4. Perguntar ao Luis antes de adivinhar
```

- [ ] **Step 2: Verificar que Biome não tenta lintar CLAUDE.md como código**

`CLAUDE.md` é Markdown — Biome só formata quebras de linha em `.md`. Aceito.

```bash
pnpm check
```
Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with stack guardrails table and load-bearing decisions"
```

### Task 1.5: Mover HTMLs descartados para `_archive/`

**Files:**
- Move: HTMLs não utilizados → `_archive/`

Conforme spec §7, só `index.html`, `about.html`, `menus/menu-1.html`, `reserve.html` e `404.html` são úteis. O resto vai para arquivo.

- [ ] **Step 1: Criar `_archive/` e mover**

```bash
mkdir -p _archive/menus _archive/template
git mv home-2.html menus-2.html ckhdfshzf.html 401.html detail_items.html detail_menu-categories.html _archive/
git mv menus/menu-2.html menus/menu-3.html menus/menu-4.html _archive/menus/ 2>/dev/null || true
git mv template _archive/template 2>/dev/null || git mv template/* _archive/template/ 2>/dev/null || true
```

- [ ] **Step 2: Verificar**

```bash
ls _archive/
ls
```
Expected: `_archive/` contém os HTMLs descartados; root mantém `index.html`, `about.html`, `reserve.html`, `404.html`, e `menus/menu-1.html`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: archive unused webflow exports into _archive/"
```

---

## Phase 2 — Asset migration

### Task 2.1: Reorganizar pastas em estrutura Astro

**Files:**
- Move: `images/` → `src/assets/`, `videos/` → `public/videos/`, `js/webflow.js` → `public/webflow.js`, `css/*` → `src/styles/`

- [ ] **Step 1: Criar diretórios alvo**

```bash
mkdir -p src/assets/logo src/assets/bars src/assets/drinks src/assets/team src/assets/hero
mkdir -p src/styles src/components src/scripts
mkdir -p public/videos public/vendor
```

- [ ] **Step 2: Mover logos para src/assets/logo/**

```bash
git mv images/logo/*.png src/assets/logo/
```

- [ ] **Step 3: Mover demais imagens (não logo) para public/images/ temporariamente**

Imagens referenciadas no HTML do export (background-images do CSS, srcs em `<img>`) vão pra `public/` para preservar caminhos relativos durante a migração inicial:

```bash
mv images/* public/images/ 2>/dev/null || mkdir -p public/images && mv images/* public/images/
rmdir images || true
```

- [ ] **Step 4: Mover vídeos**

```bash
git mv videos/* public/videos/
rmdir videos
```

- [ ] **Step 5: Mover webflow.js para public/**

```bash
git mv js/webflow.js public/webflow.js
rmdir js
```

- [ ] **Step 6: Mover CSS para src/styles/**

```bash
git mv css/normalize.css src/styles/normalize.css
git mv css/webflow.css src/styles/webflow.css
git mv css/cinnamon-drinks.webflow.css src/styles/global.css
rmdir css
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: reorganize assets into Astro layout (src/assets, public/, src/styles)"
```

### Task 2.2: Baixar jQuery local (substituir CDN Webflow)

**Files:**
- Create: `public/vendor/jquery-3.5.1.min.js`

- [ ] **Step 1: Baixar jQuery 3.5.1 minificado**

```bash
curl -L -o public/vendor/jquery-3.5.1.min.js https://code.jquery.com/jquery-3.5.1.min.js
```

- [ ] **Step 2: Verificar integridade (SRI hash)**

```bash
shasum -a 256 public/vendor/jquery-3.5.1.min.js
```
Expected: hash inicia com `f7f6a5894f...` (jQuery 3.5.1 oficial). Se diferente, abortar e reinvestigar.

- [ ] **Step 3: Commit**

```bash
git add public/vendor/jquery-3.5.1.min.js
git commit -m "feat: vendor jQuery 3.5.1 locally to drop webflow CDN dependency"
```

### Task 2.3: Mover HTMLs herdados para `_archive/` (eles serão extraídos como componentes)

Os HTMLs `index.html`, `about.html`, `reserve.html`, `404.html`, `menus/menu-1.html` são REFERÊNCIA visual durante a extração de componentes. Eles não devem ficar no root do Astro (concorrem com `src/pages/index.astro`).

- [ ] **Step 1: Mover HTMLs de referência para `_archive/reference/`**

```bash
mkdir -p _archive/reference/menus
git mv index.html _archive/reference/index.html
git mv about.html _archive/reference/about.html
git mv reserve.html _archive/reference/reserve.html
git mv 404.html _archive/reference/404.html
git mv menus/menu-1.html _archive/reference/menus/menu-1.html
rmdir menus 2>/dev/null || true
```

- [ ] **Step 2: Mover assets/ do export (se existir e não foi movido)**

```bash
ls assets/ 2>&1 | head -5
```

Se houver conteúdo, mover pra `public/assets-webflow/`:

```bash
[ -d assets ] && mv assets public/assets-webflow
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move webflow reference HTMLs to _archive/reference"
```

---

## Phase 3 — Content collections (schemas + placeholder data)

### Task 3.1: Criar `src/content.config.ts` com schemas Zod

**Files:**
- Create: `src/content.config.ts`

- [ ] **Step 1: Escrever o config**

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const galleryItem = z.object({
  type: z.enum(['image', 'video']),
  src: z.string(),
  alt: z.string()
});

const site = defineCollection({
  loader: file('src/content/site.yml'),
  schema: z.object({
    brandName: z.string(),
    tagline: z.string(),
    address: z.string(),
    businessHours: z.string(),
    whatsappNumber: z.string().regex(/^\d{12,13}$/, 'whatsappNumber deve estar em formato 55XX9XXXXXXXX'),
    email: z.string().email(),
    instagram: z.string()
  })
});

const hero = defineCollection({
  loader: file('src/content/hero.yml'),
  schema: z.object({
    heading: z.string(),
    subheading: z.string(),
    ctaText: z.string().default('Reservar minha data'),
    gallery: z.array(galleryItem).min(1)
  })
});

const about = defineCollection({
  loader: file('src/content/about.yml'),
  schema: z.object({
    heading: z.string(),
    body: z.string(),
    foundedYear: z.number().int().gte(2000).lte(2030),
    mainPhoto: z.string()
  })
});

const team = defineCollection({
  loader: file('src/content/team.yml'),
  schema: z.object({
    heading: z.string(),
    intro: z.string(),
    members: z.array(z.object({
      name: z.string(),
      role: z.string(),
      photo: z.string(),
      certifications: z.array(z.string()).optional()
    }))
  })
});

const drinks = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/drinks' }),
  schema: z.object({
    name: z.string(),
    category: z.enum(["Caip's", 'Clássicos', 'Gin & Whisky', 'Especiais']),
    ingredients: z.array(z.string()).min(1),
    image: z.string().optional(),
    order: z.number().int()
  })
});

const bars = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/bars' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    gallery: z.array(z.object({ src: z.string(), alt: z.string() })).min(1),
    order: z.number().int()
  })
});

const included = defineCollection({
  loader: file('src/content/included.yml'),
  schema: z.object({
    columns: z.array(z.object({
      title: z.string(),
      items: z.array(z.string()).min(1)
    })).length(3)
  })
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/testimonials' }),
  schema: z.object({
    author: z.string(),
    eventType: z.string().optional(),
    quote: z.string(),
    photo: z.string().optional()
  })
});

const form = defineCollection({
  loader: file('src/content/form.yml'),
  schema: z.object({
    heading: z.string().default('Reservar minha data'),
    ctaButton: z.string().default('Reservar minha data'),
    successMessage: z.string(),
    errorMessage: z.string()
  })
});

const pricing = defineCollection({
  loader: file('src/content/pricing.yml'),
  schema: z.object({
    pricePerGuest: z.string(),
    insurancePerGuest: z.string(),
    vodkaUpgrades: z.array(z.object({ name: z.string(), extraPrice: z.string() })),
    bartenderRatio: z.string().default('1 bartender a cada 30 convidados'),
    disclaimer: z.string().default('Bares personalizados a consultar')
  })
});

export const collections = { site, hero, about, team, drinks, bars, included, testimonials, form, pricing };
```

- [ ] **Step 2: Adicionar `@astrojs/check` se ainda não estiver**

```bash
pnpm add -D @astrojs/check
```

- [ ] **Step 3: Verificar que TS aceita o arquivo**

```bash
pnpm check
```
Expected: 0 errors. Se reclamar de imports `astro:content`, rodar `pnpm dev` uma vez para gerar `.astro/types.d.ts` e refazer.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts package.json pnpm-lock.yaml
git commit -m "feat(content): define collections with Zod schemas for all 10 entities"
```

### Task 3.2: Criar dados placeholder (site, hero, about, form, pricing)

**Files:**
- Create: `src/content/site.yml`, `hero.yml`, `about.yml`, `form.yml`, `pricing.yml`

- [ ] **Step 1: site.yml**

```yaml
brandName: Cinnamon Drinks
tagline: Sofisticação & Experiência
address: Av. Doutor Silvio Menicucci, 2313 — Lavras/MG
businessHours: Segunda a sexta, 9h às 18h
whatsappNumber: "5535998224721"
email: cinnamondrinks@gmail.com
instagram: cinnamondrinks
```

- [ ] **Step 2: hero.yml**

```yaml
heading: SOFISTICAÇÃO & EXPERIÊNCIA
subheading: |
  Coquetelaria de alto padrão para casamentos,
  formaturas e recepções desde 2018.
ctaText: Reservar minha data
gallery:
  - type: video
    src: /videos/Gif-Loop-transcode.mp4
    alt: Vídeo de drinks Cinnamon
```

> Galeria começa com 1 vídeo placeholder; será expandida quando Roger entregar TBD-3 e TBD-4.

- [ ] **Step 3: about.yml**

```yaml
heading: Sobre
body: |
  Desde 2018, a Cinnamon é referência em coquetelaria de alto padrão,
  oferecendo soluções completas de bar para eventos como casamentos,
  formaturas e recepções exclusivas. Fundada por Roger, com mais de
  16 anos de experiência, a empresa se destaca pela equipe altamente
  qualificada certificada por Moisés Barros.
foundedYear: 2018
mainPhoto: /images/placeholder-about.jpg
```

> `mainPhoto` aguarda TBD-5 (foto Sobre).

- [ ] **Step 4: form.yml**

```yaml
heading: Reservar minha data
ctaButton: Reservar minha data
successMessage: |
  Recebemos seu pedido! Em instantes você será redirecionado para o
  WhatsApp para conversarmos sobre seu evento.
errorMessage: |
  Ops, algo deu errado. Tente novamente ou nos chame direto pelo
  WhatsApp.
```

- [ ] **Step 5: pricing.yml**

```yaml
pricePerGuest: "R$ 43,95"
insurancePerGuest: "R$ 2,25"
vodkaUpgrades:
  - name: Smirnoff
    extraPrice: incluso
  - name: Absolut
    extraPrice: "+ R$ 4,00 por convidado"
  - name: Stolichnaya
    extraPrice: "+ R$ 6,00 por convidado"
bartenderRatio: 1 bartender a cada 30 convidados
disclaimer: |
  Valores de referência. Bares personalizados (Bar 360°, Tropical etc.)
  são orçados sob consulta.
```

- [ ] **Step 6: Verificar build**

```bash
pnpm build
```
Expected: build sucede; `dist/` é gerado. Se Zod reclamar de algum campo, ajustar o YAML correspondente.

- [ ] **Step 7: Commit**

```bash
git add src/content/site.yml src/content/hero.yml src/content/about.yml src/content/form.yml src/content/pricing.yml
git commit -m "feat(content): seed site/hero/about/form/pricing with placeholder data"
```

### Task 3.3: Criar `included.yml` com listas reais (vindas do PDF)

**Files:**
- Create: `src/content/included.yml`

- [ ] **Step 1: Escrever included.yml**

```yaml
columns:
  - title: Bar e Estrutura
    items:
      - Canecas
      - Copos
      - Expositores
      - Mobília
      - Utensílios
  - title: Drinks e Insumos
    items:
      - Materiais
      - Drinks não alcoólicos
      - Descartáveis
  - title: Equipe
    items:
      - Bartenders
      - Barback
```

- [ ] **Step 2: Verificar build**

```bash
pnpm build
```
Expected: passa.

- [ ] **Step 3: Commit**

```bash
git add src/content/included.yml
git commit -m "feat(content): seed included with real PDF data (3 columns)"
```

### Task 3.4: Criar collections de drinks (folder, ~21 entries)

**Files:**
- Create: `src/content/drinks/*.yml` (21 arquivos)

> Os 21 drinks vêm do spec §8.5. Cada drink é um arquivo. Order é sequencial dentro da categoria.

- [ ] **Step 1: Criar folder**

```bash
mkdir -p src/content/drinks
```

- [ ] **Step 2: Criar Caip's (2 entries)**

`src/content/drinks/caipirinha.yml`:
```yaml
name: Caipirinha
category: "Caip's"
ingredients: [cachaça, limão, açúcar, gelo]
order: 1
```

`src/content/drinks/caipvodka.yml`:
```yaml
name: Caipvodka
category: "Caip's"
ingredients: [vodka, açúcar, fruta a escolher (abacaxi, limão, maracujá ou morango), gelo]
order: 2
```

- [ ] **Step 3: Criar Clássicos (8 entries)**

Criar um arquivo para cada: `moscow-mule.yml`, `mojito.yml`, `pina-colada.yml`, `sex-on-the-beach.yml`, `ipanema.yml`, `daiquiri.yml`, `lagoa-azul.yml`, `dream-coffee.yml`.

Exemplo `src/content/drinks/moscow-mule.yml`:
```yaml
name: Moscow Mule
category: Clássicos
ingredients: [vodka, suco de limão, ginger ale, gelo]
order: 1
```

Demais: ingredientes seguem receitas clássicas; ordem 2-8 conforme listado no spec.

- [ ] **Step 4: Criar Gin & Whisky (5 entries)**

`negroni.yml`, `gt-especiarias.yml`, `bees-knees.yml`, `pinicilin.yml`, `cosmopolitan.yml`. Order 1-5.

- [ ] **Step 5: Criar Especiais (5 entries)**

`aperol-spritz.yml`, `maracujack.yml`, `saquerita.yml`, `spritz-grape.yml`, `bramble.yml`. Order 1-5.

- [ ] **Step 6: Verificar build com 21 drinks**

```bash
pnpm build
```
Expected: 21 entries de `drinks` collection processadas sem erro Zod.

- [ ] **Step 7: Commit**

```bash
git add src/content/drinks/
git commit -m "feat(content): seed 21 drinks across 4 categories (Caip's/Clássicos/Gin&Whisky/Especiais)"
```

> Marcar TBD-7 (lista de drinks padrão) como aguardando confirmação Roger; TBD-8 (rotular vídeos) ainda aberto.

### Task 3.5: Criar collections de bars (folder, 5 entries)

**Files:**
- Create: `src/content/bars/*.yml` (5 arquivos)

- [ ] **Step 1: Criar folder**

```bash
mkdir -p src/content/bars
```

- [ ] **Step 2: Criar 5 bares**

`src/content/bars/glamouroso.yml` (já temos 6 fotos):
```yaml
name: Glamouroso
description: |
  Bar branco capitonê com acabamento sofisticado. Ideal para casamentos
  e eventos premium que pedem elegância clássica.
gallery:
  - { src: /assets-webflow/DSC00343.jpg, alt: Bar Glamouroso visto de frente }
  - { src: /assets-webflow/DSC00390.jpg, alt: Bar Glamouroso ângulo lateral }
  - { src: /assets-webflow/DSC00393.jpg, alt: Bar Glamouroso detalhe }
  - { src: /assets-webflow/DSC00394.jpg, alt: Bar Glamouroso preparação }
  - { src: /assets-webflow/DSC00395.jpg, alt: Bar Glamouroso vista superior }
  - { src: /assets-webflow/DSC00396.jpg, alt: Bar Glamouroso atendimento }
order: 1
```

`src/content/bars/moderno.yml`:
```yaml
name: Moderno
description: |
  Bar espelhado com linhas contemporâneas. Perfeito para eventos
  corporativos e festas com pegada urbana.
gallery:
  - { src: /assets-webflow/DSC00380.jpg, alt: Bar Moderno espelhado }
order: 2
```

`src/content/bars/interno.yml`:
```yaml
name: Interno
description: |
  Bar verde veludo, aconchegante e elegante. Ideal para ambientes
  fechados e clima intimista.
gallery:
  - { src: /assets-webflow/DSC00330.jpg, alt: Bar Interno verde veludo }
order: 3
```

`src/content/bars/tropical.yml`:
```yaml
name: Tropical
description: |
  Bar com elementos tropicais para eventos ao ar livre, casamentos
  na praia e festas temáticas.
gallery:
  - { src: /images/placeholder-bar-tropical.jpg, alt: Placeholder Bar Tropical }
order: 4
```

`src/content/bars/rustico.yml`:
```yaml
name: Rústico
description: |
  Bar de madeira com acabamento natural. Combina com casamentos no
  campo e celebrações com pegada orgânica.
gallery:
  - { src: /images/placeholder-bar-rustico.jpg, alt: Placeholder Bar Rústico }
order: 5
```

> Tropical e Rústico aguardam fotos reais (TBD-9). Nomenclatura sujeita a TBD-10 (verde = Interno?).

- [ ] **Step 3: Build**

```bash
pnpm build
```
Expected: passa.

- [ ] **Step 4: Commit**

```bash
git add src/content/bars/
git commit -m "feat(content): seed 5 bar configurations (3 with photos, 2 placeholder)"
```

### Task 3.6: Criar collections de testimonials (folder, 2 entries)

**Files:**
- Create: `src/content/testimonials/*.yml`

- [ ] **Step 1: Criar folder e 2 testimonials**

```bash
mkdir -p src/content/testimonials
```

`src/content/testimonials/caroline.yml`:
```yaml
author: Caroline
eventType: Festa
quote: |
  A Cinnamon transformou nossa festa em algo absolutamente memorável.
  Os bartenders são profissionais incríveis e os drinks ficaram
  perfeitos do início ao fim.
```

`src/content/testimonials/vanessa-ronaldo.yml`:
```yaml
author: Vanessa e Ronaldo
eventType: Casamento
quote: |
  Nosso casamento ficou ainda mais especial com a Cinnamon. A estrutura
  do bar, a apresentação dos drinks e a equipe atenciosa fizeram toda
  a diferença.
```

> Aguardando 2-4 depoimentos extras (TBD-12).

- [ ] **Step 2: Build + commit**

```bash
pnpm build
git add src/content/testimonials/
git commit -m "feat(content): seed 2 testimonials from PDF (awaiting 2-4 extras)"
```

### Task 3.7: Criar team.yml com placeholder

**Files:**
- Create: `src/content/team.yml`

- [ ] **Step 1: Escrever team.yml**

```yaml
heading: Nossa Equipe
intro: |
  Bartenders certificados por Moisés Barros — referência nacional em
  coquetelaria. Equipe selecionada e treinada para entregar excelência
  em qualquer escala de evento.
members:
  - name: Roger Apolinário
    role: Fundador & Bartender Líder
    photo: /assets-webflow/_MG_0065.jpg
    certifications: ["Moisés Barros — Certificação Avançada"]
```

> Aguarda TBD-6 (fotos completas, nomes, certificações).

- [ ] **Step 2: Build + commit**

```bash
pnpm build
git add src/content/team.yml
git commit -m "feat(content): seed team with founder placeholder (awaiting full roster)"
```

---

## Phase 4 — Base layout + global CSS

### Task 4.1: Criar `src/layouts/Base.astro`

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Escrever Base.astro**

```astro
---
// src/layouts/Base.astro
import '../styles/normalize.css';
import '../styles/webflow.css';
import '../styles/global.css';
import '../styles/new-sections.css';
import { getEntry } from 'astro:content';

interface Props {
  title?: string;
  description?: string;
  ogImage?: string;
}

const site = await getEntry('site', 'site');
const { title, description, ogImage = '/og-image.jpg' } = Astro.props;

const pageTitle = title
  ? `${title} — ${site!.data.brandName}`
  : `${site!.data.brandName} — ${site!.data.tagline}`;

const pageDesc = description ?? 'Coquetelaria de alto padrão para casamentos, formaturas e eventos em Lavras/MG. Solicite seu orçamento.';
---

<!DOCTYPE html>
<html lang="pt-BR" data-wf-page="cinnamon-drinks" data-wf-site="cinnamon-drinks">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{pageTitle}</title>
  <meta name="description" content={pageDesc} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDesc} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;500;600;700&display=swap" />
  <script is:inline src="/vendor/jquery-3.5.1.min.js"></script>
</head>
<body>
  <slot />
  <script is:inline src="/webflow.js"></script>
</body>
</html>
```

- [ ] **Step 2: Atualizar `src/pages/index.astro` para usar o layout**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base>
  <main>
    <h1>Cinnamon Drinks — landing em construção</h1>
  </main>
</Base>
```

- [ ] **Step 3: Build e dev test**

```bash
pnpm dev
```
Expected: `http://localhost:4321/` carrega; jQuery e webflow.js aparecem na network sem 404; CSS global aplicado. Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro src/pages/index.astro
git commit -m "feat(layout): create Base layout with Outfit font, jQuery local, webflow.js"
```

### Task 4.2: Criar arquivo `src/styles/new-sections.css` vazio

**Files:**
- Create: `src/styles/new-sections.css`

- [ ] **Step 1: Criar com header explicativo**

```css
/* src/styles/new-sections.css
 * Estilos das seções NÃO herdadas do template Webflow.
 * Atualmente: #estrutura (Bloco A — Bares, Bloco B — Inclusos).
 * Princípio: usa as mesmas variáveis CSS / tokens do global.css quando possível.
 */
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/new-sections.css
git commit -m "chore(styles): scaffold new-sections.css for non-template sections"
```

---

## Phase 5 — Component extraction (10 components)

> **Princípio geral por componente:**
> 1. Abrir `_archive/reference/<source>.html` e localizar a seção
> 2. Copiar o markup, preservando classes Webflow e atributos `data-w-id`
> 3. Substituir conteúdo hardcoded por variáveis lidas via `getEntry`/`getCollection`
> 4. Importar no `src/pages/index.astro` e validar visualmente
> 5. Commit

### Task 5.1: Componente `Navbar.astro`

**Files:**
- Create: `src/components/Navbar.astro`

- [ ] **Step 1: Localizar markup no `_archive/reference/index.html`**

```bash
grep -n "navbar\|nav-container" _archive/reference/index.html | head -10
```

- [ ] **Step 2: Escrever Navbar.astro**

```astro
---
// src/components/Navbar.astro
import logoMain from '../assets/logo/logo-principal.png';
import { Image } from 'astro:assets';
---

<div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" class="navbar w-nav">
  <div class="nav-container">
    <a href="#inicio" class="nav-logo w-inline-block" aria-label="Cinnamon Drinks — voltar ao topo">
      <Image src={logoMain} alt="Cinnamon Drinks" widths={[120, 240]} sizes="(max-width: 768px) 120px, 180px" />
    </a>
    <nav role="navigation" class="nav-menu w-nav-menu">
      <a href="#sobre" class="nav-link">Sobre</a>
      <a href="#menu" class="nav-link">Menu</a>
      <a href="#estrutura" class="nav-link">Estrutura</a>
    </nav>
    <a href="#reserva" class="nav-cta w-button">Reservar minha data</a>
    <div class="menu-button w-nav-button" aria-label="menu">
      <div class="menu-icon w-icon-nav-menu"></div>
    </div>
  </div>
</div>
```

> Classes `navbar w-nav`, `w-nav-menu`, `w-nav-button` são do Webflow; webflow.js IX2 reconhece e aplica comportamento de drawer mobile automaticamente.

- [ ] **Step 3: Importar no index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import Navbar from '../components/Navbar.astro';
---
<Base>
  <Navbar />
  <main>
    <h1 id="inicio">Cinnamon Drinks — em construção</h1>
  </main>
</Base>
```

- [ ] **Step 4: Visual check**

```bash
pnpm dev
```
Verificar: navbar renderiza, logo aparece, links são clicáveis, em mobile (DevTools < 992px) burger aparece.

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.astro src/pages/index.astro
git commit -m "feat(components): extract Navbar with sticky desktop + mobile drawer"
```

### Task 5.2: Componente `Hero.astro`

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Escrever Hero.astro**

```astro
---
// src/components/Hero.astro
import { getEntry } from 'astro:content';
const hero = await getEntry('hero', 'hero');
const data = hero!.data;
---

<section id="inicio" class="hero-section">
  <div class="hero-media-wrapper">
    {data.gallery.map((item) => item.type === 'video' ? (
      <video autoplay muted loop playsinline class="hero-media">
        <source src={item.src} type="video/mp4" />
      </video>
    ) : (
      <img src={item.src} alt={item.alt} class="hero-media" loading="eager" />
    ))}
  </div>
  <div class="hero-content">
    <h1 class="hero-heading">{data.heading}</h1>
    <p class="hero-subheading" set:html={data.subheading.replace(/\n/g, '<br/>')} />
    <a href="#reserva" class="hero-cta w-button">{data.ctaText}</a>
  </div>
  <div class="tubes-block tubes-left" data-w-id="hero-tube-left"></div>
  <div class="tubes-block tubes-right" data-w-id="hero-tube-right"></div>
</section>
```

- [ ] **Step 2: Importar no index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import Navbar from '../components/Navbar.astro';
import Hero from '../components/Hero.astro';
---
<Base>
  <Navbar />
  <main>
    <Hero />
  </main>
</Base>
```

- [ ] **Step 3: Visual check**

`pnpm dev` → vídeo placeholder do Gif-Loop deve auto-tocar muted; heading "SOFISTICAÇÃO & EXPERIÊNCIA" visível.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/pages/index.astro
git commit -m "feat(components): extract Hero with media gallery loop + CTA to #reserva"
```

### Task 5.3: Componente `About.astro`

**Files:**
- Create: `src/components/About.astro`

- [ ] **Step 1: Escrever About.astro**

```astro
---
import { getEntry } from 'astro:content';
const about = await getEntry('about', 'about');
const data = about!.data;
---

<section id="sobre" class="about-section">
  <div class="about-content">
    <h2>{data.heading}</h2>
    <p set:html={data.body.replace(/\n/g, '<br/>')} />
    <p class="about-since">Desde {data.foundedYear}</p>
  </div>
  <div class="about-image">
    <img src={data.mainPhoto} alt="Cinnamon Drinks — equipe em ação" loading="lazy" />
  </div>
</section>
```

- [ ] **Step 2: Importar + visual check + commit**

```bash
pnpm dev   # validar
git add src/components/About.astro src/pages/index.astro
git commit -m "feat(components): extract About section with sticky layout"
```

### Task 5.4: Componente `Team.astro`

**Files:**
- Create: `src/components/Team.astro`

- [ ] **Step 1: Escrever**

```astro
---
import { getEntry } from 'astro:content';
const team = await getEntry('team', 'team');
const data = team!.data;
---

<section id="equipe" class="team-section">
  <div class="team-intro">
    <h2>{data.heading}</h2>
    <p>{data.intro}</p>
  </div>
  <div class="team-grid">
    {data.members.map((m) => (
      <article class="team-card">
        <img src={m.photo} alt={`${m.name} — ${m.role}`} loading="lazy" />
        <h3>{m.name}</h3>
        <p class="team-role">{m.role}</p>
        {m.certifications && m.certifications.length > 0 && (
          <ul class="team-certs">
            {m.certifications.map((c) => <li>{c}</li>)}
          </ul>
        )}
      </article>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Importar + visual check + commit**

```bash
git add src/components/Team.astro src/pages/index.astro
git commit -m "feat(components): extract Team with cards grid"
```

### Task 5.5: Componente `Menu.astro`

**Files:**
- Create: `src/components/Menu.astro`
- Create: `src/scripts/menu-tabs.ts` (filtragem client-side)

- [ ] **Step 1: Escrever Menu.astro**

```astro
---
import { getCollection, getEntry } from 'astro:content';
const drinks = await getCollection('drinks');
const pricing = await getEntry('pricing', 'pricing');

const categories = ["Caip's", 'Clássicos', 'Gin & Whisky', 'Especiais'] as const;
const grouped = Object.fromEntries(
  categories.map((cat) => [
    cat,
    drinks
      .filter((d) => d.data.category === cat)
      .sort((a, b) => a.data.order - b.data.order)
  ])
);
---

<section id="menu" class="menu-section">
  <h2>Cardápio de Drinks</h2>

  <nav class="menu-tabs" role="tablist">
    {categories.map((cat, i) => (
      <button
        type="button"
        class={`menu-tab${i === 0 ? ' is-active' : ''}`}
        role="tab"
        aria-selected={i === 0}
        data-category={cat}>
        {cat}
      </button>
    ))}
  </nav>

  {categories.map((cat, i) => (
    <div class={`menu-grid${i === 0 ? ' is-active' : ''}`} data-category={cat} role="tabpanel">
      {grouped[cat].map((d) => (
        <article class="drink-card">
          {d.data.image && <img src={d.data.image} alt={d.data.name} loading="lazy" />}
          <h3>{d.data.name}</h3>
          <p class="drink-ingredients">{d.data.ingredients.join(', ')}</p>
        </article>
      ))}
    </div>
  ))}

  <p class="menu-pricing">
    <strong>{pricing!.data.pricePerGuest}</strong> por convidado · {pricing!.data.bartenderRatio}
  </p>
  <p class="menu-disclaimer">{pricing!.data.disclaimer}</p>
</section>

<script>
  import '../scripts/menu-tabs.ts';
</script>
```

- [ ] **Step 2: Escrever menu-tabs.ts**

```typescript
// src/scripts/menu-tabs.ts
function initMenuTabs() {
  const tabs = document.querySelectorAll<HTMLButtonElement>('.menu-tab');
  const grids = document.querySelectorAll<HTMLDivElement>('.menu-grid');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.category;
      tabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      grids.forEach((g) => g.classList.toggle('is-active', g.dataset.category === cat));
    });
  });
}

if (document.readyState !== 'loading') initMenuTabs();
else document.addEventListener('DOMContentLoaded', initMenuTabs);
```

- [ ] **Step 3: Visual check**

`pnpm dev` → tabs trocam grids; categoria default = Caip's.

- [ ] **Step 4: Commit**

```bash
git add src/components/Menu.astro src/scripts/menu-tabs.ts src/pages/index.astro
git commit -m "feat(components): extract Menu with client-side tab filtering"
```

### Task 5.6: Componente `Bars.astro` (Bloco A da Estrutura — NOVO)

**Files:**
- Create: `src/components/Bars.astro`

- [ ] **Step 1: Escrever**

```astro
---
import { getCollection } from 'astro:content';
const bars = (await getCollection('bars')).sort((a, b) => a.data.order - b.data.order);
---

<section id="estrutura" class="estrutura-section">
  <h2 class="estrutura-heading">Estrutura</h2>

  <div class="estrutura-bloco-a">
    <h3>Configurações de Bar</h3>
    <p class="estrutura-disclaimer">Bar 360° tem regra de mobília própria — consultar.</p>
    <div class="bars-grid">
      {bars.map((bar) => (
        <article class="bar-card" data-bar-name={bar.data.name}>
          <img src={bar.data.gallery[0].src} alt={bar.data.gallery[0].alt} loading="lazy" />
          <h4>{bar.data.name.toUpperCase()}</h4>
        </article>
      ))}
    </div>
  </div>

  <hr class="estrutura-divider" />

  <!-- Bloco B é renderizado por <Included /> dentro da MESMA section -->
  <slot name="incluso" />
</section>
```

- [ ] **Step 2: Adicionar CSS em new-sections.css**

```css
/* Estrutura — wrapper geral */
.estrutura-section { padding: 80px 5% }
.estrutura-heading { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: 1rem }
.estrutura-bloco-a h3, .estrutura-bloco-b h3 { font-family: 'Outfit', sans-serif; font-weight: 600; margin-top: 2rem }
.estrutura-disclaimer { font-style: italic; color: #999; margin-bottom: 1.5rem }
.estrutura-divider { border: 0; border-top: 1px solid rgba(255,255,255,0.15); margin: 4rem 0 }

/* Bars grid (Bloco A) */
.bars-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem }
@media (max-width: 991px) { .bars-grid { grid-template-columns: repeat(3, 1fr) } }
@media (max-width: 600px) { .bars-grid { grid-template-columns: 1fr } }
.bar-card { position: relative; overflow: hidden; border-radius: 8px; cursor: pointer }
.bar-card img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block }
.bar-card h4 { position: absolute; bottom: 1rem; left: 1rem; color: #fff; font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: 0.05em }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Bars.astro src/styles/new-sections.css
git commit -m "feat(components): add Bars (Bloco A of Estrutura) — 5-card grid responsive"
```

### Task 5.7: Componente `Included.astro` (Bloco B — NOVO)

**Files:**
- Create: `src/components/Included.astro`

- [ ] **Step 1: Escrever**

```astro
---
import { getEntry } from 'astro:content';
const included = await getEntry('included', 'included');
const cols = included!.data.columns;
---

<div slot="incluso" class="estrutura-bloco-b">
  <h3>Mobília e Itens Inclusos</h3>
  <div class="included-grid">
    {cols.map((col) => (
      <div class="included-col">
        <h4>{col.title}</h4>
        <ul>
          {col.items.map((it) => <li>{it}</li>)}
        </ul>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Adicionar CSS**

Acrescentar em `src/styles/new-sections.css`:

```css
.included-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem }
@media (max-width: 768px) { .included-grid { grid-template-columns: 1fr } }
.included-col h4 { font-family: 'Outfit', sans-serif; font-weight: 700; margin-bottom: 0.75rem }
.included-col ul { list-style: disc; padding-left: 1.25rem }
.included-col li { margin-bottom: 0.4rem }
```

- [ ] **Step 3: Combinar Bars + Included no index.astro**

```astro
<Bars>
  <Included />
</Bars>
```

- [ ] **Step 4: Visual check + commit**

```bash
git add src/components/Included.astro src/styles/new-sections.css src/pages/index.astro
git commit -m "feat(components): add Included (Bloco B of Estrutura) — 3-column grid"
```

### Task 5.8: Componente `Testimonials.astro`

**Files:**
- Create: `src/components/Testimonials.astro`

- [ ] **Step 1: Escrever**

```astro
---
import { getCollection } from 'astro:content';
const items = await getCollection('testimonials');
---

<section id="depoimentos" class="testimonials-section">
  <h2>Depoimentos</h2>
  <div class="reviews-container">
    {items.map((t) => (
      <article class="review-card">
        <blockquote>"{t.data.quote}"</blockquote>
        <footer>
          <cite>{t.data.author}</cite>
          {t.data.eventType && <span class="review-event"> · {t.data.eventType}</span>}
        </footer>
      </article>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Testimonials.astro src/pages/index.astro
git commit -m "feat(components): extract Testimonials with carousel container"
```

### Task 5.9: Componente `ReserveForm.astro`

**Files:**
- Create: `src/components/ReserveForm.astro`

> A lógica de submit (Formspree + Turnstile + WhatsApp redirect) será implementada na Phase 8. Aqui só o markup + validação HTML5.

- [ ] **Step 1: Escrever**

```astro
---
import { getEntry } from 'astro:content';
const form = await getEntry('form', 'form');
const data = form!.data;

// Min date = hoje + 30 dias (configurável). Calculado server-side.
const minDate = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);
---

<section id="reserva" class="reserve-section">
  <div class="reserve-image">
    <img src="/images/placeholder-reserve.jpg" alt="Bartender preparando drink" loading="lazy" />
  </div>
  <form class="reserve-form" action="/.netlify/functions/-" method="POST" novalidate data-cinnamon-form>
    <h2>{data.heading}</h2>

    <!-- honeypot (campo escondido; bots preenchem) -->
    <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true" />

    <label> Nome*
      <input name="nome" type="text" required minlength="2" />
    </label>
    <label> WhatsApp*
      <input name="telefone" type="tel" required pattern="[0-9() \-+]{10,16}" placeholder="(35) 99999-9999" />
    </label>
    <label> Email
      <input name="email" type="email" />
    </label>
    <label> Tipo de evento*
      <select name="evento" required>
        <option value="">Selecione…</option>
        <option>Formatura</option>
        <option>Casamento</option>
        <option>Aniversário</option>
        <option>Corporativo</option>
        <option>Outro</option>
      </select>
    </label>
    <label> Data do evento*
      <input name="data" type="date" required min={minDate} />
    </label>
    <label> Convidados*
      <input name="convidados" type="number" required min="1" />
    </label>
    <label> Local / cidade*
      <input name="local" type="text" required />
    </label>
    <label> Duração estimada
      <input name="duracao" type="text" placeholder="ex: 6 horas" />
    </label>
    <label> Mensagem
      <textarea name="mensagem" rows="4" placeholder="Detalhes adicionais que ajudem no orçamento"></textarea>
    </label>

    <!-- Turnstile widget (placeholder; sitekey injetado em Phase 8) -->
    <div class="cf-turnstile" data-sitekey="TURNSTILE_SITEKEY_PLACEHOLDER" data-theme="dark"></div>

    <button type="submit" class="reserve-cta w-button">{data.ctaButton}</button>
    <p class="reserve-consent">
      Ao enviar, você concorda em ser contatado(a) via WhatsApp/email para fechamento de orçamento.
    </p>
    <p class="reserve-feedback" data-feedback hidden></p>
  </form>
</section>
```

- [ ] **Step 2: Commit (sem JS de submit ainda)**

```bash
git add src/components/ReserveForm.astro src/pages/index.astro
git commit -m "feat(components): extract ReserveForm with HTML5 validation (submit logic pending)"
```

### Task 5.10: Componente `Footer.astro`

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Escrever**

```astro
---
import { getEntry } from 'astro:content';
const site = (await getEntry('site', 'site'))!.data;
const phoneDisplay = site.whatsappNumber.replace(/^55(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
---

<footer class="site-footer">
  <div class="footer-brand">
    <h3>{site.brandName.toUpperCase()}</h3>
    <p>{site.address}</p>
    <p>{site.businessHours}</p>
  </div>
  <div class="footer-contact">
    <p><a href={`https://wa.me/${site.whatsappNumber}`}>📞 {phoneDisplay}</a></p>
    <p><a href={`mailto:${site.email}`}>✉️ {site.email}</a></p>
    <p><a href={`https://instagram.com/${site.instagram}`} rel="noopener noreferrer" target="_blank">@{site.instagram}</a></p>
  </div>
  <div class="footer-legal">
    <p>© 2026 {site.brandName} · CNPJ 60.606.470/0001-25</p>
    <p><a href="/privacidade">Política de privacidade</a></p>
  </div>
</footer>
```

- [ ] **Step 2: Importar no index.astro (último elemento)**

```astro
<Footer />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro src/pages/index.astro
git commit -m "feat(components): extract Footer with brand contact + legal info"
```

### Task 5.11: Validação completa da página

- [ ] **Step 1: Build full**

```bash
pnpm build
```
Expected: 0 erros. `dist/index.html` contém todas as 8 seções + nav + footer.

- [ ] **Step 2: Preview**

```bash
pnpm preview
```
Expected: site renderiza em `http://localhost:4321/`. Scroll vertical leva por todas as seções. Anchors funcionam.

- [ ] **Step 3: Smoke check em mobile (DevTools)**

Toggle device toolbar → iPhone SE (375×667). Verificar:
- Navbar burger aparece
- Hero ocupa a tela
- Cards do menu empilham
- Form é vertical e legível

- [ ] **Step 4: Commit (se algum tweak foi feito)**

```bash
git status
git diff
[ -n "$(git diff)" ] && git add -A && git commit -m "fix(layout): mobile responsive tweaks for landing"
```

---

## Phase 6 — Sveltia CMS

### Task 6.1: Criar `public/admin/index.html` (CMS shell)

**Files:**
- Create: `public/admin/index.html`

- [ ] **Step 1: Escrever shell**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cinnamon Drinks — Painel</title>
</head>
<body>
  <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add public/admin/index.html
git commit -m "feat(cms): add Sveltia CMS shell at /admin"
```

### Task 6.2: Criar `public/admin/config.yml` com 10 collections

**Files:**
- Create: `public/admin/config.yml`

- [ ] **Step 1: Escrever config completo**

Conteúdo conforme §6.1 do spec, com:
- `backend.name: github`
- `backend.repo: <owner>/cinnamon-drinks` (substituir pelo owner real após Task 6.4)
- `backend.branch: main`
- `backend.base_url: https://cms-oauth.<workers.dev>` (substituir após Phase 7)
- `local_backend: true` (para dev local)
- `media_folder: src/assets/uploads`
- `public_folder: /assets/uploads`
- `commit_messages` em PT-BR
- 10 collections (site, hero, about, team, drinks, bars, included, testimonials, form, pricing) — copiar do §6.1 do spec literalmente

> Esse arquivo é longo (~120 linhas). Copiar o YAML do §6.1 do spec, ajustando os 2 placeholders acima.

- [ ] **Step 2: Validar YAML**

```bash
pnpm dlx js-yaml public/admin/config.yml > /dev/null && echo "YAML válido"
```

- [ ] **Step 3: Commit**

```bash
git add public/admin/config.yml
git commit -m "feat(cms): configure 10 collections matching content schemas"
```

### Task 6.3: Testar Sveltia local (proxy server)

- [ ] **Step 1: Rodar dev + proxy em paralelo**

Terminal 1:
```bash
pnpm dev
```

Terminal 2:
```bash
pnpm dlx @sveltia/cms-proxy-server
```

- [ ] **Step 2: Acessar `http://localhost:4321/admin/`**

Expected: painel Sveltia carrega; em modo `local_backend` ele lê/escreve direto no filesystem sem precisar de OAuth ainda.

- [ ] **Step 3: Editar um campo**

No painel, abrir collection "Configurações gerais" → mudar `tagline` → salvar.

Verificar com:
```bash
git diff src/content/site.yml
```
Expected: alteração refletida.

- [ ] **Step 4: Reverter (não commitamos teste)**

```bash
git checkout src/content/site.yml
```

### Task 6.4: Criar repo GitHub

> Tarefa **manual** do executor (não automatizável sem credenciais GitHub).

- [ ] **Step 1: Criar repo via gh CLI**

```bash
gh repo create cinnamon-drinks --private --source=. --remote=origin --push
```

Ou via UI do GitHub. Anotar `<owner>/cinnamon-drinks`.

- [ ] **Step 2: Atualizar `public/admin/config.yml`**

Substituir `repo: <owner>/cinnamon-drinks` pelo path real.

- [ ] **Step 3: Commit + push**

```bash
git add public/admin/config.yml
git commit -m "feat(cms): set GitHub repo path in Sveltia config"
git push -u origin feature/astro-migration
```

---

## Phase 7 — Cloudflare Worker OAuth proxy

### Task 7.1: Criar GitHub OAuth App

> Manual — exige login GitHub.

- [ ] **Step 1: GitHub → Settings → Developer settings → OAuth Apps → New**

- Application name: `Cinnamon Drinks CMS`
- Homepage URL: `https://cinnamondrinks.com.br`
- Authorization callback URL: `https://cms-oauth.<sub>.workers.dev/callback` (placeholder; ajustar após Task 7.3)
- Anotar Client ID e Client Secret

### Task 7.2: Criar Worker OAuth proxy

**Files:**
- Create: `cms-oauth/wrangler.toml`, `cms-oauth/src/index.ts`

> Worker pode viver em sub-pasta `cms-oauth/` no mesmo monorepo (mais simples) ou repo separado. Recomendado: sub-pasta — mantém tudo no mesmo lugar pro Roger.

- [ ] **Step 1: Inicializar Worker**

```bash
mkdir -p cms-oauth
cd cms-oauth
pnpm dlx wrangler init . --type=javascript --yes
```

- [ ] **Step 2: Substituir `cms-oauth/src/index.ts`**

Implementar OAuth proxy padrão Decap/Sveltia (3 endpoints: `/auth`, `/callback`, `/success`). Código completo:

```typescript
// cms-oauth/src/index.ts
export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'repo,user',
        redirect_uri: `${url.origin}/callback`
      });
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) return new Response('missing code', { status: 400 });

      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code
        })
      });
      const data = await tokenResp.json() as { access_token?: string };
      if (!data.access_token) return new Response('oauth failure', { status: 500 });

      const html = `<!DOCTYPE html><script>
        (function() {
          function send(msg) { window.opener && window.opener.postMessage('authorization:github:success:' + JSON.stringify({ token: ${JSON.stringify(data.access_token)}, provider: 'github' }), '*'); window.close(); }
          send();
        })();
      </script>`;
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }

    return new Response('Cinnamon CMS OAuth proxy', { status: 200 });
  }
};
```

- [ ] **Step 3: Configurar wrangler.toml**

```toml
name = "cms-oauth"
main = "src/index.ts"
compatibility_date = "2026-05-04"
```

- [ ] **Step 4: Setar secrets**

```bash
cd cms-oauth
pnpm dlx wrangler secret put GITHUB_CLIENT_ID
# colar Client ID
pnpm dlx wrangler secret put GITHUB_CLIENT_SECRET
# colar Client Secret
```

- [ ] **Step 5: Deploy**

```bash
pnpm dlx wrangler deploy
```
Expected: URL como `https://cms-oauth.<sub>.workers.dev`. Anotar.

### Task 7.3: Conectar Sveltia ao Worker

- [ ] **Step 1: Atualizar `public/admin/config.yml`**

Substituir `base_url: https://cms-oauth.<workers.dev>` pela URL real do Worker.

- [ ] **Step 2: Atualizar callback URL no GitHub OAuth App**

Voltar no OAuth app no GitHub → setar callback `https://cms-oauth.<sub>.workers.dev/callback`.

- [ ] **Step 3: Commit + push**

```bash
cd ..
git add public/admin/config.yml cms-oauth/
git commit -m "feat(cms): wire Sveltia to CF Worker OAuth proxy with GitHub"
git push
```

- [ ] **Step 4: Smoke test (após Phase 12 / deploy)**

Acessar `https://<dominio>/admin/` → "Login with GitHub" → autorizar → painel abre. Editar um campo → ver commit no GitHub.

---

## Phase 8 — Form (Formspree + Turnstile + WhatsApp)

### Task 8.1: Criar Formspree form e setup Turnstile

> Manual — criar contas se não existirem.

- [ ] **Step 1: Criar form no Formspree (free tier)**

formspree.io → New form → email destino `cinnamondrinks@gmail.com` → anotar Form ID (`xxxxx`).

- [ ] **Step 2: Criar Turnstile site no Cloudflare**

CF dashboard → Turnstile → Add site → domain TBD-1 → tipo "Managed". Anotar Site Key.

- [ ] **Step 3: Atualizar `ReserveForm.astro`**

Trocar:
- `action="/.netlify/functions/-"` → `action="https://formspree.io/f/<FORM_ID>"` 
- `data-sitekey="TURNSTILE_SITEKEY_PLACEHOLDER"` → key real

Adicionar antes de `</head>` no Base.astro:

```html
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

### Task 8.2: TDD — geração de URL do WhatsApp

**Files:**
- Create: `src/scripts/whatsapp.ts`
- Create: `src/scripts/whatsapp.test.ts`
- Test: instalar vitest

- [ ] **Step 1: Instalar vitest**

```bash
pnpm add -D vitest
```

Adicionar em package.json:
```json
"scripts": { "test": "vitest run", "test:watch": "vitest" }
```

- [ ] **Step 2: Escrever o test (failing)**

`src/scripts/whatsapp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildWhatsappUrl } from './whatsapp';

describe('buildWhatsappUrl', () => {
  it('encodes the message and returns wa.me link', () => {
    const url = buildWhatsappUrl({
      phone: '5535998224721',
      lead: {
        nome: 'Maria',
        evento: 'Casamento',
        data: '2026-12-20',
        convidados: '120',
        local: 'Lavras/MG',
        duracao: '6 horas',
        telefone: '(35) 99999-9999',
        email: 'maria@example.com',
        mensagem: 'Quero degustação'
      }
    });

    expect(url).toMatch(/^https:\/\/wa\.me\/5535998224721\?text=/);
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('Maria');
    expect(decoded).toContain('Casamento');
    expect(decoded).toContain('120');
  });

  it('falls back to "—" when email is missing', () => {
    const url = buildWhatsappUrl({
      phone: '5535998224721',
      lead: {
        nome: 'João', evento: 'Aniversário', data: '2026-08-01', convidados: '40',
        local: 'BH', duracao: '', telefone: '31999998888', email: '', mensagem: ''
      }
    });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('—');
  });
});
```

- [ ] **Step 3: Rodar — confirmar falha**

```bash
pnpm test
```
Expected: FAIL ("Cannot find module './whatsapp'").

- [ ] **Step 4: Implementar minimamente**

`src/scripts/whatsapp.ts`:

```typescript
export interface Lead {
  nome: string;
  telefone: string;
  email: string;
  evento: string;
  data: string;
  convidados: string;
  local: string;
  duracao: string;
  mensagem: string;
}

export function buildWhatsappUrl(args: { phone: string; lead: Lead }): string {
  const { phone, lead } = args;
  const text = [
    `Olá! Sou ${lead.nome}, gostaria de orçamento para ${lead.evento}.`,
    '',
    `📅 Data: ${lead.data}`,
    `👥 Convidados: ${lead.convidados}`,
    `📍 Local: ${lead.local}`,
    `⏱️ Duração: ${lead.duracao || 'a definir'}`,
    `📞 ${lead.telefone}`,
    `✉️ ${lead.email || '—'}`,
    '',
    lead.mensagem
  ].join('\n').trim();

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 5: Rodar — passa**

```bash
pnpm test
```
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml src/scripts/whatsapp.ts src/scripts/whatsapp.test.ts
git commit -m "feat(form): WhatsApp URL builder with TDD coverage"
```

### Task 8.3: Wire submit handler no form

**Files:**
- Create: `src/scripts/reserve-form.ts`
- Modify: `src/components/ReserveForm.astro`

- [ ] **Step 1: Escrever handler**

```typescript
// src/scripts/reserve-form.ts
import { buildWhatsappUrl, type Lead } from './whatsapp';

declare global {
  interface Window {
    CINNAMON_PHONE?: string;
  }
}

function getLead(form: HTMLFormElement): Lead {
  const fd = new FormData(form);
  return {
    nome: String(fd.get('nome') ?? ''),
    telefone: String(fd.get('telefone') ?? ''),
    email: String(fd.get('email') ?? ''),
    evento: String(fd.get('evento') ?? ''),
    data: String(fd.get('data') ?? ''),
    convidados: String(fd.get('convidados') ?? ''),
    local: String(fd.get('local') ?? ''),
    duracao: String(fd.get('duracao') ?? ''),
    mensagem: String(fd.get('mensagem') ?? '')
  };
}

function showFeedback(form: HTMLFormElement, msg: string, isError = false) {
  const el = form.querySelector<HTMLElement>('[data-feedback]');
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
  el.dataset.state = isError ? 'error' : 'success';
}

async function init() {
  const form = document.querySelector<HTMLFormElement>('[data-cinnamon-form]');
  if (!form) return;

  const phone = window.CINNAMON_PHONE ?? '5535998224721';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // honeypot trip
    const gotcha = form.querySelector<HTMLInputElement>('input[name="_gotcha"]');
    if (gotcha?.value) return; // descarta silenciosamente

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const lead = getLead(form);
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    try {
      const fd = new FormData(form);
      const res = await fetch(form.action, {
        method: 'POST',
        body: fd,
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error(`Formspree ${res.status}`);

      showFeedback(form, 'Pedido recebido! Abrindo o WhatsApp…');
      const wa = buildWhatsappUrl({ phone, lead });
      // pequeno delay para o usuário ler a mensagem
      setTimeout(() => { window.location.href = wa }, 800);
    } catch (err) {
      showFeedback(form, 'Falha ao enviar. Tente o WhatsApp direto.', true);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Reservar minha data';
    }
  });
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Step 2: Importar no ReserveForm.astro**

Adicionar no fim do componente:

```astro
<script>
  import '../scripts/reserve-form.ts';
</script>
```

E injetar a variável global no Base.astro lendo do site collection:

```astro
<script is:inline define:vars={{ phone: site!.data.whatsappNumber }}>
  window.CINNAMON_PHONE = phone;
</script>
```

(Adicionar antes do `<slot />` no Base.astro.)

- [ ] **Step 3: Smoke test manual**

`pnpm dev` → preencher form com dados fake (e-mail real do dev) → submit. Verificar:
1. Network: POST pra Formspree retorna 200
2. Email chega na inbox do `cinnamondrinks@gmail.com`
3. Aba abre `wa.me/...` com mensagem formatada

- [ ] **Step 4: Commit**

```bash
git add src/scripts/reserve-form.ts src/components/ReserveForm.astro src/layouts/Base.astro
git commit -m "feat(form): wire submit to Formspree + WhatsApp redirect with honeypot"
```

### Task 8.4: Adicionar máscara de telefone

**Files:**
- Modify: `src/scripts/reserve-form.ts`

- [ ] **Step 1: Adicionar formatBR no whatsapp.ts (TDD)**

`src/scripts/whatsapp.test.ts` — adicionar test:

```typescript
import { maskPhoneBR } from './whatsapp';

describe('maskPhoneBR', () => {
  it('formats 11 digits as (XX) XXXXX-XXXX', () => {
    expect(maskPhoneBR('35999998888')).toBe('(35) 99999-8888');
  });
  it('formats 10 digits as (XX) XXXX-XXXX', () => {
    expect(maskPhoneBR('3533334444')).toBe('(35) 3333-4444');
  });
  it('returns input as-is when too short', () => {
    expect(maskPhoneBR('123')).toBe('123');
  });
});
```

- [ ] **Step 2: Implementar maskPhoneBR**

Em `whatsapp.ts`:

```typescript
export function maskPhoneBR(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return raw;
}
```

- [ ] **Step 3: Rodar tests**

```bash
pnpm test
```
Expected: 5 PASS.

- [ ] **Step 4: Wire no input**

Em `reserve-form.ts` (dentro de `init()`):

```typescript
const tel = form.querySelector<HTMLInputElement>('input[name="telefone"]');
tel?.addEventListener('input', () => { tel.value = maskPhoneBR(tel.value) });
```

- [ ] **Step 5: Commit**

```bash
git add src/scripts/whatsapp.ts src/scripts/whatsapp.test.ts src/scripts/reserve-form.ts
git commit -m "feat(form): add Brazilian phone mask with TDD coverage"
```

---

## Phase 9 — Motion animations (Estrutura)

### Task 9.1: Instalar Motion

- [ ] **Step 1**

```bash
pnpm add motion
```

- [ ] **Step 2: Verificar import path**

```bash
grep -r "motion/mini" node_modules/motion/package.json
```
Expected: `motion/mini` listado em `exports`.

### Task 9.2: Animar bars-grid e included-grid

**Files:**
- Create: `src/scripts/motion.ts`

- [ ] **Step 1: Escrever**

```typescript
// src/scripts/motion.ts
import { animate, inView } from 'motion/mini';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  // Bars: stagger ao entrar na viewport
  inView('.bar-card', (entry) => {
    animate(entry.target as HTMLElement,
      { opacity: [0, 1], y: [40, 0] },
      { duration: 0.6, delay: Number((entry.target as HTMLElement).dataset.idx ?? 0) * 0.08 }
    );
  });

  // Included columns: descem com pequeno delay
  inView('.included-col', (entry) => {
    animate(entry.target as HTMLElement,
      { opacity: [0, 1], y: [20, 0] },
      { duration: 0.5 }
    );
  });
}
```

- [ ] **Step 2: Adicionar `data-idx` nos cards (Bars.astro)**

```astro
{bars.map((bar, idx) => (
  <article class="bar-card" data-bar-name={bar.data.name} data-idx={idx}>
```

- [ ] **Step 3: Importar no index.astro**

```astro
<script>
  import '../scripts/motion.ts';
</script>
```

- [ ] **Step 4: Smoke test**

`pnpm dev` → scroll até #estrutura → cards entram com fade+slide. Toggle `prefers-reduced-motion` em DevTools (Rendering → Emulate CSS media feature) → animações somem.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/scripts/motion.ts src/components/Bars.astro src/pages/index.astro
git commit -m "feat(animation): Motion mini stagger on Estrutura section with reduced-motion fallback"
```

---

## Phase 10 — SEO + A11y + structured data

### Task 10.1: Adicionar JSON-LD LocalBusiness

**Files:**
- Modify: `src/layouts/Base.astro`

- [ ] **Step 1: Acrescentar bloco no `<head>`**

```astro
---
const ldJson = {
  '@context': 'https://schema.org',
  '@type': 'BarOrPub',
  name: site!.data.brandName,
  description: pageDesc,
  telephone: `+${site!.data.whatsappNumber}`,
  email: site!.data.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site!.data.address,
    addressLocality: 'Lavras',
    addressRegion: 'MG',
    addressCountry: 'BR'
  },
  url: Astro.url.origin,
  sameAs: [`https://instagram.com/${site!.data.instagram}`]
};
---
<script type="application/ld+json" set:html={JSON.stringify(ldJson)}></script>
```

- [ ] **Step 2: Validar com Schema.org**

`pnpm build` → abrir `dist/index.html` → copiar bloco JSON-LD → colar em https://validator.schema.org/ → verificar 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat(seo): add LocalBusiness JSON-LD with brand info"
```

### Task 10.2: Criar `public/robots.txt` e `public/sitemap.xml`

**Files:**
- Create: `public/robots.txt`
- Install: `@astrojs/sitemap`

- [ ] **Step 1**

```bash
pnpm astro add sitemap
```
(Aceita o prompt; modifica `astro.config.mjs` automaticamente.)

- [ ] **Step 2: Criar robots.txt**

`public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://cinnamondrinks.com.br/sitemap-index.xml
```

- [ ] **Step 3: Build + verificar**

```bash
pnpm build
ls dist/sitemap-index.xml dist/robots.txt
```
Expected: ambos existem.

- [ ] **Step 4: Commit**

```bash
git add public/robots.txt astro.config.mjs package.json pnpm-lock.yaml
git commit -m "feat(seo): add robots.txt and sitemap-index via @astrojs/sitemap"
```

### Task 10.3: A11y audit — contraste e foco

- [ ] **Step 1: Rodar axe-core via CLI**

```bash
pnpm dlx @axe-core/cli http://localhost:4321/
```
Expected: 0 critical issues. Issues moderate/serious: ajustar.

- [ ] **Step 2: Verificar contraste manual**

Em DevTools (Lighthouse → Accessibility) ou inspect: nenhum texto < 4.5:1 contra fundo.

- [ ] **Step 3: Tab navigation**

Tab através do form e navbar — focus visível em cada elemento. Adicionar em `global.css` se faltar:

```css
:focus-visible { outline: 2px solid #F26294; outline-offset: 2px }
```

- [ ] **Step 4: Commit (se houve ajustes)**

```bash
git diff
[ -n "$(git diff)" ] && git add -A && git commit -m "fix(a11y): contrast and focus visibility"
```

---

## Phase 11 — Performance verification

### Task 11.1: Comprimir vídeos do hero

> Pré-req: Roger entregou TBD-4 (3 vídeos selecionados dos 41).

**Files:**
- Update: `public/videos/`

- [ ] **Step 1: Comprimir cada vídeo com ffmpeg**

```bash
ffmpeg -i input.mp4 -vf "scale=1080:-2" -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 128k -movflags +faststart public/videos/hero-1.mp4
```

Repetir para hero-2.mp4 e hero-3.mp4.

- [ ] **Step 2: Verificar tamanhos**

```bash
ls -lh public/videos/hero-*.mp4
```
Expected: cada ≤ 10MB. Se passar, aumentar CRF para 26 e re-comprimir.

- [ ] **Step 3: Atualizar hero.yml**

```yaml
gallery:
  - { type: video, src: /videos/hero-1.mp4, alt: "Drink sendo preparado" }
  - { type: video, src: /videos/hero-2.mp4, alt: "Bartender em ação" }
  - { type: video, src: /videos/hero-3.mp4, alt: "Bar montado para evento" }
```

- [ ] **Step 4: Commit**

```bash
git add public/videos/hero-*.mp4 src/content/hero.yml
git commit -m "feat(media): add 3 compressed hero videos (≤10MB each)"
```

### Task 11.2: Lighthouse run + iteração

- [ ] **Step 1: Build prod**

```bash
pnpm build && pnpm preview
```

- [ ] **Step 2: Rodar Lighthouse (Chrome DevTools)**

Preview URL → DevTools → Lighthouse → desktop + mobile separados.

- [ ] **Step 3: Verificar metas**

| Categoria | Mínimo |
|---|---|
| Performance | ≥ 90 |
| Acessibilidade | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |

Se algum falhar, anotar issues e abrir tasks específicas (LCP imagem, contraste, etc.).

- [ ] **Step 4: Commit (se houver ajustes derivados)**

---

## Phase 12 — Deploy (Cloudflare Pages)

### Task 12.1: Criar projeto Cloudflare Pages

> Manual.

- [ ] **Step 1: CF dashboard → Pages → Create**

- Connect to GitHub → selecionar `Cinnamon-Drinks/Cinnamon-drinks-landing-page`
- Branch: `main`
- Framework preset: `Astro`
- Build command: `pnpm build`
- Build output: `dist`
- Env vars (Production + Preview):
  - `PUBLIC_TURNSTILE_SITE_KEY` — sitekey do Cloudflare Turnstile, lida em build-time por `ReserveForm.astro`; sem ela o CAPTCHA do form não renderiza. Pública por natureza (não é segredo).
  - `NODE_VERSION` = `22` — compat Astro 5 (o default da CF varia). Se o build reclamar do pnpm, somar `PNPM_VERSION` = `10.33.0`.
  - O site URL de produção continua vindo de `astro.config.mjs` (`site:`), não de env var.

- [ ] **Step 2: Deploy**

Trigger manual no painel ou push em `main`.

- [ ] **Step 3: Verificar preview URL**

`<projeto>.pages.dev` carrega; admin acessível em `<projeto>.pages.dev/admin/`.

### Task 12.2: Apontar `cinnamondrinks.com.br` para CF Pages

> Pré-req: domínio confirmado (✅ Registro.br, 2026-05-04). Falta apenas o ato de DNS — Roger precisa estar disponível para mexer no painel Registro.br no momento.

**Caminho recomendado: delegar nameservers para Cloudflare** (libera todos os recursos CF na zona — Workers, Turnstile etc. com apex).

- [ ] **Step 1: CF dashboard → Add a Site → `cinnamondrinks.com.br` → plano Free**

CF mostra os 2 nameservers a usar (algo como `xxx.ns.cloudflare.com` e `yyy.ns.cloudflare.com`). Anotar.

- [ ] **Step 2: Roger entra no Registro.br**

`registro.br` → login → Meus domínios → `cinnamondrinks.com.br` → DNS / Servidores DNS → trocar para os 2 NS da Cloudflare. Salvar.

- [ ] **Step 3: Aguardar propagação NS**

```bash
dig NS cinnamondrinks.com.br +short
```
Expected: retorna os NS da Cloudflare. Pode levar até 24h; geralmente <1h.

- [ ] **Step 4: CF Pages → Custom domains → Add → `cinnamondrinks.com.br`**

CF detecta a zona e cria os registros automaticamente. Adicionar também `www.cinnamondrinks.com.br` com redirect para apex.

- [ ] **Step 5: Aguardar SSL**

CF emite cert automático em ~5min após NS propagar. Acessar `https://cinnamondrinks.com.br/` → carrega o site.

- [ ] **Step 6: Verificar `/admin/`**

`https://cinnamondrinks.com.br/admin/` → painel Sveltia. Login GitHub → autoriza → consegue editar.

> **Caminho alternativo (não recomendado):** manter NS no Registro.br e adicionar CNAME/A apontando pra `<projeto>.pages.dev`. Funciona mas perde Workers/Turnstile na zona apex. Só usar se Roger não conseguir alterar NS por algum motivo.

- [ ] **Step 4: Atualizar OAuth callback**

GitHub OAuth App → callback URL → trocar para `https://cms-oauth.<sub>.workers.dev/callback` (se ainda não estava) ou ajustar conforme arquitetura final.

### Task 12.3: Mergear branch e fechar milestone S3

```bash
git checkout main
git merge --no-ff feature/astro-migration
git push origin main
```

CF Pages dispara build automático. Anotar URL de produção.

---

## Phase 13 — Manual de uso e handoff

### Task 13.1: Escrever manual de 1 página

**Files:**
- Create: `docs/MANUAL_DE_USO.md`

- [ ] **Step 1: Escrever**

Tópicos obrigatórios:
1. Como acessar `/admin/`
2. Como editar preço (Configurações de Preço)
3. Como adicionar novo drink
4. Como trocar foto de uma seção
5. Como ver leads recebidos (Formspree dashboard)
6. Quem chamar se algo der errado (contato Luis)
7. Como recuperar acesso ao GitHub (2FA recovery)
8. Limites: 50 leads/mês Formspree, 25MB/arquivo CF Pages

- [ ] **Step 2: Commit**

```bash
git add docs/MANUAL_DE_USO.md
git commit -m "docs: add 1-page user manual for Roger"
```

### Task 13.2: Transferir repo GitHub para Roger

> Após pagamento da 3ª parcela.

- [ ] **Step 1: Settings do repo → Transfer ownership → username do Roger**

- [ ] **Step 2: Verificar OAuth App ainda aponta pro repo correto**

Se transferiu org, OAuth App pode precisar de re-autorização.

- [ ] **Step 3: Atualizar `public/admin/config.yml`** com novo `repo: roger-username/cinnamon-drinks`

- [ ] **Step 4: Commit + push final**

```bash
git add public/admin/config.yml
git commit -m "chore: handoff — update CMS repo path post-transfer"
git push
```

---

## Critérios de aceitação (do spec §15)

- [ ] Todas as 8 seções publicadas com conteúdo real (sem placeholders)
- [ ] Form de captação testado: lead chega no email + WhatsApp abre com mensagem formatada
- [ ] `/admin` funcional com OAuth GitHub do Roger
- [ ] Lighthouse ≥ 90 nas 4 categorias
- [ ] Domínio apontado para Cloudflare Pages com HTTPS funcionando
- [ ] Site funciona em Chrome, Safari, Firefox (desktop e mobile real)
- [ ] Manual de uso (1 página) entregue ao Roger
- [ ] Repositório transferido para conta GitHub do Roger
- [ ] 3ª parcela paga (R$ 2.000)

---

## TBDs ainda abertos (mapeamento spec → fase)

| TBD | Onde bloqueia | Fase |
|---|---|---|
| ~~TBD-1~~ ✅ `cinnamondrinks.com.br` (Registro.br) | só DNS no cutover | 12.2 |
| TBD-2 (UX vídeo 4K) | Hero apresentação | 5.2 (decisão Luis) |
| TBD-3 (foto hero) | hero.gallery | 3.2 / 11.1 |
| TBD-4 (3 vídeos) | hero.gallery | 11.1 |
| TBD-5 (foto Sobre) | about.mainPhoto | 3.2 |
| TBD-6 (equipe) | team.members | 3.7 |
| TBD-7 (drinks) | drinks/* | 3.4 |
| TBD-8 (rotular vídeos) | drinks.image | 3.4 |
| TBD-9 (fotos Tropical/Rústico) | bars/* | 3.5 |
| TBD-10 (nomenclatura bares) | bars/* | 3.5 |
| TBD-11 (textos Inclusos) | included.yml | 3.3 |
| TBD-12 (depoimentos extras) | testimonials/* | 3.6 |
| TBD-13 (horário comercial) | site.businessHours | 3.2 |
| TBD-14 (newsletter sim/não) | Footer + form extra | aditivo se sim |
| TBD-15 (logos SVG) | navbar/footer | upgrade quando chegar |
| TBD-16 (IDV) | ✅ resolvido | — |
| TBD-17 (prêmio Sales) | risco legal | fora do plano técnico |

---

**FIM DO PLANO**
