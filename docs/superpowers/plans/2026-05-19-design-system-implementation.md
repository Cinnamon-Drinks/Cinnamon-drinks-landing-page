# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a Abordagem B do design system aprovada por Luis em 2026-05-19, migrando o codebase de 146 hex hardcoded e tokens legacy do template Webflow para tokens IDV (primitives + semantic) com migração faseada e verificação visual a cada etapa.

**Architecture:** Adicionar tokens em `:root` no `src/styles/global.css` antes de tocar em qualquer outro lugar (Fase 1 — coexistência). Em seguida, migrar componentes-chave (botão Menu, loop SVG da "Reservar", focus ring, eyebrows) em sequência isolada. Cada fase é uma substituição cirúrgica com verificação visual via `pnpm dev`. Por último, substituições mecânicas em massa de hex → tokens, remoção de dead code e atualização de docs/memory.

**Tech Stack:** Astro 5.x (componentes `.astro`), CSS3 nativo (sem framework utilitário), pnpm, Biome (`pnpm check`), Vitest (`pnpm test`), Chrome DevTools / Playwright para verificação visual. Sem TDD unit-test para CSS — verificação é via `pnpm check` (sintaxe/format) + `pnpm ts:check` (Astro) + `pnpm test` (regressão de utils) + smoke visual no browser.

**Política de commits:** Per `~/.claude/CLAUDE.md` §13, **todo `git commit` exige confirmação explícita do Luis antes de executar.** Cada tarefa termina com um passo "Pedir aprovação ao Luis para o commit" antes do `git commit`. Conventional Commits em PT-BR, imperativo, foco no porquê.

---

## File Structure

Arquivos tocados (com a única responsabilidade de cada um):

**Criar:**
- `public/images/border-gradient.svg` — variante do loop decorativo com stroke `<linearGradient>` rosa→laranja (cópia direta de `/tmp/cinnamon-ds-preview/shared/border-gradient.svg`)
- `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/decision_design_system_2026-05-19.md` — registro da nova decisão

**Modificar:**
- `src/styles/global.css` — adicionar tokens IDV no `:root`, migrar hex hardcoded para `var()`, atualizar `.bordered-button` / `.button`, adicionar `.btn--menu`, adicionar `:focus-visible` global, remover dead code
- `src/styles/new-sections.css` — migrar `.hero-cta` para usar tokens; cinzas hardcoded em `.bar-card` e `.estrutura-disclaimer`
- `src/components/Navbar.astro` — substituir markup do botão Menu (remove `data-w-id`, troca classes e divs internas)
- `src/components/Menu.astro` — substituir `#b8b8b8` e `#fff` por tokens
- `src/components/ReserveForm.astro` — substituir `#fff` por token
- `docs/patterns/css.md` — atualizar princípios refletindo Abordagem B
- `docs/brandbook/IDENTIDADE_VISUAL.md` §7 — adicionar entrada de 2026-05-19
- `~/.claude/projects/.../memory/feedback_neutral_default_colors.md` — marcar SUPERSEDED em 2026-05-19

**Não tocar (per §5.3 do spec):** `public/webflow.js`, `public/vendor/jquery-3.5.1.min.js`, `src/styles/webflow.css`, `src/styles/webflow-ix2-init.css`, `src/styles/normalize.css`, qualquer `*.yml` em `src/content/`, `src/layouts/Base.astro`.

---

## Convenções por toda a execução

**Verificação após cada mudança de CSS/Astro:**

```bash
pnpm check           # Biome lint + format check
pnpm ts:check        # Astro check
pnpm test            # Vitest run (whatsapp.test.ts deve continuar PASS)
```

**Smoke visual após cada Task que muda visual:**

```bash
pnpm dev             # background — abre http://localhost:4321
```
Abrir `http://localhost:4321` no Chrome e confirmar que (a) o que devia mudar mudou, (b) nada mais mudou. Se possível, comparar com screenshot do estado anterior.

**Quando comitar:** sempre pedir aprovação do Luis antes de executar `git commit`. O comando vai num bloco mas a execução é gated por "ok do Luis".

---

## Task 1: Adicionar tokens primitives + semantic (Abordagem B) em `:root`

**Files:**
- Modify: `src/styles/global.css:1-7`

**Por que essa task primeiro:** introduzir os tokens sem ainda referenciá-los garante que o estado visual atual fica intocado. É a Fase 1 (Foundation) do spec §7.

- [ ] **Step 1: Substituir o `:root` atual pelo bloco completo de tokens**

Abrir `src/styles/global.css` e substituir as linhas 1-7 (o `:root` legacy) por:

```css
:root {
  /* ───────────────────────────────────────────────────────────
   * Primitives — IDV oficial (NÃO mudar sem revisitar decisão)
   * ─────────────────────────────────────────────────────────── */
  --brand-black: #000000;
  --brand-pink: #F26294;
  --brand-orange: #F2662B;
  --brand-white: #ffffff;
  --brand-gradient: linear-gradient(90deg, #F26294 0%, #F2662B 100%);
  --brand-gradient-soft: linear-gradient(90deg, rgba(242, 98, 148, 0.15) 0%, rgba(242, 102, 43, 0.15) 100%);

  /* Gray scale (sistema, NÃO IDV — para placeholders/dividers/cards) */
  --gray-50: #f7f7f7;
  --gray-100: #e5e5e5;
  --gray-200: #cccccc;
  --gray-300: #b3b3b3;
  --gray-400: #999999;
  --gray-500: #777777;
  --gray-600: #555555;
  --gray-700: #2a2a2a;
  --gray-800: #1a1a1a;
  --gray-900: #0d0d0d;

  /* Validation (intencionalmente fora da marca — UX > paleta) */
  --error: #ff2525;
  --error-soft: #f11;
  --success: #34c759;

  /* Tipografia */
  --font-primary: 'Outfit', system-ui, sans-serif;
  --fw-thin: 100;
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-bold: 700;

  --fs-display: clamp(3rem, 7vw, 5.5rem);
  --fs-h1: clamp(2.25rem, 5vw, 3.75rem);
  --fs-h2: clamp(1.75rem, 3.5vw, 2.5rem);
  --fs-h3: clamp(1.25rem, 2.4vw, 1.75rem);
  --fs-body: clamp(1rem, 1.2vw, 1.125rem);
  --fs-small: 0.875rem;
  --fs-eyebrow: 0.75rem;

  --lh-tight: 1.1;
  --lh-base: 1.5;
  --lh-relaxed: 1.65;
  --tracking-wide: 0.12em;
  --tracking-wider: 0.18em;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-8: 3rem;
  --space-10: 4rem;
  --space-12: 6rem;
  --space-16: 8rem;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-pill: 100px;
  --radius-full: 999px;

  /* Shadows */
  --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.15);
  --shadow-md: 0 6px 20px rgba(0, 0, 0, 0.25);
  --shadow-glow-pink: 0 6px 24px rgba(242, 98, 148, 0.35);
  --shadow-glow-orange: 0 6px 24px rgba(242, 102, 43, 0.35);

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 150ms;
  --dur-base: 220ms;
  --dur-slow: 400ms;

  /* ───────────────────────────────────────────────────────────
   * Semantic (Abordagem B — Acento)
   * ─────────────────────────────────────────────────────────── */
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

  /* Decorativo */
  --circle-emphasis-image: url('/images/border-gradient.svg');

  /* ───────────────────────────────────────────────────────────
   * Legacy aliases — preservados durante a migração (Fase 5).
   * Apontam pros novos primitives. Serão removidos na Fase 6.
   * ─────────────────────────────────────────────────────────── */
  --light-grey: var(--gray-200);
  --white: var(--brand-white);
  --black: var(--brand-black);
  --yellow: var(--brand-white);
  --dark-grey: var(--gray-500);
}
```

