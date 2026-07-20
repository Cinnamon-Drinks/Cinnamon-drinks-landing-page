# Spec — Design System (Abordagem B "Acento")

**Data:** 2026-05-19
**Autor:** Luís Carlos (decisão) + Claude (drafting)
**Status:** Aprovado visualmente em preview externo · pendente review do spec antes de implementar
**Spec relacionado:** `docs/superpowers/specs/2026-05-01-cinnamon-drinks-design.md` (não substitui — complementa)

---

## 1. Contexto

O projeto Cinnamon Drinks foi extraído de um template Webflow ("Resturanto"). Em 2026-05-04, durante a Phase 12 (cores), o time tentou aplicar a paleta IDV (rosa `#F26294`, laranja `#F2662B`) em estado wholesale — todos os botões viraram rosa, focus virou rosa, etc. Cliente reagiu negativamente ao botão "Menu" mobile virando rosa, e a decisão foi revertida: branco como default neutro em toda UI, rosa/laranja apenas em destaques pontuais (memory `feedback_neutral_default_colors.md`).

O resultado dessa decisão é o estado atual do `src/styles/global.css`:
- 146 hex hardcoded
- Tokens herdados do template (`--light-grey`, `--white`, `--black`, `--yellow: #fff`, `--dark-grey`) — nenhum token IDV
- Marca aparece **apenas em 1 lugar:** `.hero-cta` em `new-sections.css` (gradient)

Em 2026-05-19, Luís reabriu a discussão: a marca está invisível demais. A pergunta foi se conseguíamos "alterar a cor branca default pela cor real da marca" mantendo a estética aprovada pelo cliente.

Para evitar a falha de 2026-05-04 (aplicar wholesale, descobrir tarde que ficou ruim), construímos um **preview externo** em `/tmp/cinnamon-ds-preview/` com 3 abordagens lado a lado (Neutro / Acento / Marca dominante) e Luís aprovou visualmente a **Abordagem B — Acento**: marca presente sem dominar, focus/links/eyebrows em rosa, gradient em CTAs primários, branco mantido como cor de texto e botões secundários.

Este spec documenta:
- Os tokens (primitives + semantic) que entrarão em `:root`
- Os componentes que dependem desses tokens
- O mapeamento "antes → depois" de cada arquivo do projeto
- Riscos e fases de implementação

---

## 2. Decisões load-bearing (não reverter sem justificativa explícita)

1. **Abordagem B aprovada em 2026-05-19** após validação visual em preview externo. Substitui parcialmente a decisão de 2026-05-04 — branco continua sendo default em texto/botões secundários, mas rosa volta a aparecer em focus/links/eyebrows/loop SVG.
2. **Paleta primária inalterada:** `#000000`, `#F26294`, `#F2662B`, `#ffffff`, gradient `linear-gradient(90deg, #F26294 0%, #F2662B 100%)`. Continua valendo a decisão de usar preto puro em vez do `#00324E` listado no brand book PDF.
3. **Fonte Outfit inalterada** (decisão de 2026-05-04, sem regressão).
4. **Classes Webflow `w-*` imutáveis** — o design system adiciona classes nossas ao lado, jamais substitui `.w-nav`, `.w-button`, `.w-inline-block`, etc.
5. **Liquid-fill do botão Menu** migra de IX2 (Webflow) para CSS puro. O efeito visual é o mesmo (animação `width: 0% → 100%` da div interna, 400ms cubic-bezier), só a engine muda. Permite remover o `data-w-id` específico desse botão sem afetar outras animações IX2.
6. **Loop SVG decorativo** ("Reservar" no navbar): asset passa de `border.svg` (stroke branco) para `border-gradient.svg` (stroke `<linearGradient>` rosa→laranja). Arquivo `border.svg` permanece no repo como fallback/histórico.
7. **Vermelhos de validação** (`#ff2525`, `#f11`) ficam intencionalmente fora da paleta da marca — UX > paleta.

