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

- **Tipografia:** Outfit (Google Fonts, SIL OFL) — Bold 700 primária, Thin 100 secundária. **NUNCA** Nexa, **NUNCA** Poppins.
- **Paleta:** preto `#000000` · rosa `#F26294` · laranja `#F2662B` · branco `#ffffff`. Gradiente oficial `linear-gradient(90deg, #F26294 → #F2662B)` para destaques pontuais.
- **Cor escura:** `#000000` puro, **NÃO** `#00324E` (mesmo onde brandbook lista `#00324E` em PDF — usar preto puro para fidelidade visual).
- **Default UI:** branco neutro em elementos interativos sobre fundo escuro; preto sobre fundo claro. Rosa/laranja **apenas em destaques pontuais explicitamente desenhados**, nunca wholesale em botões/links.
- **Classes Webflow `w-*`** (`w-nav`, `w-button`, `w-inline-block`, etc.) são **imutáveis** — `webflow.js` IX2 depende delas. Adicionar nossas classes ao lado, não substituir.
- **Package manager:** pnpm. `npm` e `yarn` proibidos.
- **Linter+formatter:** Biome (`@biomejs/biome` ^2.4.x). Sem ESLint, sem Prettier.
- **Conteúdo editável** vive em `src/content/*.yml` (gerenciado via Sveltia CMS em `/admin/`), nunca hardcoded em componentes.
- **Domínio:** `cinnamondrinks.com.br` (Registro.br, confirmado 2026-05-04).
- **Vermelhos de validação** (`#ff2525`, `#f11`) ficam intencionalmente fora da regra de UI (UX > paleta).

## Comandos comuns

| Comando | Uso |
|---|---|
| `pnpm dev` | Dev server Astro em `http://localhost:4321` |
| `pnpm build` | Build de produção em `dist/` |
| `pnpm preview` | Servir `dist/` para QA local |
| `pnpm check` | Biome lint + format check (CI dry-run) |
| `pnpm lint` | Biome lint apenas |
| `pnpm format` | Biome format --write (formata e escreve) |
| `pnpm ts:check` | `astro check` (TypeScript) |
| `pnpm test` | Vitest run (suite atual: `whatsapp.test.ts`) |

## Arquivos críticos a NÃO editar sem cuidado

- `public/webflow.js` — IX2 runtime exportado do Webflow; minificado, não otimizado, não nosso. Re-exportar ou trocar por equivalente puro só com aprovação Luis.
- `public/vendor/jquery-3.5.1.min.js` — jQuery vendored localmente; `webflow.js` depende.
- `_archive/` — referência visual durante extração; **não importar** nada daqui em código de produção.
- `docs/brandbook/Brand Book _ Cinnamon Drinks.pdf` — binário; não editar.
- `docs/superpowers/specs/2026-05-01-cinnamon-drinks-design.md` — spec contratual; alterações exigem nota de versão e justificativa.

## Pendências externas (memory dir)

Memory: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/`

- `pending_domain.md` — DNS no Registro.br (cutover em Phase 12)
- `pending_content_from_roger.md` — 12 itens de conteúdo (fotos, vídeos, textos)
- `pending_logo_svgs.md` — SVGs aguardando Giovanna (PNGs em uso enquanto isso)
- `pending_legal_award_validation.md` — TBD-17 (não incluir prêmio no site sem comprovação)

## Quando em dúvida

1. Reler a spec inteira (`docs/superpowers/specs/2026-05-01-cinnamon-drinks-design.md`)
2. Reler o pattern relevante em `docs/patterns/`
3. Conferir o memory do projeto: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/`
4. Perguntar ao Luis antes de adivinhar