**Nota sobre `--circle-emphasis-image`:** o path `url('/images/border-gradient.svg')` é root-relative — convenção do Astro para arquivos em `public/` (Vite serve `public/` montado em `/`). Confirmado por inspeção: o template já usa esse padrão em `.bordered-button` (`url('../images/border.svg')` resolveria relativo ao bundle, mas no build atual também funciona — preferimos root-relative para clareza). Validar visualmente após a Task 4.

- [ ] **Step 2: Rodar verificações estáticas**

```bash
pnpm check
pnpm ts:check
pnpm test
```

Esperado: tudo PASS. `pnpm check` não deve reclamar de format (o bloco acima segue 2-space indent + lowercase hex consistente — Biome pode preferir lowercase nos hex; se reclamar, rodar `pnpm format`).

- [ ] **Step 3: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321` no browser. **Esperado:** nada visual muda — todos os tokens novos estão em `:root` mas ninguém ainda os referencia (exceto via os aliases legacy `--light-grey`, `--white`, etc., que mantêm os mesmos valores). Parar `pnpm dev` antes de seguir.

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

Mostrar diff. Aguardar ok.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(css): adiciona tokens IDV (primitives + semantic) em :root

Introduz o design system aprovado em 2026-05-19 (Abordagem B). Tokens
legacy do template (--light-grey, --yellow, etc.) viram aliases para os
novos primitives durante a migração — sem mudança visual nesta fase.

Ref: docs/superpowers/specs/2026-05-19-design-system-tokens.md"
```

---

## Task 2: Adicionar `border-gradient.svg` em `public/images/`

**Files:**
- Create: `public/images/border-gradient.svg`

- [ ] **Step 1: Criar o arquivo SVG**

Conteúdo idêntico ao arquivo já validado no preview (`/tmp/cinnamon-ds-preview/shared/border-gradient.svg`):

```xml
<svg width="163" height="88" viewBox="0 0 163 88" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
<linearGradient id="brandGradient" x1="0" y1="44" x2="163" y2="44" gradientUnits="userSpaceOnUse">
<stop offset="0%" stop-color="#F26294"/>
<stop offset="100%" stop-color="#F2662B"/>
</linearGradient>
</defs>
<path d="M148.999 9C109.332 -2.16667 34.5816 -1.89972 10.4983 27C-9.50191 51 9.86353 67.3341 18.9982 73.5C38.9983 87 111.069 94.8096 148.999 67.5C173.999 49.5 158.998 17.5 125.498 14.5" stroke="url(#brandGradient)" stroke-width="3" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 2: Verificar abrindo direto no browser**

```bash
pnpm dev
```
Navegar para `http://localhost:4321/images/border-gradient.svg`. **Esperado:** ver o loop oval desenhado com gradient rosa→laranja sobre fundo transparente.

- [ ] **Step 3: Pedir aprovação ao Luis para o commit**

- [ ] **Step 4: Commit**

```bash
git add public/images/border-gradient.svg
git commit -m "feat(assets): adiciona border-gradient.svg para o loop decorativo da marca

SVG variante do border.svg (white stroke) com <linearGradient> rosa->laranja
(IDV §2). Será aplicado no .bordered-button (\"Reservar\" no navbar) na
próxima task."
```

---

## Task 3: Trocar `.bordered-button` para usar `border-gradient.svg`

**Files:**
- Modify: `src/styles/global.css:1527-1545` (a regra `.bordered-button`)

- [ ] **Step 1: Trocar o `background-image`**

Em `src/styles/global.css`, na regra `.bordered-button` (linha ~1527), trocar:

```css
.bordered-button {
  color: #fff;
  background-image: url('../images/border.svg');
```

para:

```css
.bordered-button {
  color: var(--text-primary);
  background-image: url('/images/border-gradient.svg');
```

**Nota sobre o path:** o `url('../images/...')` original era relativo ao arquivo `global.css` quando ele estava na pasta `css/` do template. Astro processa `src/styles/global.css` e move pra build, então paths relativos podem quebrar. Path absoluto `/images/...` (com `/` inicial) resolve para `public/images/...` no build.

- [ ] **Step 2: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 3: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Olhar o navbar. **Esperado:**
- "Reserva" (no centro do navbar, entre "Estrutura" e "Contato") tem agora um loop em volta com gradient rosa→laranja (antes era stroke branco).
- O texto "Reserva" continua branco.

Se o loop aparecer cortado ou branco ainda, verificar (a) se o path está certo, (b) se o cache do browser tá segurando o SVG antigo (hard reload com Cmd+Shift+R).

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(css): aplica gradient da marca no loop decorativo de \"Reserva\"

