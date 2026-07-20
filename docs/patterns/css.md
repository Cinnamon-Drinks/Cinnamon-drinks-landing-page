# CSS patterns para Cinnamon Drinks

> Quando trabalhar com CSS neste projeto, consulte estes padrões.
> Última revisão: 2026-05-19 · Versão da stack: CSS3 nativo, sem framework utilitário

## Princípios

- **Outfit** é a única fonte. **Nunca Nexa** (sem licença comercial), **nunca Poppins** (template antigo). Pesos: 100 (Thin) e 700 (Bold) primários.
- Paleta IDV: preto puro `#000000` (NÃO `#00324E`) + rosa `#F26294` + laranja `#F2662B` + branco `#ffffff`. Degradê oficial: `linear-gradient(90deg, #F26294 0%, #F2662B 100%)`.
- **Acento controlado da marca** (Abordagem B, aprovada 2026-05-19). Texto e botões secundários permanecem brancos; rosa aparece em `:focus-visible`, links no hover, eyebrows/chips, loop SVG decorativo (`border-gradient.svg` em "Reservar" no navbar) e `border-hover`. Gradient rosa→laranja em CTAs primários (`.hero-cta`, `.btn--primary`, `.btn--menu` no hover). Aplicar rosa **wholesale** em todo elemento interativo foi rejeitado em 2026-05-04 — não voltar atrás sem revisitar a decisão. Spec completo: `docs/superpowers/specs/2026-05-19-design-system-tokens.md`.
- **Tokens em `:root`** (`src/styles/global.css`): primitives (`--brand-*`, `--gray-*`, `--error*`, `--success`), tipografia (`--font-primary`, `--fw-*`, `--fs-*`), spacing (`--space-*`), radii, shadows, motion, semantic (`--surface-*`, `--text-*`, `--accent*`, `--border*`, `--link*`, `--focus-ring`, `--btn-*`). **Zero hex hardcoded** fora de `:root` — usar `var(--token)`, `rgba()` ou `transparent`. Validação: `grep -E "#[0-9a-fA-F]{3,8}" src/styles/global.css src/styles/new-sections.css src/components/*.astro` só pode retornar matches em declarações de `:root` ou comentários.
- Classes Webflow `w-*` (`w-nav`, `w-button`, `w-inline-block`, etc.) são **imutáveis**. `webflow.js` IX2 depende delas para animações. Adicionar nossas classes ao lado, **nunca substituir**.
- Convenção de nomes: **kebab-case**. Estados com prefixo `is-` (`is-active`, `is-open`). BEM-light (`block__elem`, `block--mod`) — usar consistentemente em classes novas do DS (`.btn`, `.btn--menu`, `.btn__label`, `.nav__link--circled`).
- CSS específico de componente fica em `<style>` do `.astro` (escopo automático). CSS global em `src/styles/global.css`. Tokens em `:root`.

## ✅ Bom

```css
/* src/styles/global.css — tokens IDV em :root (extrato — ver arquivo completo) */
:root {
  /* Primitives — IDV oficial */
  --brand-black: #000000;
  --brand-pink: #F26294;
  --brand-orange: #F2662B;
  --brand-white: #ffffff;
  --brand-gradient: linear-gradient(90deg, #F26294 0%, #F2662B 100%);

  /* Gray scale (sistema, não IDV) */
  --gray-300: #b3b3b3; --gray-700: #2a2a2a; /* etc — 10 stops */

  /* Tipografia */
  --font-primary: 'Outfit', system-ui, sans-serif;
  --fw-thin: 100; --fw-bold: 700;

  /* Semantic (Abordagem B) */
  --text-primary: var(--brand-white);
  --accent: var(--brand-pink);
  --link-hover: var(--brand-pink);
  --focus-ring: 0 0 0 3px rgba(242, 98, 148, 0.55);
  --btn-menu-fill: var(--brand-gradient);
  --circle-emphasis-image: url('/images/border-gradient.svg');
}

body {
  font-family: var(--font-primary);
  color: var(--text-primary);
  background-color: var(--brand-black);
}

:focus-visible {
  outline: 0;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-sm);
}
```
**Por quê:** dois níveis de tokens (primitives ↔ semantic) permitem mudar paleta sem refatorar componentes. `--brand-*` vem da IDV, `--gray-*` é sistema, `--accent`/`--text-*`/etc são "como a UI usa". Componentes nunca tocam hex direto — só semantic tokens.

```html
<!-- Adicionar classes ao lado das w-*, nunca substituir -->
<a href="/" class="w-nav-brand cinnamon-logo-link" aria-label="Cinnamon Drinks home">
  <img src="/logo.svg" alt="" class="cinnamon-logo">
</a>
```
**Por quê:** `w-nav-brand` é IX2-aware (Webflow aplica behavior do nav). `cinnamon-logo-link` é nossa — controla layout/tamanho/hover. Coexistem.