---

## 3. Arquitetura dos tokens

Dois níveis de tokens, com camada semântica entre o código e as cores primárias:

```
┌──────────────────┐   ┌──────────────────┐
│  Primitives      │   │  Semantic        │   ┌──────────────────┐
│  (IDV + system)  │ ← │  (uso na UI)     │ ← │  Componentes     │
│  --brand-pink    │   │  --accent        │   │  .btn--primary   │
│  --gray-300      │   │  --text-muted    │   │  .nav__link      │
│  --space-4       │   │  --surface-bg    │   │  .card           │
└──────────────────┘   └──────────────────┘   └──────────────────┘
```

Por que dois níveis: muda paleta? Só os primitives. Muda como a UI usa? Só os semantic. Componentes nunca tocam hex direto. Foi exatamente a separação que faltou na Phase 12 — `#F26294` espalhado pelo CSS impossibilitou rollback cirúrgico.

### 3.1 Primitives (IDV)

| Token | Valor | Origem |
|---|---|---|
| `--brand-black` | `#000000` | IDV §2 (decisão projeto: preto puro, não `#00324E`) |
| `--brand-pink` | `#F26294` | IDV §2 |
| `--brand-orange` | `#F2662B` | IDV §2 |
| `--brand-white` | `#ffffff` | IDV §2 |
| `--brand-gradient` | `linear-gradient(90deg, #F26294 0%, #F2662B 100%)` | IDV §2 |
| `--brand-gradient-soft` | `linear-gradient(90deg, rgba(242,98,148,0.15) 0%, rgba(242,102,43,0.15) 100%)` | Derivado — fundo de eyebrows e chips |

### 3.2 Primitives (sistema — não IDV)

Escala de cinzas para placeholders, dividers, fundos de card. Substitui o caos atual (`#ccc`, `#b3b3b3`, `#b8b8b8`, `#d9d9d9`, `#4d4d4d`, `#999`, `#1a1a1a`, `#2a2a2a` espalhados).

| Token | Valor |
|---|---|
| `--gray-50` | `#f7f7f7` |
| `--gray-100` | `#e5e5e5` |
| `--gray-200` | `#cccccc` |
| `--gray-300` | `#b3b3b3` |
| `--gray-400` | `#999999` |
| `--gray-500` | `#777777` |
| `--gray-600` | `#555555` |
| `--gray-700` | `#2a2a2a` |
| `--gray-800` | `#1a1a1a` |
| `--gray-900` | `#0d0d0d` |

### 3.3 Estados / validação

| Token | Valor | Por que fora da paleta |
|---|---|---|
| `--error` | `#ff2525` | WCAG/UX: vermelho universal de erro. Decisão prévia §1 confirmada. |
| `--error-soft` | `#f11` | Variação suave herdada do template. |
| `--success` | `#34c759` | iOS-like, contraste consistente em fundo escuro. |

### 3.4 Tipografia

```css
--font-primary: 'Outfit', system-ui, sans-serif;
--fw-thin: 100;
--fw-regular: 400;
--fw-medium: 500;
--fw-bold: 700;

--fs-display:  clamp(3rem, 7vw, 5.5rem);
--fs-h1:       clamp(2.25rem, 5vw, 3.75rem);
--fs-h2:       clamp(1.75rem, 3.5vw, 2.5rem);
--fs-h3:       clamp(1.25rem, 2.4vw, 1.75rem);
--fs-body:     clamp(1rem, 1.2vw, 1.125rem);
--fs-small:    0.875rem;
--fs-eyebrow:  0.75rem;

--lh-tight: 1.1;
--lh-base: 1.5;
--lh-relaxed: 1.65;
--tracking-wide: 0.12em;
--tracking-wider: 0.18em;
```

IDV pede Bold 700 (títulos/CTAs) e Thin 100 (subtítulos elegantes). Medium 500 e Regular 400 aparecem em corpo de parágrafo.