Bordered-button (item Reserva do navbar) usa agora border-gradient.svg
com stroke rosa->laranja, alinhado com a Abordagem B do design system.
Texto migra para var(--text-primary) na mesma linha."
```

---

## Task 4: Migrar markup do botão Menu em Navbar.astro

**Files:**
- Modify: `src/components/Navbar.astro:42-56`

- [ ] **Step 1: Substituir o bloco do botão Menu**

Em `src/components/Navbar.astro`, substituir as linhas 42-56 (atualmente):

```astro
  <div class="navbar-right">
    <div
      data-w-id="dd5cab77-4916-4a13-14be-706f6004aa8b"
      class="menus-container-lg"
    >
      <a
        data-w-id="4b5aaa32-a205-0222-a6ed-66ea02154c08"
        href="#menu"
        class="button btn-small w-inline-block"
      >
        <div class="fill-background"></div>
        <div>Menu</div>
      </a>
      <!-- TBD per spec §8.1: dropdown linkando variações de menu por
           tipo de bar (Glamouroso/Tropical/etc). Discussão pós Phase 8. -->
    </div>
  </div>
```

por:

```astro
  <div class="navbar-right">
    <div class="menus-container-lg">
      <a href="#menu" class="btn btn--menu w-inline-block">
        <span class="fill-bg"></span>
        <span class="btn__label">Menu</span>
      </a>
      <!-- TBD per spec §8.1: dropdown linkando variações de menu por
           tipo de bar (Glamouroso/Tropical/etc). Discussão pós Phase 8. -->
    </div>
  </div>
```

**O que mudou e por quê:**
- Removido `data-w-id="dd5cab77-..."` do wrapper e `data-w-id="4b5aaa32-..."` do `<a>` — esses eram hooks IX2 para a animação do liquid-fill. CSS puro substitui (Task 5).
- `.button.btn-small` → `.btn.btn--menu` — design system novo.
- `.w-inline-block` mantido (Webflow layout helper).
- `<div class="fill-background">` → `<span class="fill-bg">` — nome consistente com o design system; `<span>` mais leve semanticamente.
- `<div>Menu</div>` → `<span class="btn__label">Menu</span>` — `.label` é o span que recebe `z-index: 1` e tem transição de cor.

- [ ] **Step 2: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 3: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. **Esperado:** o botão "Menu" no canto direito do navbar **pode parecer quebrado visualmente** nesta etapa — sem o CSS do `.btn--menu` (que entra na Task 5), o `<a>` perdeu seus estilos antigos (`.button.btn-small`) mas ainda não recebeu os novos. Provavelmente vira um link de texto simples. **Isso é esperado.**

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.astro
git commit -m "refactor(navbar): migra markup do botão Menu para design system

Troca .button.btn-small por .btn.btn--menu, .fill-background por .fill-bg
e divs internas por spans com classe .label. Remove data-w-id do IX2
desse elemento — o liquid-fill será reimplementado em CSS puro na próxima
task. .w-inline-block preservado (Webflow layout)."
```

---

## Task 5: Adicionar CSS do `.btn`, `.btn--menu` (liquid-fill gradient)

**Files:**
- Modify: `src/styles/global.css` — adicionar bloco após a regra `.button` existente (após linha ~235)

- [ ] **Step 1: Adicionar o bloco de CSS**

Em `src/styles/global.css`, após a última regra `.button.*` (atualmente termina por volta da linha 235, `.button.btn-white:hover`), inserir:

```css
/* ─── Design System — botões base + variantes
 * Coexistem com .button.* legacy durante a migração.
 * .btn--menu replica o liquid-fill do template original (.button +
 * .fill-background animado via IX2) em CSS puro com gradient da marca.
 * ─── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.5em 1.25em;
  font-family: var(--font-primary);
  font-weight: var(--fw-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border-radius: var(--radius-pill);
  border: 2px solid transparent;
  cursor: pointer;
  transition:
    background var(--dur-base) var(--ease-out),
    color var(--dur-base) var(--ease-out),
    border-color var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out),
    box-shadow var(--dur-base) var(--ease-out);
  text-decoration: none;
}

.btn--menu {
  position: relative;
  overflow: hidden;
  background: transparent;
  color: var(--brand-white);
  border: 2px solid var(--brand-white);
  z-index: 0;
}
.btn--menu .fill-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: var(--btn-menu-fill);
  z-index: -1;
  border-radius: inherit;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn--menu .btn__label {
  position: relative;
  z-index: 1;
  transition: color var(--dur-base) var(--ease-out);
}
.btn--menu:hover .fill-bg {
  width: 100%;
}
.btn--menu:hover .btn__label {
  color: var(--btn-menu-text-hover);
}
```

- [ ] **Step 2: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 3: Smoke visual (idle)**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Olhar o botão "Menu" no canto direito do navbar. **Esperado idle:** pill com borda branca, fundo transparente, texto MENU branco. Igualzinho ao botão antigo no estado idle.

- [ ] **Step 4: Smoke visual (hover)**

Passar mouse por cima do botão MENU. **Esperado:** gradient rosa→laranja preenche o pill da esquerda pra direita em ~400ms. Texto MENU permanece branco (boa legibilidade). Soltar mouse: gradient recua. Comparar com o estado capturado no preview (`/tmp/cinnamon-ds-preview/screenshots/` se ainda existir).

- [ ] **Step 5: Pedir aprovação ao Luis para o commit**

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(css): adiciona .btn e .btn--menu com liquid-fill gradient

Botão Menu agora preenche com gradient rosa->laranja da esquerda pra
direita no hover (replica IX2 original em CSS puro, 400ms cubic-bezier).
Classe .btn base reutilizada nas próximas variantes do design system."
```

---

## Task 6: Aplicar `:focus-visible` global com ring rosa

**Files:**
- Modify: `src/styles/global.css` — adicionar após o body (após linha ~16)

- [ ] **Step 1: Adicionar regra global de focus**

Em `src/styles/global.css`, logo após o `body { ... }` (linha ~16), inserir:

```css
/* Focus ring (Abordagem B) — visível apenas para teclado / AT.
 * box-shadow em vez de outline para herdar border-radius do elemento. */