```css
/* Estados com prefixo is- */
.cinnamon-cta {
  border: 2px solid var(--brand-white);
  background: transparent;
  color: var(--brand-white);
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);
}
.cinnamon-cta:hover,
.cinnamon-cta.is-active {
  background: var(--brand-white);
  color: var(--brand-black);
}
/* focus-visible global ja cuida (regra global em :focus-visible) */
```
**Por quê:** branco como default em texto/borders/buttons secundários. Rosa via `:focus-visible` global (não precisa repetir aqui). `is-active` para estados controlados via JS — separa de `:hover` que é puro CSS.

```astro
---
// Componente .astro com <style> escopado
---
<section class="hero">
  <h1 class="hero__title">Cinnamon Drinks</h1>
  <p class="hero__lede">Coquetelaria autoral em Lavras-MG.</p>
</section>

<style>
  .hero {
    background: var(--color-brand-gradient);
    padding: 6rem 1.5rem;
    color: var(--color-brand-white);
  }
  .hero__title {
    font-weight: var(--font-weight-bold);
    font-size: clamp(2.5rem, 8vw, 5rem);
  }
  .hero__lede {
    font-weight: var(--font-weight-thin);
    max-width: 40ch;
  }
</style>
```
**Por quê:** Astro escopa `<style>` automaticamente — `.hero` aqui não vaza. Gradiente IDV usado em destaque pontual (hero), não wholesale. `clamp()` para tipografia fluida.

```css
/* Aplicação narrow do degradê — só onde IDV pediu */
.section--featured {
  background: var(--brand-gradient);
  color: var(--brand-white);
}
.cinnamon-form-input:focus {
  border-color: var(--accent); /* rosa = --brand-pink na Abordagem B */
}
```
**Por quê:** rosa/laranja entram em destaque quando há intenção visual (seção destacada, focus de form, hover de link). Default permanece neutro em texto e backgrounds. Use o token `--accent` (semantic) em vez de `--brand-pink` direto — se a marca de acento mudar amanhã, só edita o token.

## ❌ Ruim

```css
/* Renomear classe Webflow */
.menu-nav { /* ← renomeada de .w-nav */
  display: flex;
}
```
**Problema:** `webflow.js` IX2 procura `.w-nav` literal no DOM para aplicar behavior de mobile menu. Renomear quebra tudo silenciosamente — menu para de abrir, sem erro no console. Adicione classe nova ao lado.

```css
/* Rosa wholesale em todo botão */
.button,
.cta,
.menu-toggle,
[type="submit"] {
  background: #F26294;
  color: #fff;
}
```
**Problema:** rejeitado pelo cliente em 2026-05-04 (memory `feedback_neutral_default_colors.md`). Específico: botão "Menu" mobile virando rosa foi citado como "não atrativo". Default = branco/preto neutro; rosa só em destaque consciente.

```css
/* Hardcoded de cores e fontes */
.section-title {
  color: #F2662B;
  font-family: 'Poppins', sans-serif; /* ← Poppins não é mais a fonte */
}
.alt-section {
  color: #00324E; /* ← brand book diz isso, mas projeto usa #000 */
}
```
**Problema:** três bugs. Poppins foi removida em 2026-05-04 (Outfit é a oficial). `#00324E` foi rejeitado em favor de `#000000` puro. Hardcoded escapa de mudanças globais — use `var(--brand-*)` ou `var(--accent)`. Auditoria automatizada via grep (`#[0-9a-fA-F]` em `src/styles/*.css` ou `src/components/*.astro`) DEVE retornar zero matches fora de declarações em `:root`.

```css
/* CamelCase ou snake_case */
.heroSection { }
.hero_title { }
.HeroLede { }
```
**Problema:** convenção do projeto é **kebab-case**. Linter vai marcar; PR review vai pedir mudança. Padronize do início.

```html
<!-- Inline style para coisa estrutural -->
<div style="background: linear-gradient(90deg, #F26294, #F2662B); padding: 96px 24px;">
```
**Problema:** sem reuso, sem token, sem responsividade fácil. Tokens (`--color-brand-gradient`) e classe (`.section--featured`) cobrem o caso e ficam editáveis.

```css
/* Outline removido sem replacement */
*:focus { outline: none; }
```
**Problema:** WCAG 2.4.7 (Focus Visible) violado. Usuário de teclado fica perdido. Se quiser tirar o outline default, **substitua** com `:focus-visible { box-shadow: var(--focus-ring); }`.

## Referências

- IDV oficial: `docs/brandbook/IDENTIDADE_VISUAL.md`
- **Spec do design system: `docs/superpowers/specs/2026-05-19-design-system-tokens.md`**
- **Plano de implementação: `docs/superpowers/plans/2026-05-19-design-system-implementation.md`**
- Memory — branco default (superseded 2026-05-19): `~/.claude/projects/.../memory/feedback_neutral_default_colors.md`
- Memory — Outfit replaces Nexa: `~/.claude/projects/.../memory/font_outfit_decision.md`
- Astro scoped styles: https://docs.astro.build/en/guides/styling/
- Cross-ref: `docs/patterns/astro.md` (`<style>` em `.astro`), `docs/patterns/seo-a11y.md` (`:focus-visible`, contraste)
- Spec inicial: §4.6.1 (preservação Webflow `w-*`) e §4.6.2 (kebab-case)