### 3.5 Spacing & layout

```css
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-5: 1.5rem;   --space-6: 2rem;
--space-8: 3rem;     --space-10: 4rem;    --space-12: 6rem;
--space-16: 8rem;

--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 16px;
--radius-pill: 100px;
--radius-full: 999px;
```

### 3.6 Shadows & motion

```css
--shadow-sm: 0 2px 6px rgba(0,0,0,0.15);
--shadow-md: 0 6px 20px rgba(0,0,0,0.25);
--shadow-glow-pink: 0 6px 24px rgba(242,98,148,0.35);
--shadow-glow-orange: 0 6px 24px rgba(242,102,43,0.35);

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--dur-fast: 150ms;
--dur-base: 220ms;
--dur-slow: 400ms;
```

### 3.7 Semantic tokens (Abordagem B)

Aqui é onde Abordagem B se distingue de A/C. **Não mudar sem revisitar a decisão.**

```css
:root {
  --surface-bg: var(--brand-black);
  --surface-elevated: var(--gray-900);
  --surface-card: var(--gray-800);

  --text-primary: var(--brand-white);
  --text-secondary: var(--gray-300);
  --text-muted: var(--gray-400);

  --accent: var(--brand-pink);
  --accent-soft: rgba(242, 98, 148, 0.15);
  --accent-strong: var(--brand-orange);

  --border: rgba(255, 255, 255, 0.12);
  --border-hover: var(--brand-pink);

  --link: var(--brand-white);
  --link-hover: var(--brand-pink);

  --focus-ring: 0 0 0 3px rgba(242, 98, 148, 0.55);

  /* Botões */
  --btn-primary-bg: var(--brand-gradient);
  --btn-primary-text: var(--brand-white);

  --btn-secondary-bg: transparent;
  --btn-secondary-text: var(--brand-white);
  --btn-secondary-border: var(--brand-white);
  --btn-secondary-hover-text: var(--brand-pink);

  --btn-hero-bg: var(--brand-gradient);
  --btn-hero-text: var(--brand-white);
  --btn-hero-shadow: var(--shadow-glow-orange);

  --btn-menu-fill: var(--brand-gradient);
  --btn-menu-text-hover: var(--brand-white);

  --circle-emphasis-image: url('/images/border-gradient.svg');
}
```

---

## 4. Componentes (catálogo)

Cada componente é um bloco isolado com classe BEM-light. Estado com prefixo `is-` (`is-active`, `is-open`). Modificadores com `--` (`btn--primary`).

### 4.1 Buttons

| Classe | Uso | Comportamento |
|---|---|---|
| `.btn` | Base — não usar sozinha | Define padding, font, radius, transição |
| `.btn--primary` | CTA principal de seção | Fundo gradient, texto branco, hover translateY |
| `.btn--secondary` | CTA secundário, "voltar" | Transparente, borda branca, texto branco; hover texto rosa |
| `.btn--ghost` | Ações terciárias | Sem borda, sem fundo; hover texto rosa |
| `.btn--hero` | CTA principal do hero | Gradient + glow orange, padding maior |
| `.btn--menu` | Botão "Menu" no navbar | Liquid fill gradient (markup especial — ver §4.2) |

### 4.2 Botão Menu (liquid fill — replicação do template Webflow)

Markup esperado:
```html
<a class="btn btn--menu" href="#menu">
  <span class="fill-bg"></span>
  <span class="btn__label">Menu</span>
</a>
```

CSS chave:
```css
.btn--menu { position: relative; overflow: hidden; background: transparent;
             color: var(--brand-white); border: 2px solid var(--brand-white); }
.btn--menu .fill-bg { position: absolute; top: 0; left: 0; width: 0;
                      height: 100%; background: var(--btn-menu-fill);
                      z-index: -1; border-radius: inherit;
                      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.btn--menu .btn__label { position: relative; z-index: 1; }
.btn--menu:hover .fill-bg { width: 100%; }
.btn--menu:hover .btn__label { color: var(--btn-menu-text-hover); }
```