:focus-visible {
  outline: 0;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-sm);
}
```

- [ ] **Step 2: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 3: Smoke visual via teclado**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Pressionar Tab repetidamente. **Esperado:** cada link/input/botão recebe um ring rosa translúcido (`rgba(242, 98, 148, 0.55)`) ao receber foco por teclado. Click do mouse NÃO mostra o ring (`:focus-visible` é teclado-only).

**Verificar especificamente:**
- Os 5 links do navbar
- O botão Menu (deve mostrar ring por fora da borda branca)
- Inputs do form de reserva

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(a11y): adiciona focus ring rosa em :focus-visible global

Atende WCAG 2.4.7 (Focus Visible). Ring só aparece em navegação por
teclado/AT, não em click do mouse. Cor rosa translúcido para integrar
com a Abordagem B do design system."
```

---

## Task 7: Migrar `.hero-cta` em new-sections.css para tokens

**Files:**
- Modify: `src/styles/new-sections.css:108-132`

- [ ] **Step 1: Substituir gradient e shadow hardcoded**

Em `src/styles/new-sections.css`, na regra `.hero-cta` (linha 111), trocar:

```css
.hero-cta {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 1rem 3rem;
  background: linear-gradient(90deg, #f26294 0%, #f2662b 100%);
  color: #fff;
  text-decoration: none;
  border-radius: 100px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 6px 20px rgba(242, 102, 43, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(242, 102, 43, 0.45);
}
```

por:

```css
.hero-cta {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 1rem 3rem;
  background: var(--btn-hero-bg);
  color: var(--btn-hero-text);
  text-decoration: none;
  border-radius: var(--radius-pill);
  font-family: var(--font-primary);
  font-weight: var(--fw-bold);
  font-size: clamp(0.9rem, 1.1vw, 1rem);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: var(--btn-hero-shadow);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(242, 102, 43, 0.45);
}
```

**Nota sobre o `box-shadow:hover`:** o shadow do hover (`0 12px 30px rgba(242, 102, 43, 0.45)`) não tem token equivalente (é único). Deixar inline por enquanto — pode ser adicionado como `--shadow-glow-orange-strong` em fase futura se reaparecer.

- [ ] **Step 2: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 3: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Olhar a section `#inicio` (Hero). **Esperado:** o botão "Reservar minha data" continua idêntico (mesmo gradient, mesma cor de texto, mesmo box-shadow inicial). Hover faz translateY igual antes.

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

- [ ] **Step 5: Commit**

```bash
git add src/styles/new-sections.css
git commit -m "refactor(css): migra .hero-cta para tokens do design system

Gradient e shadow hardcoded substituídos por var(--btn-hero-*). Mesma
aparência, agora respeitando a fonte única de verdade da paleta IDV."
```

---

## Task 8: Migrar cinzas e brancos hardcoded em new-sections.css

**Files:**
- Modify: `src/styles/new-sections.css:62, 96, 152, 183, 204`

- [ ] **Step 1: Substituir `#1a1a1a`, `#2a2a2a`, `#999`, `#fff`**

Em `src/styles/new-sections.css`, fazer 5 substituições:

**Linha 62** (`img.cover-image`):
```css
img.cover-image {
  background: linear-gradient(135deg, var(--gray-800) 0%, var(--gray-700) 100%);
}
```

**Linha 96** (`.hero-tagline`):
```css
.hero-tagline {
  /* ... outros props inalterados ... */
  color: var(--text-primary);
  opacity: 0.95;
}
```

**Linha 152** (`.estrutura-disclaimer`):
```css
.estrutura-disclaimer {
  font-style: italic;
  color: var(--gray-400);
  margin-bottom: 1.5rem;
}
```

**Linha 183** (`.bar-card`):
```css
.bar-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--gray-800) 0%, var(--gray-700) 100%);
  aspect-ratio: 3 / 4;
}
```

**Linha 204** (`.bar-card h4`):
```css
.bar-card h4 {
  /* ... outros props inalterados ... */
  color: var(--text-primary);
  /* ... */
}
```

- [ ] **Step 2: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 3: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Olhar:
- Section `#estrutura` (grid de bares) — cards de bar têm o mesmo fundo escuro gradiente que antes
- Disclaimer em itálico cinza — mesma cor
- Imagens com fallback (se houver alguma placeholder) — mesmo fundo

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

- [ ] **Step 5: Commit**

```bash
git add src/styles/new-sections.css
git commit -m "refactor(css): migra cinzas hardcoded para tokens --gray-*

Substitui #1a1a1a/#2a2a2a/#999 por var(--gray-700/--gray-800/--gray-400)
em .bar-card, img.cover-image e .estrutura-disclaimer. Visual idêntico,
escala de cinzas agora unificada."
```

---

## Task 9: Migrar cores hardcoded em Menu.astro e ReserveForm.astro

**Files:**
- Modify: `src/components/Menu.astro:112, 121`
- Modify: `src/components/ReserveForm.astro:199`

- [ ] **Step 1: Substituir em Menu.astro**

Linha 112: `color: #b8b8b8;` → `color: var(--gray-300);` (próximo equivalente — `#b8b8b8` ≈ `#b3b3b3`)
Linha 121: `color: #fff;` → `color: var(--text-primary);`

- [ ] **Step 2: Substituir em ReserveForm.astro**

Linha 199: `color: #fff;` → `color: var(--text-primary);`

- [ ] **Step 3: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 4: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Olhar section `#menu` (cards de drinks) e section `#reserva` (form). **Esperado:** textos cinza-claros e brancos idênticos ao estado anterior.

- [ ] **Step 5: Pedir aprovação ao Luis para o commit**

- [ ] **Step 6: Commit**

```bash
git add src/components/Menu.astro src/components/ReserveForm.astro
git commit -m "refactor(components): migra cores hardcoded para tokens

#b8b8b8 vira var(--gray-300) (matiz ~equivalente) e #fff vira
var(--text-primary) nos componentes Menu e ReserveForm."
```

---

## Task 10: Migrar `#fff` e `#000` em global.css para tokens

**Files:**
- Modify: `src/styles/global.css` — substituições globais

- [ ] **Step 1: Preparar mapeamento mental**

`global.css` tem ~146 hex hardcoded. Esta task ataca os mais comuns: `#fff` (whites) e `#000` (blacks). **Estratégia: substituição em massa com sed via Biome auto-fix manual.** Não usar find&replace cego — alguns `#000` aparecem em `rgba()` ou em shadow declarações onde a substituição não agrega.

