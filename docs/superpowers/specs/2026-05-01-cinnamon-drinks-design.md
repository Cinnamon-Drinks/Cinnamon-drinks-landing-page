# Cinnamon Drinks — Landing Page · Design Spec

**Status:** Draft v6 — IDV · stack · convenções · guardrails · domínio · navbar revista (5 anchors + Menu TBD) · 3/17 TBDs resolvidos · em execução
**Data:** 2026-05-01 · Atualizações: 2026-05-04 (v2: IDV · v3: convenções · v4: Biome · v5: domínio · v6: navbar)
**Autor:** Luiz Carlos Vitoriano Neto (CONTRATADO)
**Cliente:** Cinnamon Drinks — Maria da Penha Monteiro da Sé Apolinário (CONTRATANTE) · interlocutor operacional: Roger Apolinário
**Contrato:** ZapSign d303644b-0df6-4ae6-b8dd-ddc6c5539b40 (assinado 28/04/2026)
**Entrega final:** 20/06/2026 · Entrega intermediária: 20/05/2026

---

## 1. Objetivo

Construir **uma única landing page profissional e responsiva** para a Cinnamon Drinks, com 8 seções pré-definidas no contrato (cláusula 1.2), focada em **captação de leads** que serão direcionados ao WhatsApp comercial para fechamento de orçamento. O site substitui o atual fluxo de envio de PDFs estáticos a clientes potenciais.

A página deve transmitir o posicionamento premium da marca ("Sofisticação & Experiência"), apresentar a oferta com clareza (drinks, configurações de bar, itens inclusos) e converter visitantes em conversas comerciais.

### Métricas de sucesso

- Lead chega no WhatsApp comercial com briefing pré-formatado (nome, evento, data, convidados, local)
- Lead também chega por email no `cinnamondrinks@gmail.com` (backup, evita perda)
- Roger consegue editar preços, drinks e textos sem ajuda do desenvolvedor
- Lighthouse ≥ 90 em todas as 4 categorias (Performance, Acessibilidade, Best Practices, SEO)
- Site usa apenas serviços com free tier (custo recorrente para a CONTRATANTE = R$ 0)

### Não-objetivos (fora deste escopo)

- Sistema de geração de **links de orçamento personalizado por cliente** (discutido em reunião, mas fora da cláusula 1.2 — será tratado como **aditivo** após entrega da landing)
- Multi-idioma (PT-BR apenas)
- Sistema de reserva com calendário de disponibilidade (eventos não funcionam assim — é apenas captação de lead)
- Sistema de pagamento online
- Blog ou conteúdo recorrente
- Multi-página (contrato é explícito: 1 landing page única)

---

## 2. Stakeholders

| Papel | Pessoa | Responsabilidade |
|---|---|---|
| CONTRATANTE | Maria da Penha M.S. Apolinário (CNPJ 60.606.470/0001-25) | Empresária individual da Cinnamon Drinks |
| Interlocutor operacional / "CEO" | Roger Apolinário | Decisões de produto, conteúdo, validações |
| CONTRATADO | Luiz Carlos Vitoriano Neto | Desenvolvimento, deploy, documentação |
| Usuário final do site | Visitantes (B2C: noivos/comissões; B2B: agências de eventos) | Captação de orçamento |
| Editor pós-entrega | Roger Apolinário | Edita preços, drinks, depoimentos via Sveltia CMS |

---

## 3. Escopo (cláusula 1.2 do contrato)

8 cláusulas de conteúdo (cláusula 1.2 do contrato) entregues como **7 seções visíveis no site** + responsividade desktop/tablet/celular + integração WhatsApp + formulário de captação.

**Decisão de UX:** as cláusulas 5 e 6 do contrato ("Configurações de Bar" e "O que Está Incluso") são tópicos próximos — ambas descrevem a infraestrutura física do evento. Foram unificadas visualmente sob a seção **"Estrutura"**, com dois blocos internos. Todo o conteúdo das duas cláusulas permanece presente; apenas a apresentação foi consolidada para reduzir fragmentação. Ver §8.6.

| # cláusula | Nome no contrato | Label no site | Anchor |
|---|---|---|---|
| 1 | Hero | **INICIO** | `#inicio` (topo) |
| 2 | Quem Somos | **SOBRE** | `#sobre` |
| 3 | Nosso Time | **EQUIPE** | `#equipe` |
| 4 | Cardápio de Drinks | **MENU** | `#menu` |
| 5 | Configurações de Bar | **ESTRUTURA** › Bares | `#estrutura` |
| 6 | O que Está Incluso | **ESTRUTURA** › Inclusos | `#estrutura` |
| 7 | Depoimentos | **DEPOIMENTOS** | `#depoimentos` |
| 8 | Formulário de captação | **RESERVA** | `#reserva` |
| — | Footer / contatos | **CONTATO** | `#contato` (id no `<footer>`) |

### Pós-entrega

3 rodadas de ajustes (cláusula 1.4) — apenas textos, imagens e orientações de uso. Novas seções, novas funcionalidades ou alterações estruturais exigem aditivo (cláusula 1.5) com revisão de prazo e valor.

### Custos NÃO incluídos no R$ 6.000 do contrato (cláusula 2.5)

São responsabilidade da CONTRATANTE: domínio, hospedagem, banco de dados, gateways, APIs pagas, e-mail/SMS, SSL pago, fontes/imagens/vídeos licenciados, ferramentas de monitoramento. **Esta spec foi desenhada para usar exclusivamente free tiers**, mantendo o custo recorrente para a CONTRATANTE em R$ 0.

---

## 4. Arquitetura

### 4.1 Stack final

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Site framework | **Astro 5.x** (SSG) | Site estático, ótima performance, importa HTML do Webflow quase 1-pra-1, integra bem com Sveltia. v5 tem Content Collections com loaders explícitos (ver §6.3) |
| Package manager | **pnpm** | Decisão 2026-05-04 — disk-efficient (store global com hardlinks), lockfile estrito, suporte nativo do Astro. Cloudflare Pages detecta `pnpm-lock.yaml` automaticamente |
| CMS | **Sveltia CMS** | Sucessor moderno e ativo do Decap CMS (drop-in: mantém o mesmo formato `config.yml`). Git-based, zero infra, painel `/admin`, melhor UX/perf, suporte i18n nativo. CDN: `unpkg.com/@sveltia/cms` |
| Auth do CMS | **Cloudflare Worker** (OAuth proxy próprio) | Substitui o descontinuado Netlify Identity; usa GitHub OAuth |
| Hospedagem | **Cloudflare Pages** | Free tier robusto, CDN com POPs no Brasil, build automático no `git push`, uso comercial OK |
| Repositório | **GitHub** | Sveltia exige; criado pelo Luis, transferido pro Roger no fim do projeto (estratégia R2) |
| Form backend | **Formspree** (free tier 50/mês) | Captação de lead independente do WhatsApp (Modelo B) |
| **Vídeos** | **Self-host no Cloudflare Pages** (`public/videos/`) | Máx 3 vídeos comprimidos; Cloudinary descartado para reduzir dependências |
| **Imagens** | **Astro built-in** (Sharp) | Otimização WebP/AVIF no build, sem CDN externo, grátis |
| Animações | **Webflow IX2** (heredado) + **Motion** (`motion/mini`, 2.3kb) como padrão nas novas seções | Caminho C: preserva trabalho do template, modernidade nas seções novas. Pacote NPM se chama `motion` (renomeado a partir de "Motion One"). Build mini cobre `animate()` que é tudo que precisamos |
| Anti-spam | **Cloudflare Turnstile** (managed widget, deterrente) + honeypot + antispam nativo do Formspree | Defesa em camadas. Turnstile atua como deterrente visual (token NÃO validado server-side — Formspree não conhece a API). Ver §11.2 |
| Domínio | TBD-1 — confirmar com Roger | DNS apontará para Cloudflare Pages |

### 4.2 Diagrama do sistema