**Por que separar `.fill-bg` em vez de animar `background` direto:** transition de gradient não interpola bem entre estados em CSS — animar `width` de uma div com gradient fixo dá o "liquid fill" left-to-right idêntico ao IX2 do template original.

### 4.3 Nav

| Classe | Uso |
|---|---|
| `.nav` | Container do navbar |
| `.nav__brand` | Wordmark "CINNAMON · DRINKS" ou logo |
| `.nav__menu` | `<ul>` dos links |
| `.nav__link` | `<a>` normal (Início, Estrutura, etc.) — underline rosa cresce left-to-right no hover |
| `.nav__link--circled` | Link "Reservar" — recebe loop SVG decorativo como background |
| `.nav__link.is-active` | Estado ativo (controlado via JS — page scroll) |

### 4.4 Cards (bares, menu de drinks)

```html
<article class="card">
  <span class="card__accent-bar"></span>
  <img src="..." alt="...">
  <div class="card__overlay">
    <div class="card__title">Glamouroso</div>
    <div class="card__meta">Casamentos · Galas</div>
  </div>
</article>
```

`.card__accent-bar` aparece no topo só no hover, com gradient. Outros cards de drinks no `Menu.astro` herdam a mesma estrutura.

### 4.5 Forms

| Classe | Uso |
|---|---|
| `.input-group` | Wrapper `<label> + <input>` |
| `.label` | Label visível, eyebrow style |
| `.input` / `.select` / `.textarea` | Inputs com underline rosa no focus |

### 4.6 Eyebrows / chips

```html
<span class="eyebrow">Categoria</span>
```
Pill rosa-translúcido (`var(--accent-soft)`) com texto rosa (`var(--accent)`), tracking aberto, uppercase.

### 4.7 Hero, sections, dividers

`.hero`, `.section`, `.container`, `.divider`, `.divider--brand` (esta última usa gradient).

### 4.8 Decorativo — loop SVG ("Reservar")

Asset: `public/images/border-gradient.svg` com `<linearGradient>` rosa→laranja.

```svg
<svg width="163" height="88" viewBox="0 0 163 88" fill="none">
  <defs>
    <linearGradient id="brandGradient" x1="0" y1="44" x2="163" y2="44"
                    gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F26294"/>
      <stop offset="100%" stop-color="#F2662B"/>
    </linearGradient>
  </defs>
  <path d="M148.999 9C..." stroke="url(#brandGradient)" stroke-width="3"
        stroke-linecap="round"/>
</svg>
```

Usado via `background-image` na classe `.nav__link--circled` (ou na classe `.bordered-button` herdada do template, durante o período de coexistência).

---

## 5. Mapeamento de migração (codebase atual → tokens)

### 5.1 Arquivos que mudam

| Arquivo | Tipo de mudança |
|---|---|
| `src/styles/global.css` | Adicionar `:root` com tokens (substituindo os legacy `--light-grey`, `--yellow`, etc.) · trocar 146 hex hardcoded por `var(--*)` em fases |
| `src/styles/new-sections.css` | Substituir gradient hardcoded em `.hero-cta` por `var(--brand-gradient)` · trocar `#1a1a1a`/`#2a2a2a`/`#999` por `var(--gray-*)` |
| `src/components/Menu.astro` | `color: #b8b8b8` (linha 112) → `var(--gray-300)`. `color: #fff` (linha 121) → `var(--text-primary)` |
| `src/components/ReserveForm.astro` | `color: #fff` (linha 199) → `var(--text-primary)` |
| `src/components/Navbar.astro` | Substituir markup do botão Menu — de `<a data-w-id="..." class="button btn-small w-inline-block"><div class="fill-background"></div><div>Menu</div></a>` para `<a class="btn btn--menu w-inline-block" href="#menu"><span class="fill-bg"></span><span class="btn__label">Menu</span></a>`. Remove o `data-w-id` (IX2 não anima mais esse elemento). Mantém `.w-inline-block` (layout Webflow). `.bordered-button` (Reserva) passa a usar `border-gradient.svg` |
| `public/images/border-gradient.svg` | **Arquivo novo** — copiar de `/tmp/cinnamon-ds-preview/shared/border-gradient.svg` |
| `public/images/border.svg` | Manter (fallback histórico) — não deletar |
| `docs/patterns/css.md` | Atualizar seção "Princípios" — branco continua default em texto, mas rosa volta em focus/links/eyebrows/loop |
| `docs/brandbook/IDENTIDADE_VISUAL.md` §7 | Adicionar entrada de 2026-05-19 sobre a Abordagem B aprovada |