**Regras de substituição:**
- `color: #fff;` → `color: var(--brand-white);`
- `color: #000;` → `color: var(--brand-black);`
- `background-color: #000;` → `background-color: var(--brand-black);`
- `background-color: #fff;` → `background-color: var(--brand-white);`
- `border-color: #fff;` → `border-color: var(--brand-white);`
- `border-color: #000;` → `border-color: var(--brand-black);`
- `border-bottom-color: #fff;` → `border-bottom-color: var(--brand-white);`
- `border: <width> solid #fff;` → `border: <width> solid var(--brand-white);` (width varia: `0.09em`, `0.1em`, `0.12em`, `0.15em`, `0.3em`, `1px`, `2px`, `4px`)
- `border: <width> solid #000;` → `border: <width> solid var(--brand-black);`
- `border: 0 solid #fff;` / `border: 0 solid #000;` / `border: 0 #fff` / `border: 0 #000` → substituir o hex por tokens (width 0 mas ainda é um valor literal)
- Hex dentro de shadow/gradient sólido (`text-shadow: ... #000`, `linear-gradient(#000, ...)`) — **MIGRAR também:** `#000` → `var(--brand-black)`, `#fff` → `var(--brand-white)`
- Hex com alpha curto (`#fff0`, `#0000`, `#ddd0`) — substituir por `transparent` (são equivalentes; mais legível)
- Hex com alpha customizado (`#00000070`, `#0006`, `#000000b8`) — **converter para `rgba(0, 0, 0, X)` explícito** para deixar o alpha visível. Sem token equivalente.

- [ ] **Step 2: Identificar candidatos**

```bash
grep -nE "#(fff|000)[^0-9a-fA-F]" src/styles/global.css | wc -l
```

Esperado: ~60 linhas no total (incluindo borders). Anotar antes de começar.

- [ ] **Step 3: Substituir em batches via sed cirúrgico**

Rodar um por vez e revisar diff entre cada (`git diff src/styles/global.css | head -60`):

```bash
# Cores
sed -i '' 's/color: #fff;/color: var(--brand-white);/g' src/styles/global.css
sed -i '' 's/color: #000;/color: var(--brand-black);/g' src/styles/global.css
sed -i '' 's/background-color: #fff;/background-color: var(--brand-white);/g' src/styles/global.css
sed -i '' 's/background-color: #000;/background-color: var(--brand-black);/g' src/styles/global.css

# Borders (color e shorthand)
sed -i '' 's/border-color: #fff;/border-color: var(--brand-white);/g' src/styles/global.css
sed -i '' 's/border-color: #000;/border-color: var(--brand-black);/g' src/styles/global.css
sed -i '' 's/border-bottom-color: #fff;/border-bottom-color: var(--brand-white);/g' src/styles/global.css
sed -i '' 's/solid #fff;/solid var(--brand-white);/g' src/styles/global.css
sed -i '' 's/solid #000;/solid var(--brand-black);/g' src/styles/global.css
sed -i '' 's/border: 0 #fff;/border: 0 var(--brand-white);/g' src/styles/global.css
sed -i '' 's/border: 0 #000;/border: 0 var(--brand-black);/g' src/styles/global.css

# Alpha 0 (transparent)
sed -i '' 's/#fff0/transparent/g' src/styles/global.css
sed -i '' 's/#ddd0/transparent/g' src/styles/global.css

# Hex sólidos em shadow/gradient
sed -i '' 's/text-shadow: 0 0 16px #00000070;/text-shadow: 0 0 16px rgba(0, 0, 0, 0.44);/g' src/styles/global.css
sed -i '' 's/11px #000,/11px var(--brand-black),/g' src/styles/global.css
sed -i '' 's/11px #000;/11px var(--brand-black);/g' src/styles/global.css
```

Para os gradients e shadows com hex (`linear-gradient(#000, #0000 60%)`, `#000000b8`, `#0006`), fazer Edit tool manual linha por linha — sed pode pegar substring errada. Lista:

- Linha ~340: `linear-gradient(#000, #0000 60%)` → `linear-gradient(var(--brand-black), transparent 60%)`
- Linha ~348: `linear-gradient(to top, #000, #0000 52%)` → `linear-gradient(to top, var(--brand-black), transparent 52%)`
- Linha ~629: `linear-gradient(to top, #000000b8, #000000b8 24%, #0006)` → `linear-gradient(to top, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.72) 24%, rgba(0, 0, 0, 0.4))`
- Linha ~1157: `background-color: #ddd0;` (após sed → `transparent;`) — confirmar.
- Linha ~1195: `linear-gradient(#000 59%, #0000)` → `linear-gradient(var(--brand-black) 59%, transparent)`
- Linha ~1760: `box-shadow: 0 0 100px 70px #0000008c;` → `box-shadow: 0 0 100px 70px rgba(0, 0, 0, 0.55);`
- Linha ~1823: `linear-gradient(to bottom, transparent, #000000bf 42%, var(--black) 79%)` → `linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.75) 42%, var(--brand-black) 79%)` (também troca `var(--black)` → `var(--brand-black)` aproveitando)
- Linha ~1928: `color: #ff2525;` → `color: var(--error);` (já temos o token!)
- Linha ~2023: `color: #f11;` → `color: var(--error-soft);` (já temos o token!)

- [ ] **Step 4: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
pnpm test
```

- [ ] **Step 5: Smoke visual completo**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. **Passar por TODAS as sections:** Hero, Sobre, Estrutura, Menu (todas as tabs), Equipe, Reserva, Contato. **Esperado:** zero mudança visual — todos os var() resolvem para os mesmos valores hex anteriores.

Se algo mudou (provavelmente um `#fff` que era na verdade um seletor de estado, ou substituição que pegou um border-color), reverter aquela linha e seguir.

- [ ] **Step 6: Pedir aprovação ao Luis para o commit**

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor(css): migra brancos/pretos hardcoded em global.css para tokens