```
┌──────────────────────────────────────────────────────────────────┐
│                       FLUXO DE EDIÇÃO (Roger)                     │
└──────────────────────────────────────────────────────────────────┘

  Roger ──▶ /admin ──▶ OAuth via CF Worker ──▶ valida login
                          │
                          ▼ painel Sveltia
                    edita preço/drink
                          │
                          ▼ commit + push
                    GitHub ──webhook──▶ CF Pages build (Astro)
                                          │
                                          ▼
                                cinnamondrinks.com.br atualizado


┌──────────────────────────────────────────────────────────────────┐
│              FLUXO DE CAPTAÇÃO DE LEAD (visitante)                │
└──────────────────────────────────────────────────────────────────┘

  Visitante ──▶ preenche form ──▶ Turnstile + honeypot
                                         │
                                         ▼ valida
                                   POST /formspree
                                         ├──▶ email pra cinnamondrinks@gmail.com
                                         │
                                         ▼ ack 200
                              redireciona para wa.me/55... com mensagem formatada
                                         │
                                         ▼
                              WhatsApp Comercial recebe briefing


┌──────────────────────────────────────────────────────────────────┐
│                    MÍDIA (vídeos + imagens)                        │
└──────────────────────────────────────────────────────────────────┘

  Imagens estáticas ──▶ src/assets/ ──▶ Astro Sharp ──▶ WebP/AVIF responsivo
                                                              │
  Vídeos comprimidos (≤10MB) ──▶ public/videos/                │
                                        ▼                     ▼
                                  Cloudflare Pages CDN (gratuita, sem branding)
```

### 4.3 Serviços externos (3 contas no total)

| Serviço | Conta | Plano |
|---|---|---|
| GitHub | Inicialmente Luis, transferida pro Roger | Free |
| Cloudflare (Pages + Workers + Turnstile) | Roger | Free |
| Formspree | Roger | Free (50 leads/mês) |

Todas em nome da CONTRATANTE no fim do projeto, conforme cláusula 2.6.

### 4.4 Domínio e DNS