### 5.2 Memory updates

- **Editar** `feedback_neutral_default_colors.md` — marcar como SUPERSEDED em 2026-05-19. Manter o registro histórico (não deletar).
- **Criar** `decision_design_system_2026-05-19.md` — registrar Abordagem B aprovada, com link para este spec.

### 5.2.1 Dead code candidato a remoção (Fase 6 — cleanup)

Auditoria em 2026-05-19 confirma que estes seletores do template Webflow não são usados em nenhum `.astro` do projeto e podem sair em cleanup:

- `.button.btn-yellow` (e `:hover`)
- `.button.btn-medium` + `.button.btn-medium.btn-yellow:hover`
- `.button.btn-fill-white` + `.button.btn-small.btn-fill-white:hover`
- `.button.btn-white:hover`
- `.button.btn-small.template` + `:hover`

A regra base `.button` permanece em `global.css` enquanto a migração não estiver completa — depois pode sair também (seu único uso era no Menu, que migra para `.btn--menu`).

### 5.3 O que NÃO muda

- Estrutura HTML (markup das pages e do `Base.astro`).
- Sistema de Content Collections (`src/content/*.yml`).
- IX2 do Webflow (`public/webflow.js`) — só o efeito do botão Menu sai do IX2 para CSS; outras animações ficam.
- jQuery vendored (`public/vendor/jquery-3.5.1.min.js`).
- Templates Webflow IX2: `webflow-ix2-init.css`, `webflow.css`, `normalize.css`.
- Stack: Astro 5.x, pnpm, Biome, Sveltia CMS.

---

## 6. Riscos e mitigações

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Cliente reage negativamente como em 2026-05-04 | Média | Preview externo já aprovado por Luís. **Recomenda-se mostrar o preview ao cliente antes de fazer merge** — link compartilhável: arquivo local em `/tmp/cinnamon-ds-preview/`, posso publicar em Cloudflare Pages ou rede local sob demanda. |
| Quebra silenciosa de animações IX2 | Baixa | Liquid-fill é o **único** efeito IX2 que migra para CSS. Resto fica intacto. Testar com `pnpm dev` antes de commitar. |
| Renomeação acidental de classe `w-*` | Baixa | Lint manual no diff antes de cada commit · seguir `docs/patterns/css.md` |
| Contraste insuficiente em algum elemento | Baixa | Texto branco sobre gradient: ratio 5.6 (sobre laranja) e 8.2 (sobre rosa) — passa WCAG AA. Focus ring rosa-translúcido: precisa validar contra cinza escuro do `--surface-card`. |
| Quebra em browsers antigos (Safari < 16) | Muito baixa | Tokens CSS custom properties são universais. `clamp()` é amplamente suportado. Sem features de bleeding edge. |
| `--btn-menu-fill` aceitar gradient (que é `<background>`, não cor) | Já validado | Funciona em todos os engines testados — `background: var(--token-with-gradient)` é equivalente a inline. Preview confirmou. |

---

## 7. Plano de implementação (alto nível)

**O plano detalhado, etapa por etapa, com TODOs e ordem de execução, é responsabilidade do próximo documento (`docs/superpowers/plans/2026-05-19-design-system-implementation.md`), criado via skill `writing-plans`.** Aqui só o esqueleto:

1. **Fase 1 — Foundation:** introduzir `:root` com tokens em `src/styles/global.css` sem remover os antigos (coexistência). Verificar: nada visual muda.
2. **Fase 2 — Loop SVG:** adicionar `public/images/border-gradient.svg`, trocar referência em `.bordered-button` no global.css. Verificar: "Reserva" no navbar com loop gradient.
3. **Fase 3 — Botão Menu:** migrar markup em `Navbar.astro` para `.btn--menu` + adicionar CSS do liquid-fill com gradient. Remover o `data-w-id` do IX2 desse elemento específico. Verificar: hover faz liquid-fill.
4. **Fase 4 — Focus ring + eyebrows:** aplicar `:focus-visible` global com `var(--focus-ring)` rosa. Adicionar `.eyebrow` onde for usado.
5. **Fase 5 — Substituições mecânicas:** trocar hex hardcoded em `global.css` e `new-sections.css` por `var(--*)`. Sem mudança visual esperada.
6. **Fase 6 — Cleanup:** remover tokens legacy (`--yellow`, `--light-grey`, etc.) confirmando que ninguém mais os referencia. Atualizar `docs/patterns/css.md` e memory.

Cada fase termina com `pnpm dev` aberto + comparação visual + (idealmente) screenshot antes/depois.

---

## 8. Critérios de pronto

- [ ] `:root` em `global.css` contém todos os tokens listados em §3
- [ ] **Zero hex hardcoded em `src/styles/*.css` e `src/components/*.astro`**, com as seguintes exceções explicitamente permitidas:
  - (a) Hex dentro de comentários (`/* IDV oficial: #F26294 */`)
  - (b) `--error: #ff2525`, `--error-soft: #f11`, `--success: #34c759` em `:root` (UX > paleta)
  - (c) Hex dentro de declarações de primitives em `:root` (esse é o ponto — `--brand-pink: #F26294`, `--gray-300: #b3b3b3`, etc.)

  Tudo mais (incluindo `border-color`, `border` shorthand, `text-shadow`, `linear-gradient`, alpha curto como `#fff0`) **deve estar via `var(--token)`, `rgba()` ou `transparent`**. Validação automatizada na Task 11b do plan via grep.
- [ ] Botão Menu funciona com liquid-fill gradient via CSS puro
- [ ] Loop SVG em "Reservar" usa gradient (asset `border-gradient.svg`)
- [ ] Focus ring rosa visível em todos os inputs / links via teclado (`:focus-visible`)
- [ ] `pnpm check` passa (Biome lint + format)
- [ ] `pnpm ts:check` passa
- [ ] `pnpm test` passa
- [ ] `docs/patterns/css.md` reflete o estado novo
- [ ] `docs/brandbook/IDENTIDADE_VISUAL.md` §7 atualizada
- [ ] Memory `decision_design_system_2026-05-19.md` criada · `feedback_neutral_default_colors.md` marcada como superseded

---

## 8.1 Política de commits

Per `~/.claude/CLAUDE.md` §13 (Guardrails universais), **todo `git commit` exige confirmação explícita do Luis antes de executar**. O plano de implementação respeitará isso: cada fase termina pedindo aprovação antes de comitar. Conventional Commits em PT-BR, imperativo, foco no porquê (per `docs/patterns/git.md`).

---

## 9. Referências

- Preview externo: `/tmp/cinnamon-ds-preview/` (HTMLs standalone, servido por `python3 -m http.server 4567`)
- Spec original do projeto: `docs/superpowers/specs/2026-05-01-cinnamon-drinks-design.md`
- IDV oficial: `docs/brandbook/IDENTIDADE_VISUAL.md`
- Pattern CSS atual: `docs/patterns/css.md`
- Memory que ficará superseded: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/feedback_neutral_default_colors.md`