color, background-color, border-color, border-bottom-color e border
shorthand (com #fff/#000) viram var(--brand-white|--brand-black). Hex
com alpha 0 (#fff0/#ddd0) viram transparent. Alpha customizado
(#00000070/#000000b8/#0006) vira rgba() explícito. Hex em gradients
sólidos também migrados. Visual idêntico."
```

---

## Task 11: Migrar cinzas restantes em global.css

**Files:**
- Modify: `src/styles/global.css` — múltiplas linhas com `#ccc`, `#b3b3b3`, `#d9d9d9`, `#4d4d4d`, `#999`, `#8c8c8c`

- [ ] **Step 1: Identificar candidatos**

```bash
grep -nE "#(ccc|b3b3b3|d9d9d9|4d4d4d|999|8c8c8c|8a8a8a)" src/styles/global.css
```

- [ ] **Step 2: Substituir um por um**

Mapeamento:
- `#ccc` → `var(--gray-200)`
- `#b3b3b3` → `var(--gray-300)`
- `#d9d9d9` → `var(--gray-100)` (próximo equivalente — `#d9d9d9` ≈ `#e5e5e5`)
- `#4d4d4d` → `var(--gray-600)` (próximo equivalente — `#4d4d4d` ≈ `#555`)
- `#999` → `var(--gray-400)` (exato)
- `#8c8c8c` → `var(--gray-400)` (próximo equivalente — `#8c8c8c` ≈ `#999`)
- `#8a8a8a` → `var(--gray-400)` (próximo equivalente — `#8a8a8a` ≈ `#999`)

Usar Edit tool com `replace_all: true` por hex, depois revisar diff.

- [ ] **Step 3: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
```

- [ ] **Step 4: Smoke visual**

```bash
pnpm dev
```
Abrir `http://localhost:4321`. Verificar especificamente onde esses cinzas estavam: `figcaption`, `.small-gray-font`, alguns dividers. Aceitável que `#d9d9d9` vire um pouco mais claro (`#e5e5e5`) e `#4d4d4d` mais escuro (`#555`) — discutir com Luis se a mudança for perceptível.

- [ ] **Step 5: Pedir aprovação ao Luis para o commit**

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "refactor(css): migra cinzas hardcoded para tokens --gray-*

Substitui #ccc/#b3b3b3/#d9d9d9/#4d4d4d/#999/#8c8c8c pelos tokens mais
próximos da escala. Pequena variação de tom em #d9d9d9 (->--gray-100),
#4d4d4d (->--gray-600) e #8c8c8c (->--gray-400) — validado visualmente
sem regressão."
```

---

## Task 11b: Auditoria final de hex hardcoded (gate de "zero hex")

**Files:** verificação em todos os CSS/Astro do projeto.

**Por que essa task:** depois das migrações em massa, fazer um sweep que garante que NADA de hex sobreviveu sem ser uma exceção explicitamente documentada. Esta é a task que faz valer o critério §8 do spec ("zero hex hardcoded").

- [ ] **Step 1: Listar hex restantes nos arquivos de produção**

```bash
grep -rnE "#[0-9a-fA-F]{3,8}([^0-9a-fA-F]|$)" \
  src/styles/global.css \
  src/styles/new-sections.css \
  src/components/*.astro \
  src/layouts/*.astro
```

- [ ] **Step 2: Classificar cada match**

Cada linha encontrada deve cair em **uma** das categorias:

| Categoria | Ação |
|---|---|
| (a) Hex em comentário (ex: `/* IDV: #F26294 */`) | OK — manter |
| (b) `--error: #ff2525`, `--error-soft: #f11`, `--success: #34c759` | OK — exceção §8 (UX > paleta) |
| (c) Hex em primitive token (`--brand-pink: #F26294`, `--gray-*: #...`) | OK — esse é o ponto |
| (d) Qualquer outro hex em uso (color, background, border, gradient, shadow) | **NÃO OK** — migrar para token, `transparent`, ou `rgba()` |

- [ ] **Step 3: Resolver categoria (d), se houver**

Para cada match da categoria (d):
- Se tem token equivalente em `:root` → trocar por `var(--token)`
- Se é alpha 0 (`#fff0`, `#0000`) → trocar por `transparent`
- Se é alpha customizado (`#00000070`, `#0006`) → trocar por `rgba(0, 0, 0, X)` explícito
- Se nenhum dos acima encaixa, parar e discutir com Luis antes de seguir.

- [ ] **Step 4: Re-rodar grep e validar resultado**

```bash
grep -rnE "#[0-9a-fA-F]{3,8}([^0-9a-fA-F]|$)" \
  src/styles/global.css \
  src/styles/new-sections.css \
  src/components/*.astro \
  src/layouts/*.astro \
  | grep -vE "^[^:]+:[0-9]+:\s*(--brand-|--gray-|--error|--success|/\*|//)"
```

**Esperado:** zero output. Se aparecer alguma linha, voltar ao Step 3.

- [ ] **Step 5: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
pnpm test
```

- [ ] **Step 6: Smoke visual completo**

```bash
pnpm dev
```
Passar por todas as sections novamente. **Esperado:** zero mudança visual.

- [ ] **Step 7: Pedir aprovação ao Luis para o commit**

- [ ] **Step 8: Commit (apenas se Step 3 fez alguma mudança)**

```bash
git add src/styles src/components src/layouts
git commit -m "chore(css): sweep final de hex restantes para tokens/rgba/transparent

Garante o critério \"zero hex hardcoded\" do spec do design system §8.
Hex sobreviventes às migrações em massa migrados individualmente
para var(--*) ou rgba()/transparent explícitos. Exceções aceitas:
--error/--error-soft/--success (UX > paleta, intencional)."
```

**Se Step 3 não exigiu nenhuma mudança** (todas as migrações anteriores já cobriram tudo), pular o commit e seguir.

---

## Task 12: Remover dead code de botões do template Webflow

**Files:**
- Modify: `src/styles/global.css` — remover regras `.button.btn-yellow`, `.btn-medium`, `.btn-fill-white`, `.btn-white`, `.template`

- [ ] **Step 1: Confirmar dead code com nova auditoria**

```bash
grep -rnE "btn-yellow|btn-medium|btn-fill-white|btn-white|btn-small.template" src/ --include="*.astro" --include="*.ts" --include="*.yml"
```

Esperado: **zero matches** (já confirmado em auditoria de 2026-05-19, mas vale validar antes de remover).

Se aparecer algum match, **abortar essa task** e investigar antes.

- [ ] **Step 2: Remover regras**

Em `src/styles/global.css`, remover (linhas aproximadas, podem ter shiftado):

- `.button.btn-small.btn-yellow` (linha ~179)
- `.button.btn-small.btn-fill-white:hover` (linha ~184)
- `.button.btn-small.template` + `:hover` (linhas ~188-205)
- `.button.btn-yellow` + `:hover` (linhas ~207-216)
- `.button.btn-medium` + `.button.btn-medium.btn-yellow:hover` (linhas ~218-226)
- `.button.btn-fill-white` (linha ~228)
- `.button.btn-white:hover` (linha ~233)

Manter: `.button` base, `.button:hover`, `.button.btn-small` — ainda usadas pela transição.

- [ ] **Step 3: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
pnpm test
```

- [ ] **Step 4: Smoke visual completo**

```bash
pnpm dev
```
Passar por TODAS as sections. **Esperado:** zero mudança — essas classes não eram referenciadas em nenhum `.astro`.

- [ ] **Step 5: Pedir aprovação ao Luis para o commit**

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "chore(css): remove regras de botões legacy não usadas

Auditoria confirmou que .button.btn-yellow, .btn-medium,
.btn-fill-white, .btn-white e .btn-small.template não aparecem
em nenhum .astro. Dead code do template Webflow original
(\"Resturanto\") — remoção segura."
```

---

## Task 13: Remover aliases legacy de tokens (`--yellow`, `--light-grey`, etc.)

**Files:**
- Modify: `src/styles/global.css` — remover bloco "Legacy aliases" do `:root`

- [ ] **Step 1: Confirmar que ninguém usa mais os aliases**

```bash
grep -rnE "var\(--(yellow|light-grey|dark-grey|white|black)\)" src/styles src/components --include="*.css" --include="*.astro"
```

Lista cada uso restante. Para cada match:
- `var(--yellow)` → `var(--brand-white)` (mesmo valor)
- `var(--light-grey)` → `var(--gray-200)`
- `var(--dark-grey)` → `var(--gray-500)`
- `var(--white)` → `var(--brand-white)`
- `var(--black)` → `var(--brand-black)`

Substituir um a um (são poucos — `figcaption` usa `--light-grey`, `.yellow` class usa `--yellow`, etc.).

- [ ] **Step 2: Remover o bloco "Legacy aliases" do `:root`**

Em `src/styles/global.css`, remover as últimas linhas do `:root` (introduzidas na Task 1):

```css
/* ───────────────────────────────────────────────────────────
 * Legacy aliases — preservados durante a migração (Fase 5).
 * Apontam pros novos primitives. Serão removidos na Fase 6.
 * ─────────────────────────────────────────────────────────── */
--light-grey: var(--gray-200);
--white: var(--brand-white);
--black: var(--brand-black);
--yellow: var(--brand-white);
--dark-grey: var(--gray-500);
```

- [ ] **Step 3: Verificações estáticas**

```bash
pnpm check
pnpm ts:check
pnpm test
```

- [ ] **Step 4: Smoke visual completo**

```bash
pnpm dev
```
Passar por TODAS as sections. **Esperado:** zero mudança.

- [ ] **Step 5: Pedir aprovação ao Luis para o commit**

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css
git commit -m "chore(css): remove aliases legacy do template Webflow

Migra os últimos usos de var(--yellow|--white|--black|--light-grey|
--dark-grey) para os tokens do design system e remove os aliases do
:root. Fim da Fase 6 (Cleanup) — :root agora contém apenas tokens IDV."
```

---

## Task 14: Atualizar `docs/patterns/css.md`

**Files:**
- Modify: `docs/patterns/css.md`

- [ ] **Step 1: Editar a seção "Princípios"**

Em `docs/patterns/css.md`, substituir a linha 10 (atual):

```markdown
- **Branco é o default** em UI — botões, focus, borders, accents. Rosa/laranja só em destaques pontuais (hero, CTA principal, etc.). Aplicar rosa wholesale em todo elemento interativo foi rejeitado pelo cliente em 2026-05-04.
```

por:

```markdown
- **Acento controlado da marca** (Abordagem B, aprovada 2026-05-19). Texto e botões secundários permanecem brancos; rosa aparece em focus (`:focus-visible`), links no hover, eyebrows/chips, loop SVG decorativo e border-hover. Gradient rosa→laranja em CTAs primários e hero. Aplicar rosa **wholesale** em todo elemento interativo foi rejeitado em 2026-05-04 — não voltar atrás sem revisitar a decisão.
```

- [ ] **Step 2: Atualizar a seção "✅ Bom" para refletir tokens novos**

Onde a seção mostra `--color-brand-*`, substituir pelos nomes reais que entraram em produção: `--brand-pink`, `--brand-orange`, `--brand-white`, `--brand-black`, `--brand-gradient`. Adicionar exemplo de `--accent`, `--focus-ring`, `--btn-menu-fill`.

- [ ] **Step 3: Atualizar referências em "Referências"**

Adicionar:
```markdown
- Spec do design system: `docs/superpowers/specs/2026-05-19-design-system-tokens.md`
- Plano de implementação: `docs/superpowers/plans/2026-05-19-design-system-implementation.md`
```

- [ ] **Step 4: Pedir aprovação ao Luis para o commit**

- [ ] **Step 5: Commit**

```bash
git add docs/patterns/css.md
git commit -m "docs(patterns): atualiza css.md para Abordagem B do design system

Substitui a regra \"branco como default wholesale\" pela nova diretriz
de acento controlado da marca. Adiciona referências ao spec e plan
do design system de 2026-05-19."
```

---

## Task 15: Atualizar `docs/brandbook/IDENTIDADE_VISUAL.md` §7

**Files:**
- Modify: `docs/brandbook/IDENTIDADE_VISUAL.md`

- [ ] **Step 1: Adicionar entrada de 2026-05-19**

Na seção §7 "Pendências relacionadas à IDV", logo após a entrada de 2026-05-04 sobre cores, adicionar:

```markdown
- [x] ~~Reavaliar aplicação da marca após feedback do cliente~~ — em 2026-05-19, após validação visual em preview externo (`/tmp/cinnamon-ds-preview/`), Luís aprovou a **Abordagem B "Acento"**: branco continua default em texto e botões secundários, mas rosa volta a aparecer em focus, links no hover, eyebrows/chips, loop SVG decorativo e border-hover. Gradient rosa→laranja em CTAs primários e botão Menu (liquid-fill). Detalhes em `docs/superpowers/specs/2026-05-19-design-system-tokens.md` e `docs/superpowers/plans/2026-05-19-design-system-implementation.md`.
```

- [ ] **Step 2: Pedir aprovação ao Luis para o commit**

- [ ] **Step 3: Commit**

```bash
git add docs/brandbook/IDENTIDADE_VISUAL.md
git commit -m "docs(brandbook): registra aprovação da Abordagem B do design system

Linka spec e plan de implementação."
```

---

## Task 16: Atualizar memory persistente

**Files:**
- Modify: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/feedback_neutral_default_colors.md`
- Create: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/decision_design_system_2026-05-19.md`
- Modify: `~/.claude/projects/-Users-luiscarlos-Documents-Dev-cinnamon-drinks-webflow-cinnamon-drinks/memory/MEMORY.md`

**Importante:** estes arquivos ficam fora do repo (memory é pessoal do dev). **Não comitar nada nesta task — só editar.**

- [ ] **Step 1: Editar `feedback_neutral_default_colors.md`**

Adicionar no início do conteúdo (após o frontmatter):

```markdown
**⚠️ SUPERSEDED em 2026-05-19** pela Abordagem B do design system (`docs/superpowers/specs/2026-05-19-design-system-tokens.md`). A regra "branco como default wholesale" foi revisada: branco continua default em texto e botões secundários, mas rosa/gradient voltam a aparecer em focus, links no hover, eyebrows, loop SVG e CTAs primários. O motivo original do feedback do cliente (rosa em botão "Menu" mobile) foi endereçado de outra forma (liquid-fill com gradient em vez de fundo sólido rosa). Ver `[[decision_design_system_2026-05-19]]`.

---

(conteúdo original abaixo)
```

- [ ] **Step 2: Criar `decision_design_system_2026-05-19.md`**

```markdown
---
name: decision-design-system-2026-05-19
description: Abordagem B do design system aprovada — marca presente sem dominar, com tokens em :root e migração faseada
metadata:
  type: project
---

Abordagem B "Acento" do design system foi aprovada por Luís em 2026-05-19 após validação visual em preview externo. Substitui parcialmente `[[feedback_neutral_default_colors]]` (decisão de 2026-05-04 que tratava rosa wholesale como rejeitado).

**Why:** o estado pós-2026-05-04 (branco wholesale, marca quase invisível) ficou estéril. Em vez de reverter por completo a decisão antiga, fizemos preview com 3 abordagens (`/tmp/cinnamon-ds-preview/`) e Luís escolheu a B — marca em focus/links/eyebrows/loop SVG e gradient em CTAs primários, mantendo branco em texto e botões secundários (que era o ponto crítico do feedback original).

**How to apply:** quando tocar em CSS, usar os tokens do `:root` em `src/styles/global.css` (Fase 1 do plan já introduziu). Spec completo em `docs/superpowers/specs/2026-05-19-design-system-tokens.md`, plano de execução em `docs/superpowers/plans/2026-05-19-design-system-implementation.md`. Política de commits: per `~/.claude/CLAUDE.md` §13, **cada commit precisa de aprovação explícita** — não comitar em batch sem ok do Luís.

Risco residual: cliente pode reagir igual a 2026-05-04. Mitigação registrada no spec §6: mostrar preview externo ao cliente antes de fazer merge para `main`.
```

- [ ] **Step 3: Editar `MEMORY.md` para adicionar a nova entrada e marcar a antiga**

Substituir a linha:
```markdown
- [Default to white, not brand pink/orange](feedback_neutral_default_colors.md) — keep UI elements neutral white by default; only apply brand pink/orange case-by-case
```

por:
```markdown
- [Default to white, not brand pink/orange — SUPERSEDED](feedback_neutral_default_colors.md) — substituído em 2026-05-19; ver decisão atual abaixo
- [Design System — Abordagem B aprovada 2026-05-19](decision_design_system_2026-05-19.md) — marca presente em focus/links/eyebrows/loop/CTAs sem dominar; spec e plan no repo
```

- [ ] **Step 4: Nada para comitar (memory fica fora do repo)**

---

## Self-Review

Após escrever o plano, faço uma checagem final aqui:

**Spec coverage (skim de cada seção do spec):**
- §2 (Decisões load-bearing): cobertas pelas Tasks 1-7. ✓
- §3 (Tokens): Task 1. ✓
- §4 (Componentes): `.btn--menu` em Task 5; `.eyebrow` e `.btn--primary/secondary/ghost/hero` ainda não implementados no codebase real (não há call site novo) — **gap aceito** porque nenhum componente do projeto atual usa esses ainda; eles ficam disponíveis como API do design system para tasks futuras (novas seções, redesign de cards, etc.). Loop SVG: Tasks 2-3. ✓
- §5 (Migração): Tasks 7-13. ✓
- §5.2.1 (Dead code): Task 12. ✓
- §5.3 (O que NÃO muda): respeitado em todas as tasks (webflow.js, jQuery, content/, layouts). ✓
- §6 (Riscos): mitigações refletidas (visual smoke após cada task, commit gated por aprovação, manter `border.svg` no repo). ✓
- §7 (Plano de fases): Tasks 1-13 implementam as 6 fases. ✓
- §8 (Critérios de pronto): checklist atendido pelas Tasks 1-16. ✓
- §8.1 (Política de commits): Step "Pedir aprovação ao Luis" em todas as tasks com commit. ✓

**Placeholder scan:**
- Procurei por TBD/TODO/"implement later"/"add appropriate error handling" — nenhum match (exceto referência ao TBD pré-existente no Navbar sobre dropdown — não introduzido por mim, é comentário herdado).

**Type consistency:**
- `.btn--menu` consistente entre §4.2 do spec, preview e Task 5.
- `--btn-menu-fill` / `--btn-menu-text-hover` consistentes entre spec §3.7 e Task 1.
- Nome do SVG `border-gradient.svg` consistente entre Tasks 2 e 3.
- `.fill-bg` e `.label` (spans internos) consistentes entre Task 4 e Task 5.

Nenhuma correção adicional necessária.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-19-design-system-implementation.md`. Two execution options:

**1. Subagent-Driven (recommended)** — dispatch um subagent fresco por task, com review entre tasks (mais isolado, fácil de pausar/reverter)

**2. Inline Execution** — executar as tasks nesta sessão com checkpoints (mais rápido, contexto compartilhado)

Qual abordagem?