- **Domínio:** `cinnamondrinks.com.br` (confirmado 2026-05-04)
- **Registrar:** Registro.br
- **Plano DNS:** delegar nameservers para Cloudflare (recomendado) — Roger troca no painel Registro.br os 2 NS para os fornecidos pela CF. Alternativa: manter NS no Registro.br e adicionar CNAME/A apontando para `<projeto>.pages.dev` (mais simples, mas limita recursos Cloudflare na zona)
- **HTTPS:** automático via Cloudflare (cert gratuito Let's Encrypt-equivalente, renovação automática)
- **Pendente:** apenas o passo de DNS no momento do cutover (Phase 12.2 do plano) — não bloqueia desenvolvimento

### 4.5 Identidade Visual (IDV oficial)

> Atualização **2026-05-04** — substitui o mood-board provisório que estava em §16.B.

Brandbook oficial entregue por **Giovanna Evaristo** e documentado em `docs/brandbook/IDENTIDADE_VISUAL.md` (fonte: `docs/brandbook/Brand Book _ Cinnamon Drinks.pdf`).

| Elemento | Decisão | Notas |
|---|---|---|
| **Paleta primária** | preto `#000000` · rosa `#F26294` · laranja `#F2662B` · branco `#ffffff` | Brandbook indicava `#00324E` mas exibia visualmente como preto — usamos `#000` puro para máxima fidelidade ao material |
| **Gradiente oficial** | `linear-gradient(90deg, #F26294 → #F2662B)` | Uso pontual em destaques (hero, CTA principal); não aplicar wholesale |
| **Tipografia primária** | **Outfit Bold 700** (Google Fonts, SIL OFL) | Substitui Nexa do brandbook (sem licença comercial). Implementada 2026-05-04 nos HTMLs e CSS |
| **Tipografia secundária** | **Outfit Thin 100** | Carregada mas ainda não referenciada — disponível para Giovanna aplicar como peso secundário |
| **Logos** | 6 variantes PNG em `images/logo/` | `logo-principal`, `logo-secundaria`, `sublogo-principal`, `sublogo-secundaria`, `marca-dagua-preta`, `marca-dagua-colorida` · SVGs solicitados a Giovanna em 2026-05-04 (pendentes) |
| **Atributos de marca** | Modernidade · Jovialidade · Dinamicidade · Sofisticação | Guia tom de voz e direção visual |

**Política de cor em UI:** branco neutro (`#fff`) como **default** em elementos interativos sobre fundo escuro; preto em elementos sobre fundo claro. Rosa/laranja aplicados **apenas em destaques pontuais explicitamente desenhados** (ex.: hero gradient, um único CTA de impacto). Decisão registrada em 2026-05-04 após reverter swap global de amarelos do template para rosa/laranja — usuário não gostou do resultado em elementos como o botão "Menu" mobile. Vermelhos de validação (`#ff2525`/`#f11`) ficam intencionalmente fora dessa regra (UX > paleta).

**TBD-15** (logos) parcialmente resolvido — PNGs já em uso; SVGs pendentes mas não bloqueiam desenvolvimento.
**TBD-16** (IDV completa) **resolvido** — ver brandbook + esta seção.

### 4.6 Convenções de engenharia

> Acrescentado 2026-05-04 a pedido do usuário — guardrails antes de codar.

#### 4.6.1 Organização de pastas

A árvore canônica vive em §5. As **regras** que governam onde cada coisa mora:

| Regra | Aplicação |
|---|---|
| Files that change together live together | Componente Astro + estilos específicos + script local ficam próximos (preferir colocar `<style>` e `<script>` dentro do `.astro` em vez de espalhar) |
| Um componente = uma seção | `Hero.astro`, `Menu.astro`, etc. — não há mega-componente que renderiza múltiplas seções |
| Lógica fora de markup | Funções puras testáveis vão em `src/scripts/*.ts`; componentes só consomem |
| Conteúdo é YAML, nunca hardcoded | Tudo que Roger pode editar mora em `src/content/`, não em `src/components/` |
| Vendor local antes de CDN | JS de terceiros (jQuery) hospedado em `public/vendor/`; CDN só para Google Fonts e Sveltia (CDN deles é estável) |
| `_archive/` é limbo, não lixo | HTMLs não publicados ficam para referência visual durante extração; limpar só quando o componente correspondente estiver maduro |
| `dist/` e `node_modules/` no `.gitignore` | Nunca commitamos artefatos de build |
| `public/` é passthrough | Astro copia `public/*` para `dist/*` sem processar — usar para `webflow.js`, vídeos, vendor, admin |
| `src/assets/` é processável | Imagens aqui passam por Sharp (WebP/AVIF + srcset). Importar via `import x from '../assets/x.png'` |

#### 4.6.2 Nomenclatura

| Tipo | Convenção | Exemplo |
|---|---|---|
| Componentes Astro | PascalCase | `ReserveForm.astro`, `Navbar.astro` |
| Layouts Astro | PascalCase | `Base.astro` |
| Páginas (rotas) | kebab-case | `index.astro`, `404.astro`, `politica-privacidade.astro` |
| Módulos TS | kebab-case | `whatsapp.ts`, `reserve-form.ts`, `menu-tabs.ts` |
| Arquivos de conteúdo (YAML) | kebab-case | `moscow-mule.yml`, `bar-glamouroso.yml` |
| Pastas | kebab-case | `src/content/drinks/`, `public/vendor/` |
| Classes CSS | kebab-case (BEM-light) | `.bar-card`, `.hero-content`, `.menu-tab.is-active` |
| Estados CSS | prefixo `is-` | `.is-active`, `.is-disabled`, `.is-hidden` |
| IDs / anchors | kebab-case | `#inicio`, `#estrutura`, `#reserva` |
| Variáveis JS/TS | camelCase | `phoneDisplay`, `whatsappUrl` |
| Constantes top-level | UPPER_SNAKE_CASE | `DEFAULT_PHONE`, `MIN_DATE_OFFSET_DAYS` |
| Types/Interfaces TS | PascalCase | `interface Lead`, `type Category` |
| Funções/métodos | camelCase, verbo no início | `buildWhatsappUrl`, `maskPhoneBR` |
| Mensagens de commit | Conventional Commits PT-BR | `feat(form): adiciona máscara BR de telefone` |
| Branches | kebab-case com prefixo | `feature/astro-migration`, `fix/menu-tabs-mobile` |

> **Preservação de classes Webflow:** classes geradas pelo Webflow (`w-nav`, `w-button`, `w-inline-block`, etc.) **NÃO** são renomeadas — o `webflow.js` IX2 depende delas para aplicar comportamento. Adicionar nossas classes ao lado, não substituir.

#### 4.6.3 Linter & Formatter — **Biome** (decisão 2026-05-04)

**Decisão fechada:** Biome (`@biomejs/biome`) cobre lint + format num único binário Rust. Justificativa em §4.6.3 v3 desta spec.

**Tooling lock-in:**

| Item | Valor |
|---|---|
| Pacote | `@biomejs/biome` (latest stable, `^2.0.0` ou mais recente) |
| Config | `biome.json` na raiz |
| Pre-commit | `simple-git-hooks` (≈0 deps) + `lint-staged` |
| Comandos npm-script | `pnpm lint` (apenas verifica) · `pnpm format` (formata e escreve) · `pnpm check` (lint + format-check, dry-run usado no CI) |

**`biome.json` esperado:**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "files": {
    "ignore": ["dist", "node_modules", ".astro", "_archive", "public/webflow.js", "public/vendor", "public/admin/index.html"]
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
    "formatter": { "quoteStyle": "single", "semicolons": "always", "trailingCommas": "none" }
  }
}
```

> **Por que ignorar `public/webflow.js` e `public/vendor`:** código terceirizado não-formatado. Biome levantaria centenas de "erros" de estilo que não são nossos.
> **Por que ignorar `public/admin/index.html`:** HTML de 6 linhas que carrega script Sveltia; sem código nosso pra lintar.

**Pre-commit (via `simple-git-hooks` + `lint-staged`):**

```json
// trecho do package.json
{
  "scripts": {
    "lint": "biome lint .",
    "format": "biome format --write .",
    "check": "biome check .",
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

**Limitação conhecida:** Biome 2.x ainda não lê `<script>` embutido em `.astro` files com 100% de fidelidade. Workaround:
- Mover lógica não-trivial para `src/scripts/*.ts` (regra já estabelecida em §4.6.1)
- Manter `<script>` em `.astro` curto (geralmente 1-3 linhas: import + init)

**Caminho de upgrade:** se um dia Biome bloquear (ex.: regras de a11y específicas), migrar para ESLint + Prettier é ~2h: instalar `eslint`, `@typescript-eslint`, `eslint-plugin-astro`, `prettier`, `eslint-config-prettier`, deletar `biome.json`, ajustar scripts e pre-commit. Documentar no `CLAUDE.md` que regras Biome `correctness.noUnusedVariables` e `suspicious.noExplicitAny` viraram regras ESLint equivalentes.

#### 4.6.4 Guardrails — `docs/patterns/` + Context7 MCP + CLAUDE.md

**Problema:** quando uma LLM (Claude Code, Copilot, etc.) edita código deste projeto no futuro, ela pode produzir código que compila mas não segue as convenções acima — usando padrões antigos do Astro v3, ignorando Outfit, aplicando cor rosa wholesale, quebrando classes Webflow. Falha silenciosa.

**Solução:** três camadas de guardrails:

**Camada 1 — `docs/patterns/<stack>.md` (curados manualmente)**

Cada arquivo documenta padrões específicos do stack escolhido para este projeto, com **exemplos `✅ Bom` vs `❌ Ruim`**. Lista de patterns a criar:

| Arquivo | Cobre |
|---|---|
| `docs/patterns/astro.md` | Content Collections v5 (loaders, schemas Zod), Image API, slots, hydration directives (`is:inline`, `client:load`), `getEntry` vs `getCollection` |
| `docs/patterns/typescript.md` | TS strict, Zod schemas, sem `any`, sem `as unknown as`, types de domínio centralizados |
| `docs/patterns/sveltia-cms.md` | Mapeamento schema CMS ↔ Zod schema, widgets disponíveis, `local_backend`, OAuth via Worker |
| `docs/patterns/cloudflare-workers.md` | OAuth proxy padrão Decap/Sveltia, secrets via wrangler, sem armazenar tokens server-side |
| `docs/patterns/motion.md` | Build mini (2.3kb), `inView` + `animate`, respeito a `prefers-reduced-motion`, evitar `motion` build completo |
| `docs/patterns/css.md` | Outfit como única fonte, paleta IDV (preto+rosa+laranja+branco), default branco neutro, classes Webflow inalteradas, kebab-case, BEM-light |
| `docs/patterns/forms.md` | Honeypot, Turnstile como deterrente, validação HTML5 + JS, máscara client-side, redirect WhatsApp |
| `docs/patterns/git.md` | Conventional Commits PT-BR, branches kebab-case, no force-push em `main`, no `--no-verify` |
| `docs/patterns/seo-a11y.md` | Meta tags, OG, JSON-LD LocalBusiness, contraste 4.5:1 mínimo, `:focus-visible`, alt-text obrigatório |

Cada arquivo segue a estrutura:

```markdown
# <Stack> patterns para Cinnamon Drinks

> Quando trabalhar com <stack> neste projeto, consulte estes padrões.
> Última revisão: 2026-MM-DD · Versão da stack: x.y.z

## Princípios
- ...

## ✅ Bom
\`\`\`<linguagem>
// exemplo idiomático
\`\`\`
**Por quê:** ...

## ❌ Ruim
\`\`\`<linguagem>
// anti-pattern comum em LLMs
\`\`\`
**Problema:** ...
```

**Camada 2 — Context7 MCP para gerar/atualizar patterns**

Os arquivos `docs/patterns/*.md` são **gerados a partir do Context7 MCP** (que indexa docs oficiais das libs em tempo real) + curadoria manual com decisões específicas deste projeto. Comando padrão para refresh:

```
Use Context7 to fetch latest <lib> docs, summarize the patterns, then merge with project-specific decisions from this spec.
```

> Context7 substitui a necessidade de "lembrar" qual versão da API usar — ele consulta docs vivas. Ideal para Astro v5 (mudou bastante de v4), Motion (renomeado de Motion One), Sveltia (sucessor recente do Decap).

**Cadência:** revisar patterns trimestralmente OU ao bumpar major de qualquer stack.

**Camada 3 — `CLAUDE.md` na raiz do repo**

Arquivo `CLAUDE.md` (gerado por `/init` do Claude Code ou manualmente) instrui LLMs a consultar os patterns relevantes ANTES de editar código. Estrutura mínima:

```markdown
# Cinnamon Drinks — Instruções para LLMs

## Antes de qualquer mudança de código

1. Identifique o(s) stack(s) afetado(s) na mudança
2. Leia o(s) arquivo(s) correspondentes em `docs/patterns/`
3. Verifique se existem decisões na spec `docs/superpowers/specs/2026-05-01-...md` sobre o componente em questão
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
- Conteúdo editável só vive em `src/content/*.yml`, nunca hardcoded em componentes

## Comandos comuns

- Dev: `pnpm dev` (terminal 1) + `pnpm cms:proxy` (terminal 2 quando editar via /admin)
- Build: `pnpm build`
- Tests: `pnpm test`
- Type check: `pnpm check`
- Lint/format: `pnpm lint` / `pnpm format` (após decisão Biome vs ESLint)
```

**Geração:** após decisão final do linter (§4.6.3), rodar `/init` no Claude Code OU criar manualmente. Adicionado como Task na Phase 1 do plano de implementação.

---

## 5. Estrutura de pastas (Astro)

```
cinnamon-drinks/
├── public/
│   ├── admin/
│   │   ├── index.html              # Sveltia CMS shell
│   │   └── config.yml              # collections + media/preview config
│   ├── videos/                     # vídeos auto-hospedados (≤10MB cada, máx 3)
│   ├── vendor/
│   │   └── jquery-3.5.1.min.js     # jQuery local (elimina dep do CDN Webflow)
│   ├── webflow.js                  # IX2 runtime + animações (do export original)
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/                     # imagens fonte (otimizadas pelo Astro no build)
│   │   ├── bars/
│   │   ├── drinks/                 # frames extraídos dos vídeos
│   │   ├── team/
│   │   └── hero/
│   ├── components/
│   │   ├── Navbar.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Team.astro
│   │   ├── Menu.astro
│   │   ├── Bars.astro
│   │   ├── Included.astro
│   │   ├── Testimonials.astro
│   │   ├── ReserveForm.astro
│   │   └── Footer.astro
│   ├── content/                    # dados publicados pelo Sveltia (YAML/MD)
│   ├── content.config.ts           # Astro Content Collections — loaders + schemas Zod (v5+)
│   ├── layouts/
│   │   └── Base.astro              # carrega CSS, fontes, jQuery local, webflow.js
│   ├── pages/
│   │   ├── index.astro             # a única landing
│   │   └── 404.astro               # página de erro customizada
│   ├── styles/
│   │   ├── global.css              # extraído de css/cinnamon-drinks.webflow.css
│   │   └── new-sections.css        # estilos das seções novas (Bars, Included)
│   └── scripts/
│       └── motion.ts               # animações novas (Motion ou CSS API)
├── _archive/                       # páginas do template não publicadas (referência)
│   ├── home-2.html
│   ├── menus-2.html
│   ├── menus/menu-{2,3,4}.html
│   ├── detail_items.html
│   ├── detail_menu-categories.html
│   ├── ckhdfshzf.html
│   ├── template/
│   └── 401.html
├── docs/
│   ├── superpowers/
│   │   ├── specs/2026-05-01-cinnamon-drinks-design.md      # este arquivo
│   │   └── plans/2026-05-04-cinnamon-drinks-implementation.md
│   ├── brandbook/
│   │   ├── IDENTIDADE_VISUAL.md                           # IDV transcrita
│   │   └── Brand Book _ Cinnamon Drinks.pdf
│   ├── patterns/                                          # guardrails LLM (§4.6.4)
│   │   ├── astro.md
│   │   ├── typescript.md
│   │   ├── sveltia-cms.md
│   │   ├── cloudflare-workers.md
│   │   ├── motion.md
│   │   ├── css.md
│   │   ├── forms.md
│   │   ├── git.md
│   │   └── seo-a11y.md
│   └── MANUAL_DE_USO.md                                   # 1-pager para Roger
├── CLAUDE.md                       # instruções para LLMs (§4.6.4)
├── astro.config.mjs
├── package.json
├── pnpm-lock.yaml
├── .npmrc                          # configura comportamento pnpm
├── biome.json                      # lint + format (decisão §4.6.3, 2026-05-04)
└── README.md
```

---

## 6. Schemas do Sveltia CMS

`public/admin/config.yml` define o que Roger pode editar. Sveltia mantém **alta compatibilidade com o formato Decap/Netlify CMS**, então o config aqui usa exatamente o mesmo schema (a migração futura entre os dois é trivial).

**Shell em `public/admin/index.html`:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Cinnamon Drinks — Painel</title></head>
<body>
  <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
</body>
</html>
```

### 6.1 Collections planejadas

```yaml
backend:
  name: github
  repo: <owner>/<repo>      # TBD após criação do repo
  branch: main
  base_url: https://cms-oauth.<workers.dev>  # CF Worker OAuth proxy
  commit_messages:
    create: 'CMS: cria {{collection}} "{{slug}}"'
    update: 'CMS: atualiza {{collection}} "{{slug}}"'
    delete: 'CMS: remove {{collection}} "{{slug}}"'
    uploadMedia: 'CMS: upload de mídia "{{path}}"'
    deleteMedia: 'CMS: remove mídia "{{path}}"'

# Modo dev local: rodar `pnpm dlx @sveltia/cms-proxy-server` em paralelo ao Astro dev
local_backend: true

publish_mode: simple
media_folder: src/assets/uploads
public_folder: /assets/uploads

collections:
  - name: site
    label: Configurações gerais
    files:
      - file: src/content/site.yml
        fields:
          - { name: brandName, label: Nome da marca, widget: string }
          - { name: tagline, label: Slogan, widget: string }
          - { name: address, label: Endereço admin, widget: text }
          - { name: businessHours, label: Horário comercial, widget: string }
          - { name: whatsappNumber, label: WhatsApp Comercial (formato 5535...), widget: string }
          - { name: email, label: Email, widget: string }
          - { name: instagram, label: Handle Instagram (sem @), widget: string }

  - name: hero
    label: Início (Hero)
    files:
      - file: src/content/hero.yml
        fields:
          - { name: heading, label: Título, widget: string }
          - { name: subheading, label: Subtítulo, widget: text }
          - { name: ctaText, label: Texto do botão, widget: string, default: "Reservar minha data" }
          - name: gallery
            label: Galeria
            widget: list
            fields:
              - { name: type, widget: select, options: [image, video] }
              - { name: src, widget: file }
              - { name: alt, widget: string }

  - name: about
    label: Sobre
    files:
      - file: src/content/about.yml
        fields:
          - { name: heading, widget: string }
          - { name: body, widget: markdown }
          - { name: foundedYear, widget: number }
          - { name: mainPhoto, widget: image }

  - name: team
    label: Equipe
    files:
      - file: src/content/team.yml
        fields:
          - { name: heading, widget: string }
          - { name: intro, widget: text }
          - name: members
            widget: list
            fields:
              - { name: name, widget: string }
              - { name: role, widget: string }
              - { name: photo, widget: image }
              - { name: certifications, widget: list, required: false }

  - name: drinks
    label: Menu — Drinks (cada drink um arquivo)
    folder: src/content/drinks
    create: true
    slug: '{{slug}}'
    fields:
      - { name: name, widget: string }
      - { name: category, widget: select, options: ["Caip's", "Clássicos", "Gin & Whisky", "Especiais"] }
      - { name: ingredients, widget: list }
      - { name: image, widget: image, required: false }
      - { name: order, widget: number, hint: "Ordem dentro da categoria" }

  - name: bars
    label: Estrutura — Configurações de Bar
    folder: src/content/bars
    create: true
    slug: '{{slug}}'
    fields:
      - { name: name, widget: string }     # ex: Tropical, Glamouroso
      - { name: description, widget: text }
      - { name: gallery, widget: list, fields: [{ name: src, widget: image }, { name: alt, widget: string }] }
      - { name: order, widget: number }

  - name: included
    label: Estrutura — Itens Inclusos
    files:
      - file: src/content/included.yml
        fields:
          - name: columns
            widget: list
            min: 3
            max: 3
            fields:
              - { name: title, widget: string }   # ex: Bar e Estrutura
              - { name: items, widget: list }     # lista de strings

  - name: testimonials
    label: Depoimentos
    folder: src/content/testimonials
    create: true
    slug: '{{author}}'
    fields:
      - { name: author, widget: string }
      - { name: eventType, widget: string, required: false }
      - { name: quote, widget: text }
      - { name: photo, widget: image, required: false }

  - name: form
    label: Reserva (textos do formulário)
    files:
      - file: src/content/form.yml
        fields:
          - { name: heading, widget: string, default: "Reservar minha data" }
          - { name: ctaButton, widget: string, default: "Reservar minha data" }
          - { name: successMessage, widget: text }
          - { name: errorMessage, widget: text }

  - name: pricing
    label: Tabela de Preços (referência)
    files:
      - file: src/content/pricing.yml
        fields:
          - { name: pricePerGuest, widget: string, hint: "Ex: R$ 43,95" }
          - { name: insurancePerGuest, widget: string, hint: "Ex: R$ 2,25" }
          - name: vodkaUpgrades
            widget: list
            fields:
              - { name: name, widget: string }
              - { name: extraPrice, widget: string }
          - { name: bartenderRatio, widget: string, default: "1 bartender a cada 30 convidados" }
          - { name: disclaimer, widget: text, default: "Bares personalizados a consultar" }
```

### 6.2 Política de validação

- Todos os textos têm `required: true` exceto onde marcado
- Imagens passam por verificação de dimensão mínima no painel (1200×800 mínimo recomendado)
- Build do Astro **falha** se algum schema quebrar — log visível no painel da Cloudflare Pages

### 6.3 Astro Content Collections — lado leitor (Astro v5)

A partir do Astro v5, o config das Content Collections fica em `src/content.config.ts` (não mais `src/content/config.ts`) e cada collection precisa de um **loader explícito** (`glob` ou `file`).

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// Arquivos YAML únicos → file()
const site     = defineCollection({ loader: file('src/content/site.yml'),     schema: z.object({ /* ... */ }) });
const hero     = defineCollection({ loader: file('src/content/hero.yml'),     schema: z.object({ /* ... */ }) });
const about    = defineCollection({ loader: file('src/content/about.yml'),    schema: z.object({ /* ... */ }) });
const team     = defineCollection({ loader: file('src/content/team.yml'),     schema: z.object({ /* ... */ }) });
const included = defineCollection({ loader: file('src/content/included.yml'), schema: z.object({ /* ... */ }) });
const form     = defineCollection({ loader: file('src/content/form.yml'),     schema: z.object({ /* ... */ }) });
const pricing  = defineCollection({ loader: file('src/content/pricing.yml'),  schema: z.object({ /* ... */ }) });

// Folders (1 arquivo = 1 entrada) → glob()
const drinks       = defineCollection({ loader: glob({ pattern: '**/*.{yml,md}', base: './src/content/drinks' }),       schema: z.object({ /* ... */ }) });
const bars         = defineCollection({ loader: glob({ pattern: '**/*.{yml,md}', base: './src/content/bars' }),         schema: z.object({ /* ... */ }) });
const testimonials = defineCollection({ loader: glob({ pattern: '**/*.{yml,md}', base: './src/content/testimonials' }), schema: z.object({ /* ... */ }) });

export const collections = { site, hero, about, team, included, form, pricing, drinks, bars, testimonials };
```

Schemas Zod completos (mapeando 1-pra-1 com os widgets do §6.1) são definidos no plano de implementação. **Build falha** se algum arquivo violar o schema — log visível no painel da Cloudflare Pages.

---

## 7. Páginas do template — destino

Conforme inventário cruzado em discovery:

| Página do export Webflow | Destino |
|---|---|
| `index.html` | 🟢 Base da landing (Início, Equipe, Menu, Depoimentos, Reserva) |
| `about.html` | 🟡 Componentes mineirados (Sobre) |
| `menus/menu-1.html` | 🟡 Categorias para a seção Menu |
| `reserve.html` | 🟡 Layout para a seção Reserva |
| `404.html` | 🟡 Customizada (cortesia visual) |
| `home-2.html` | 🔴 `_archive/` (variante redundante) |
| `menus-2.html` | 🔴 `_archive/` (placeholder) |
| `menus/menu-{2,3,4}.html` | 🔴 `_archive/` (variantes) |
| `detail_items.html`, `detail_menu-categories.html` | 🔴 `_archive/` (CMS templates Webflow) |
| `ckhdfshzf.html` | 🔴 `_archive/` (contato — redundante) |
| `template/*.html` | 🔴 `_archive/` (housekeeping) |
| `401.html` | 🔴 `_archive/` (sem auth próprio) |

---

## 8. Layout e seções

### 8.1 Navbar (sticky)

> Revisada 2026-05-04 (Draft v6) com base no template Webflow original e fluxo de scroll natural.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  [LOGO]  INICIO · SOBRE · ESTRUTURA · [RESERVA] · CONTATO    [ MENU▾ ]  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Desktop (≥992px) — 5 anchor links + 1 button:**

| Posição | Label | Anchor / Destino | Estilo |
|---|---|---|---|
| Esq | (logo SVG sublogo Cinnamon) | `#inicio` | Sublogo gradient rosa→laranja, fundo transparente |
| 1 | INICIO | `#inicio` | nav-link (texto simples) |
| 2 | SOBRE | `#sobre` | nav-link |
| 3 | ESTRUTURA | `#estrutura` | nav-link |
| 4 | RESERVA | `#reserva` | **bordered-button** (oval bordered branco) |
| 5 | CONTATO | `#contato` (id no `<footer>`) | nav-link |
| Dir | MENU ▾ | TBD (ver nota abaixo) | **button btn-small** (oval bordered) |

**Decisão posterior — botão MENU à direita:**
Manter o botão Webflow no canto direito como placeholder visual. Funcionalidade do dropdown a ser definida após Phase 8: a ideia é linkar para variações de menu de drinks correlacionadas com cada tipo de bar (ex.: menu Glamouroso, menu Tropical, etc.). Conversa fica em aberto.

**Mobile (<992px):**
- Logo + burger menu (hamburger)
- Drawer (slide-in) com 5 anchors: Inicio · Sobre · Estrutura · Reserva · Contato
- "Reservar minha data" como CTA bottom-sticky (também `#reserva`)

**Notas técnicas:**
- Layout reaproveitado de `index.html` (`nav-container`, `drawer-menu`)
- Estrutura DOM idêntica ao template Webflow original — todos `data-w-id` preservados para IX2 funcionar
- Anchor `#contato` precisa de `id="contato"` adicionado no `<footer>` (Footer.astro)
- Logo SVG (`sublogo-secundaria.svg`) substitui o `Logo.svg` do template

### 8.2 Seção 1 — Início (Hero) 🟡

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  [galeria de mídia rotativa: vídeos hero (máx 3) + fotos]      │
│                                                                  │
│      SOFISTICAÇÃO & EXPERIÊNCIA                                 │
│      Coquetelaria de alto padrão para casamentos,               │
│      formaturas e recepções desde 2018                          │
│                                                                  │
│              [ RESERVAR MINHA DATA ]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Conteúdo:** `hero.yml` (heading, subheading, ctaText, gallery)
- **Galeria:** vídeos auto-play em loop muted + fotos. Lazy-load. No mobile, vídeo único ou vídeo único + 2 fotos.
- **CTA:** `wa.me/5535998224721?text=Olá!%20Vim%20pelo%20site%20da%20Cinnamon` (mensagem genérica — quem clica daqui não preencheu form)
- **Animação (W):** `tubes-block` laterais sobem/descem na entrada (heredado)
- **Decisão de design para vídeo vertical 4K:** TBD-2 — letterbox, crop ou fullscreen com blur lateral
- **Pendente Roger:** TBD-3 — foto principal hero alta-res, TBD-4 — confirmar 3 vídeos selecionados

### 8.3 Seção 2 — Sobre 🟢

**Layout:** template "sticky section full-height" — texto à esquerda, foto à direita.

- **Conteúdo:** `about.yml` — texto base extraído do PDF de proposta (ajustar tom):
  > Desde 2018, a Cinnamon é referência em coquetelaria de alto padrão, oferecendo soluções completas de bar para eventos como casamentos, formaturas e recepções exclusivas. Fundada por Roger, com mais de 16 anos de experiência, a empresa se destaca pela equipe altamente qualificada certificada por Moisés Barros.
- **Animação (W):** fade-in/slide-up no scroll
- **Pendente Roger:** TBD-5 — foto principal (Roger trabalhando ou ambiente premium)

### 8.4 Seção 3 — Equipe 🟡

**Layout:** intro centralizada + grid de cards (foto, nome, função).

- **Conteúdo:** `team.yml` — membros como lista
- **Texto fixo:** "Bartenders certificados por Moisés Barros — referência nacional em coquetelaria"
- **Animação (M):** Motion — cards entram em sequência (stagger)
- **Já temos:** 1 foto de uniforme (`_MG_0065.jpg`) — define o look
- **Pendente Roger:** TBD-6 — fotos da equipe completa, nomes, cargos, certificações

### 8.5 Seção 4 — Menu 🟡

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│              CARDÁPIO DE DRINKS                                  │
│                                                                  │
│   [ Caip's ] [ Clássicos ] [ Gin & Whisky ] [ Especiais ]      │ ← tabs
│                                                                  │
│   ┌────────────────────┐  ┌────────────────────┐                │
│   │ MOSCOW MULE        │  │ MOJITO             │                │
│   │ vodka, açúcar,     │  │ rum, limão,        │                │
│   │ limão, ginger      │  │ hortelã, sprite    │                │
│   │ [frame extraído]   │  │ [frame extraído]   │                │
│   └────────────────────┘  └────────────────────┘                │
│                                                                  │
│   *Sugerimos marcar degustação para customizar perfis           │
│   💰 R$XX,XX por convidado (orçamento exemplo)                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Conteúdo:** folder `drinks/` (cada drink um arquivo .md no Sveltia) + `pricing.yml`
- **Tabs:** filtragem client-side por categoria, sem reload
- **Imagens:** **frames estáticos extraídos dos 41 vídeos via ffmpeg** no build
- **Drinks atuais (do PDF, confirmar com Roger):**
  - **Caip's:** Caipirinha, Caipvodka (sabores: abacaxi, limão, maracujá, morango)
  - **Clássicos:** Moscow Mule, Mojito, Piña Colada, Sex on the Beach, Ipanema, Daiquiri, Lagoa Azul, Dream Coffee
  - **Gin & Whisky:** Negroni, GT & Especiarias, Bee's Knees, Pinicilin, Cosmopolitan
  - **Especiais:** Aperol Spritz, Maracujack, Saquerita, Spritz Grape, Bramble
- **Animação (W) + (M):** fade-in scroll + transição de tabs
- **Pendente Roger:** TBD-7 — confirmar lista de drinks padrão + TBD-8 — rotular vídeos por drink

### 8.6 Seção 5+6 — Estrutura 🔴 NOVA

> **Decisão de design:** as cláusulas contratuais 5 (Configurações de Bar) e 6 (O que Está Incluso) tratam da mesma temática — a infraestrutura física do evento. Foram unificadas em uma única seção `#estrutura` com **dois blocos internos**, mantendo todo o conteúdo previsto no contrato. Roger continua editando os dois conjuntos de dados separadamente no Sveltia (collections `bars` e `included` permanecem distintas).

**Layout geral:**

```
┌─────────────────────────────────────────────────────────────────┐
│                       ESTRUTURA                                  │
│                                                                  │
│   [Bloco A] Configurações de Bar — grid de 5 cards              │
│   ── divisor sutil ──                                            │
│   [Bloco B] Mobília e Itens Inclusos — 3 colunas                │
└─────────────────────────────────────────────────────────────────┘
```

**Anchor única:** `#estrutura` aponta para o início do Bloco A. Bloco B é alcançado por scroll natural; ambos compartilham o mesmo `<section>` semanticamente, com `<h2>` "Estrutura" + dois `<h3>` internos.

#### 8.6.1 Bloco A — Configurações de Bar (cláusula 5)

**Layout:** grid de 5 cards (responsivo 5/3/1 colunas).

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
│  [foto]  │ │  [foto]  │ │  [foto]  │ │  [foto]  │ │ [foto] │
│ TROPICAL │ │  INTERNO │ │  RÚSTICO │ │GLAMOUROSO│ │MODERNO │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘
```

- **Conteúdo:** folder `bars/` no Sveltia (5 entradas)
- **Click no card:** lightbox simples (CSS-only via `:target` ou Motion)
- **Disclaimer:** "Bar 360° tem regra de mobília própria — consultar"
- **Animação (M):** Motion — hover scale, stagger no scroll
- **Já temos:**
  - Bar Glamouroso: 6 ângulos (`DSC00343/390/393/394/395/396`)
  - Bar Moderno (espelhado): 1 foto (`DSC00380`)
  - Bar verde (provável Interno): 1 foto (`DSC00330`)
- **Pendente Roger:** TBD-9 — fotos de Tropical e Rústico + TBD-10 — confirmar nomenclatura (verde = Interno?)

#### 8.6.2 Bloco B — Mobília e Itens Inclusos (cláusula 6)

**Layout:** 3 colunas com ícone + título + lista (responsivo: stack vertical no mobile).

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   [icon]       │  │   [icon]       │  │   [icon]       │
│ Bar e Estrutura│  │Drinks e Insumos│  │ Equipe         │
│                │  │                │  │                │
│ • Canecas      │  │ • Materiais    │  │ • Bartenders   │
│ • Copos        │  │ • Drinks não   │  │ • Barback      │
│ • Expositores  │  │   alcoólicos   │  │                │
│ • Mobília      │  │ • Descartáveis │  │                │
│ • Utensílios   │  │                │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
```

- **Conteúdo:** `included.yml` (3 colunas com items)
- **Ícones:** Lucide ou Heroicons (free); substituir quando IDV chegar
- **Animação (M):** Motion — colunas descem com pequeno delay
- **Já temos:** todas as listas (do PDF)
- **Pendente Roger:** TBD-11 — revisão final dos textos

### 8.7 Seção 7 — Depoimentos 🟢

**Layout:** carousel reviews-container do template (animação horizontal infinita).

- **Conteúdo:** folder `testimonials/` (autor, evento, citação)
- **Já temos (do PDF):**
  - Caroline (festa)
  - Vanessa e Ronaldo (casamento)
- **Animação (W):** scroll-banner horizontal infinito + fade entre depoimentos
- **Pendente Roger:** TBD-12 — +2 a +4 depoimentos extras (recomendado para carousel não ficar curto)

### 8.8 Seção 8 — Reserva 🟡

**Layout:** foto à esquerda + formulário à direita (mantido do template `reserve.html`).

**Campos do formulário:**

| Campo | Tipo | Obrigatório | Notas |
|---|---|---|---|
| Nome | text | ✅ | |
| Telefone (WhatsApp) | tel | ✅ | máscara `(XX) XXXXX-XXXX` |
| Email | email | ❌ | validar formato se preenchido |
| Tipo de evento | select | ✅ | opções: Formatura, Casamento, Aniversário, Corporativo, Outro |
| Data do evento | date | ✅ | mínimo: hoje + 30 dias (configurável) |
| Convidados | number | ✅ | mínimo 1, sem máximo |
| Local / cidade | text | ✅ | |
| Duração estimada | text | ❌ | placeholder "ex: 6 horas" |
| Mensagem | textarea | ❌ | placeholder "Detalhes adicionais que ajudem no orçamento" |

**Submit flow:**

1. Validação client-side (HTML5 + JS para campos custom)
2. **Cloudflare Turnstile** valida (invisível)
3. POST para Formspree → email para `cinnamondrinks@gmail.com`
4. Em paralelo: redireciona para WhatsApp Comercial com mensagem formatada

**Mensagem formatada do WhatsApp:**

```
Olá! Sou {Nome}, gostaria de orçamento para {Tipo de evento}.

📅 Data: {Data}
👥 Convidados: {N}
📍 Local: {Cidade}
⏱️ Duração: {Duração ou "a definir"}
📞 {Telefone}
✉️ {Email ou "—"}

{Mensagem opcional}
```

URL final:
```
wa.me/5535998224721?text=<mensagem URL-encoded>
```

- **Animação (W) + (M):** scroll-in + feedback hover/loading

### 8.9 Footer

```
┌─────────────────────────────────────────────────────────────────┐
│  CINNAMON DRINKS                                                │
│  Av. Doutor Silvio Menicucci, 2313 — Lavras/MG                  │
│  Atendimento: [TBD-13] (provável seg-sex 9h-18h)                │
│                                                                  │
│  📞 (35) 99822-4721  ✉️ cinnamondrinks@gmail.com                │
│  [Instagram @cinnamondrinks]                                    │
│                                                                  │
│  [Newsletter — opcional, ver TBD-14]                            │
│                                                                  │
│  © 2026 Cinnamon Drinks · CNPJ 60.606.470/0001-25               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Mídia — política e processamento

### 9.1 Vídeos

- **Máximo 3 vídeos no site** (provavelmente todos no Hero)
- Recebido bruto: 41 vídeos 4K vertical (2160×3840), ~15s, ~40MB cada
- **Compressão:** ffmpeg → 1080p (1080×1920), CRF 24, AAC 128k → meta ≤ 10MB cada
- **Hospedagem:** `public/videos/` (Cloudflare Pages CDN, free, sem branding)
- **Limite Cloudflare Pages:** 25MB por arquivo (com folga)
- **Apresentação no desktop:** TBD-2 (letterbox, crop ou fullscreen com blur lateral — recomendo fullscreen com blur)
- **Mobile:** vertical full-screen natural

### 9.2 Imagens estáticas

- **Origem:**
  - Fotos de bares (Drive, 11 atuais + futuras)
  - Frames extraídos dos vídeos de drinks (1 por drink, via ffmpeg em build/script)
  - Foto de uniforme + futuras de equipe
  - Logo + ícones (TBD)
- **Processamento:** Astro built-in (Sharp) gera WebP + AVIF, múltiplas resoluções para `srcset`
- **Padrão de uso (Astro v5+):** `<Image src={img} alt="..." layout="constrained" width={...} height={...} />` — gera `srcset`+`sizes` automaticamente. Para imagens hero usar `priority`, demais ficam com `loading="lazy"` por padrão
- **Lazy-load:** todas exceto Hero principal (LCP)

### 9.3 Animações (Caminho C híbrido)

| Onde | Tecnologia | Princípio |
|---|---|---|
| Seções herdadas (Início, Sobre, Equipe, Menu, Depoimentos, Reserva) | **webflow.js** + jQuery local | Mantém os `data-w-id` originais; carregados globalmente no `<Base.astro>` |
| Seção nova (Estrutura — Bloco A Bares + Bloco B Inclusos) | **Motion** build mini (`motion/mini`, **2.3kb**) como padrão; CSS scroll-driven animations apenas como progressive enhancement em browsers que suportam | Princípio igual ao IX2: rico no desktop, simples no mobile (media queries). Import: `import { animate } from "motion/mini"`. Pacote NPM se chama `motion` (renomeado a partir de "Motion One") |

**jQuery hospedado localmente** em `public/vendor/jquery-3.5.1.min.js` para eliminar dependência do CDN da Webflow (`d3e54v103j8qbb.cloudfront.net`).

---

## 10. Performance e acessibilidade

### 10.1 Budget Lighthouse (alvo)

| Categoria | Mínimo | Estratégia |
|---|---|---|
| Performance | ≥ 90 | Astro estático, imagens WebP/AVIF, lazy-load, vídeo Hero <10MB, fonts preload |
| Acessibilidade | ≥ 95 | alt-text obrigatório no schema, contraste mínimo 4.5:1, navegação por teclado |
| Best Practices | ≥ 95 | HTTPS, sem console errors, dependências atualizadas (exceto webflow.js/jQuery legacy) |
| SEO | ≥ 95 | meta tags, OG image, sitemap.xml, robots.txt, structured data (LocalBusiness) |

### 10.2 Acessibilidade

- Alt-text obrigatório em toda imagem (validado no schema do Sveltia)
- Contraste mínimo 4.5:1 (AA) — testar paleta final contra fundo
- Navegação por teclado funcional em form, navbar, lightbox
- `prefers-reduced-motion` desliga animações (Motion e webflow.js)
- ARIA labels onde necessário (burger menu, lightbox, form)

### 10.3 SEO

- `<title>`: "Cinnamon Drinks — Coquetelaria para casamentos, formaturas e eventos em Lavras/MG"
- Meta description com keyword principal "coquetelaria para eventos"
- OG image dedicada (1200×630)
- Structured data JSON-LD `LocalBusiness` com endereço, telefone, horário

---

## 11. Segurança e privacidade

### 11.1 LGPD

- Política de privacidade enxuta linkada no rodapé e no form
- Texto de consentimento abaixo do botão "Reservar minha data": "Ao enviar, você concorda em ser contatado(a) via WhatsApp/email para fechamento de orçamento."
- Dados coletados pelo Formspree são armazenados criptografados pela própria Formspree (validar política deles)
- Roger pode solicitar deleção de leads via dashboard Formspree

### 11.2 Anti-abuso (defesa em camadas)

| Camada | O que faz | Limitação |
|---|---|---|
| **Honeypot** | Campo escondido no form; se preenchido, descarta silenciosamente | Bloqueia bots ingênuos (a maioria) |
| **Cloudflare Turnstile** (managed widget) | Insere `<input hidden name="cf-turnstile-response">` com token no submit; bots intermediários veem o widget e desistem | **Token NÃO é validado server-side neste projeto** — Formspree (terceiro) não conhece a API do Turnstile. O widget atua como deterrente visual, não como gate real |
| **Antispam nativo do Formspree** | Filtra envios suspeitos antes de entregar o email | Incluído no free tier; 50/mês é o teto — qualquer abuso bate o teto rápido e Roger é alertado |

**Limitação aceita conscientemente:** validar o token do Turnstile exigiria um Cloudflare Worker proxy (`form → Worker valida Turnstile → repassa pro Formspree`). Decisão registrada em 02/05/2026: para o perfil de risco da empresa (negócio local em Lavras/MG, ~10–30 leads/mês esperados, sem alvo de ataque sofisticado), as 3 camadas acima cobrem ~99% dos bots; complexidade adicional de um Worker dedicado a forms não compensa.

**Caminho de upgrade futuro:** se abuso aparecer, adicionar Worker proxy entre form e Formspree é trabalho de ~30min sem mexer no frontend (apenas troca o `action=` do form). Documentado no manual de uso.

### 11.3 Auth do CMS

- Sveltia → CF Worker OAuth proxy → GitHub OAuth
- Apenas o usuário GitHub do Roger (após transferência do repo) consegue logar no `/admin`
- Recomendado: 2FA habilitado no GitHub (manual de uso explica)

---

## 12. Cronograma e marcos

Hoje: **2026-05-01** · Intermediária: **2026-05-20** (19 dias) · Final: **2026-06-20** (50 dias)

| Semana | Datas | Marco | Entregáveis |
|---|---|---|---|
| **S1** | 01-07/05 | **Spec aprovada** + setup | Spec final, repo criado, Astro+Sveltia rodando local, OAuth Worker no ar, CF Pages com deploy preview |
| **S2** | 08-14/05 | Migração base + 3 seções | Template Webflow → Astro, navbar, footer, Início, Sobre, Reserva (com placeholder) |
| **S3** | 15-19/05 | **Entrega intermediária 20/05** | 8 seções estruturadas com placeholder, responsividade desktop+mobile, Sveltia funcional |
| **S4** | 20-26/05 | Conteúdo real + assets | Substituir placeholders pelos textos/fotos/vídeos do Roger; testes end-to-end Formspree+WhatsApp |
| **S5** | 27/05-03/06 | Polimento + IDV | Aplicar logo/paleta/fontes oficiais (ou mood-board provisório); animações das seções novas |
| **S6** | 04-10/06 | QA + performance | Lighthouse 90+, cross-browser, mobile real, form com dados reais |
| **S7** | 11-19/06 | Buffer + DNS | Margem para retrabalho; configurar DNS no domínio do Roger; deploy em produção |
| **2026-06-20** | — | **Entrega final** | Site no ar em `<dominio>`, Roger logado no `/admin`, manual de 1 página entregue |

⚠️ **Cronograma assume Roger entrega assets até S3-S4.** Atrasos ativam cláusula 3.3.ii (prorrogação proporcional).

---

## 13. Riscos

| Risco | Prob | Impacto | Mitigação |
|---|---|---|---|
| Roger atrasa entrega de assets | 🟡 M | 🔴 Alto | Lista priorizada em `pending_gaps.md`; checkpoint semanal; cláusula 3.3.ii cobre |
| IDV oficial não existe / não chega | 🟡 M | 🟡 Médio | Mood-board provisório extraído das fotos do Drive (cobre + branco quente + petróleo); aprovação do Roger antes de S5 |
| Roger pede orçamento personalizado durante dev | 🟡 M | 🔴 Alto | Resposta padrão: "anotado, formalizamos como aditivo após entrega final"; **levar proposta de aditivo pronta** |
| Cloudflare OAuth Worker setup demora | 🟢 B | 🟢 Baixo | Tutorial pronto; ~30min |
| Build falha por dado inválido no Sveltia | 🟢 B | 🟡 Médio | Schema com validação + log de build na CF Pages |
| Roger esquece login do GitHub | 🟡 M | 🟡 Médio | Setup com 2FA SMS; manual de recovery |
| Domínio em registrar problemático | 🟢 B | 🟡 Médio | Fallback: subdomínio `<projeto>.pages.dev` enquanto resolve |
| Webflow IX2 + Motion inconsistentes nas mesmas seções | 🟢 B | 🟢 Baixo | Documentar timing/easing legacy; replicar nas seções novas |
| Cloudflare Pages — limites do free tier (25 MiB/arquivo, 20.000 arquivos/projeto, 20min/build, 500 builds/mês) | 🟢 B | 🟡 Médio | Compressão de vídeo monitorada (meta ≤10MB); 500 builds/mês = ~16/dia (folga p/ Roger editar via CMS); fallback R2 se algum arquivo passar 25 MiB |
| Volume de leads excede 50/mês Formspree | 🟢 B | 🟡 Médio | Plano pago US$10/mês ou migração para email backend próprio (CF Worker + Resend free) |

---

## 14. TBDs (aguardando respostas do cliente)

Coletados em `~/.claude/projects/.../memory/project_pending_gaps.md`. Resumo numerado para referência cruzada nesta spec:

| ID | TBD | Bloqueia? | Owner |
|---|---|---|---|
| ~~TBD-1~~ | ✅ **Parcial (2026-05-04):** `cinnamondrinks.com.br` no Registro.br · falta só DNS no cutover (ver §4.4 e memory `pending_domain.md`) | Cutover final | Roger |
| TBD-2 | Decisão UX vídeo vertical 4K no desktop (letterbox / crop / fullscreen blur) | Implementação Hero | Luis decide com base em mockup |
| TBD-3 | Foto principal Hero alta-res | Visual Hero | Roger |
| TBD-4 | Top 3 vídeos selecionados dos 41 | Visual Hero | Roger + Luis curando |
| TBD-5 | Foto Sobre | Visual seção 2 | Roger |
| TBD-6 | Fotos da equipe completa, nomes, certificações | Visual seção 3 | Roger |
| TBD-7 | Lista de drinks padrão confirmada | Conteúdo seção 4 | Roger |
| TBD-8 | Rotulagem dos 41 vídeos por drink | Visual seção 4 | Roger |
| TBD-9 | Fotos do Bar Tropical e Bar Rústico | Visual seção 5 | Roger |
| TBD-10 | Confirmar nomenclatura dos bares (verde = Interno?) | Visual seção 5 | Roger |
| TBD-11 | Revisão final dos textos da seção Inclusos | Conteúdo seção 6 | Roger |
| TBD-12 | +2 a +4 depoimentos extras | Conteúdo seção 7 | Roger |
| TBD-13 | Horário comercial para footer | Footer | Roger |
| TBD-14 | Newsletter sim/não? (Q8b) | Footer + form extra | Roger |
| ~~TBD-15~~ | ✅ **Parcial (2026-05-04):** PNGs em `images/logo/` (6 variantes); SVGs pendentes com Giovanna — não bloqueia | — | Giovanna |
| ~~TBD-16~~ | ✅ **Resolvido (2026-05-04):** brandbook oficial integrado em §4.5 e `docs/brandbook/IDENTIDADE_VISUAL.md` | — | — |
| TBD-17 | Validação do prêmio "pesquisa Sales" | Risco reputacional/legal | Roger |
| TBD-18 | Dropdown do botão MENU na navbar — linkar variações de menu por tipo de bar (Glamouroso/Tropical/etc); decidir abordagem (filtro client-side / sub-âncoras / modal) e schema bar↔drinks | Funcionalidade navbar | Luis + Roger |

---

## 15. Critérios de aceitação para entrega final

- [ ] Todas as 8 seções publicadas com conteúdo real (sem placeholders)
- [ ] Form de captação testado: lead chega no email + WhatsApp abre com mensagem formatada
- [ ] `/admin` funcional com OAuth GitHub do Roger
- [ ] Lighthouse ≥ 90 nas 4 categorias
- [ ] Domínio `<TBD-1>` apontado para Cloudflare Pages com HTTPS funcionando
- [ ] Site funciona em Chrome, Safari, Firefox (desktop e mobile real)
- [ ] Manual de uso (1 página) entregue ao Roger
- [ ] Repositório transferido para conta GitHub do Roger
- [ ] 3ª parcela paga (R$ 2.000)

---

## 16. Apêndices

### A. Assets já recebidos

**1ª e 2ª levas (01/05/2026):**

- **Bares (11 fotos):** 3 configurações distintas identificadas
  - Bar verde veludo (provável Interno): `DSC00330`
  - Bar branco capitonê (provável Glamouroso): `DSC00343` + 5 outros ângulos
  - Bar espelhado (provável Moderno): `DSC00380`
  - Detalhes/macros: `DSC00336`, `DSC00386`, `DSC00391`
- **Uniformes (1 foto):** look oficial (colete bege + gravata borboleta) — `_MG_0065`
- **Vídeos de drinks (41):** 4K vertical, ~15s cada, 1.6GB total — sem rótulos

**3ª leva — Identidade Visual (04/05/2026, via Giovanna Evaristo):**

- **Brandbook PDF:** `docs/brandbook/Brand Book _ Cinnamon Drinks.pdf` (transcrito em `docs/brandbook/IDENTIDADE_VISUAL.md`)
- **Logos (6 PNGs em `images/logo/`):** `logo-principal.png`, `logo-secundaria.png`, `sublogo-principal.png`, `sublogo-secundaria.png`, `marca-dagua-preta.png`, `marca-dagua-colorida.png`
- **Pendente:** versões SVG dos 6 logos (Giovanna ciente, sem prazo definido)

### B. Identidade Visual oficial (atualização 2026-05-04)

> Substitui o mood-board provisório que estava aqui na v1 (cobre/rose-gold #B87333). Brandbook oficial chegou em 04/05.

- **Cores:** preto `#000000` · rosa `#F26294` · laranja `#F2662B` · branco `#ffffff`
- **Gradiente oficial:** `linear-gradient(90deg, #F26294 → #F2662B)` — uso pontual
- **Tipografia:** Outfit (Bold 700 primária + Thin 100 secundária) — Google Fonts CDN, substitui Nexa do brandbook por questão de licença
- **Logos:** 6 variantes PNG em `images/logo/`; SVGs em produção pela Giovanna
- **Política de UI:** branco neutro como default em interativos; rosa/laranja apenas em destaques pontuais (ver memory `feedback_neutral_default_colors.md`)
- **Atributos de marca:** Modernidade · Jovialidade · Dinamicidade · Sofisticação

> **Decisão registrada (2026-05-04):** o brandbook lista `#00324E` para a cor escura mas a apresenta visualmente como preto. O usuário escolheu `#000000` puro para máxima fidelidade visual ao material entregue. Não usar `#00324E`.

Detalhes completos em `docs/brandbook/IDENTIDADE_VISUAL.md` e §4.5 desta spec.

### C. Referências de memória (estado atual)

Memory dir: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/`

- `brand_identity_reference.md` — IDV: paleta, tipografia, logos (resumo operacional)
- `font_outfit_decision.md` — decisão Outfit substitui Nexa (com motivação de licença)
- `pending_logo_svgs.md` — SVGs aguardando entrega da Giovanna
- `feedback_neutral_default_colors.md` — política de UI: branco como default, não rosa/laranja
- `workflow_repo_not_webflow.md` — fluxo de edição: VS Code direto no repo, não no Webflow Designer

> Memorias da v1 do spec (`project_cinnamon_drinks.md`, `project_cinnamon_content.md`, `project_meeting_summary.md`, `project_assets_drive.md`, `project_pending_gaps.md`, `project_decisions_locked.md`) foram consolidadas no spec ao longo de 01-04/05; conteúdo agora vive no próprio spec e nos memories acima.

### D. Texto do contrato

Cláusulas críticas referenciadas:
- 1.1 — objeto (1 landing page)
- 1.2 — 8 seções fechadas
- 1.4 — 3 rodadas de ajuste pós-entrega
- 1.5 — aditivo para mudanças de escopo
- 1.6 — conteúdos por conta da CONTRATANTE
- 2.5/2.6 — custos de infra por conta da CONTRATANTE
- 3.3.ii — prorrogação por atraso da CONTRATANTE
- 4.1.e — entrega de código-fonte em repositório indicado pela CONTRATANTE
- 6.1 — propriedade intelectual após quitação

---

**FIM DA SPEC**
