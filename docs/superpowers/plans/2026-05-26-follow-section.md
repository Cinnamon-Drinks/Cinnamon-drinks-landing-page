# Follow Section + Title Standardization + Included Removal — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Padroniza tamanho dos títulos `Drinks` / `Estrutura` em mobile, remove a section `Included` (componente, yml, schema, CMS), e adiciona uma section `Follow` no lugar — réplica estrutural do template original adaptada à paleta Cinnamon.

**Architecture:** 3 mudanças sequenciais independentes, 1 commit cada. Parte 1 é só CSS. Parte 2 é remoção orquestrada (componente + yml + schema + CMS + CSS órfão). Parte 3 cria componente novo reusando classes Webflow já presentes em `global.css` (`.follow-content`, `.follow-socials-container.b-w`, etc.) — só adicionamos overrides mínimos pra adaptar à paleta Cinnamon. Conteúdo (handle Instagram) vem de `src/content/site.yml` que já existe.

**Tech Stack:** Astro 4.x · TypeScript strict · Astro Content Collections (Zod) · Biome (lint+format) · Vitest · Playwright (MCP) · Webflow IX2 runtime (`public/webflow.js`) · Sveltia CMS (`public/admin/`).

**Spec:** `docs/superpowers/specs/2026-05-26-follow-section-design.md`

---

## File Structure

**Files to create:**

- `src/components/Follow.astro` — novo componente (Parte 3). Renderiza heading + pílula social + galerias animadas. Lê handle Instagram de `site.yml`.
- `src/assets/icons/instagram.svg` — novo asset (Parte 3). Ícone Instagram branco, ~24×24px, fonte Simple Icons (CC0).

**Files to modify:**

- `src/styles/new-sections.css` — 3 edits cumulativos:
  - Parte 1: remove `font-size: 1.75rem` do `.menu-section-title` mobile.
  - Parte 2: remove CSS órfão `.incluso-section`, `.included-grid`, `.included-col h4/ul/li` e a media query mobile do `.included-grid`.
  - Parte 3: adiciona overrides do `#follow .decorative-button` pro gradient da marca.
- `src/pages/index.astro` — 2 edits:
  - Parte 2: remove `import Included` e `<Included />`.
  - Parte 3: adiciona `import Follow` e `<Follow />` na mesma posição (entre `<Bars />` e `<Testimonials />`).
- `src/content.config.ts` — Parte 2: remove `defineCollection({...}) for included` (linhas 83-95) e remove `included,` (linha 136) do export.
- `public/admin/config.yml` — Parte 2: remove a collection `included` (linhas 180-199).

**Files to delete:**

- `src/components/Included.astro` (Parte 2)
- `src/content/included.yml` (Parte 2)

---

## Task 1: Padronizar tamanho dos títulos `Drinks` e `Estrutura` em mobile

**Files:**
- Modify: `src/styles/new-sections.css` (bloco mobile do `.menu-section-title`)

- [ ] **Step 1.1: Localizar a regra atual**

Abra `src/styles/new-sections.css` e localize o bloco mobile que está aproximadamente nas linhas 490-510 (procure por `.menu-section-title` dentro de `@media (max-width: 768px)`). Confirme que o bloco atual é este:

```css
  /* Reduz padding-top do título em mobile — a section ficou centralizada
   * verticalmente, então não precisamos do respiro do desktop (5rem)
   * pra compensar navbar. */
  .menu-section-title {
    padding-top: 0;
    font-size: 1.75rem;
    margin-bottom: 1.25rem;
  }
```

- [ ] **Step 1.2: Editar — remover `font-size`**

Substitua o bloco acima por:

```css
  /* Em mobile centralizamos o container verticalmente; padding-top
   * volta a 0 (não precisa compensar navbar — o container já cuida).
   * font-size herda da regra base .heading-2 (= 65px), igual aos
   * títulos das outras sections (Sobre, Equipe, Reserva, Contato)
   * pra manter consistência visual. */
  .menu-section-title {
    padding-top: 0;
    margin-bottom: 1.25rem;
  }
```

- [ ] **Step 1.3: Rodar Biome pra confirmar CSS válido**

Run: `pnpm check`
Expected output: `Checked 26 files in <Xms>. No fixes applied.`

- [ ] **Step 1.4: Verificar visualmente em mobile com Playwright**

No Playwright MCP, abra `http://localhost:4321/#menu` em viewport 390×844 e meça o font-size do título "Drinks":

```js
() => {
  const t = document.querySelector('#menu .menu-section-title');
  const r = t.getBoundingClientRect();
  return { fontSize: getComputedStyle(t).fontSize, y: r.y, h: r.height };
}
```

Expected: `fontSize: "65.0754px"` (ou próximo de 65px). `y` deve ser ≥ 63px (abaixo da navbar). Se o título sobrepuser a navbar, ajuste o `padding-top` do `#menu .container-full-width.border` mobile pra `calc(63px + 1rem)` (passos extras abaixo).

- [ ] **Step 1.5: (Opcional, se Step 1.4 mostrou overlap) Aumentar padding-top do container**

Se a verificação acima mostrou que o título sobrepôs a navbar, edite o bloco mobile do `.container-full-width.border` (no mesmo arquivo, perto das linhas 480):

```css
  /* original */
  #menu .container-full-width.border,
  #estrutura .container-full-width.border {
    ...
    padding-top: calc(63px + 0.5rem);
    ...
  }
```

Mude pra:

```css
  #menu .container-full-width.border,
  #estrutura .container-full-width.border {
    ...
    padding-top: calc(63px + 1rem);
    ...
  }
```

Re-rode o Step 1.4 e confirme `y` ≥ 80px.

- [ ] **Step 1.6: Verificar desktop não regrediu**

Resize viewport pra 1280×800 e meça novamente:

```js
() => {
  const t = document.querySelector('#menu .menu-section-title');
  return { fontSize: getComputedStyle(t).fontSize };
}
```

Expected: `fontSize: "99.0118px"` (igual ao desktop antes — regra mobile só dispara em ≤768px).

- [ ] **Step 1.7: Commit**

```bash
git add src/styles/new-sections.css
git commit -m "fix(menu): padroniza tamanho dos títulos Drinks/Estrutura em mobile

remove o override font-size: 1.75rem que estava no .menu-section-title
mobile. agora herda .heading-2 (= 65px), igual ao padrão das outras
sections (Sobre, Equipe, Reserva, Contato). desktop inalterado."
```

---

## Task 2: Remover a section `Included` (limpeza total)

**Files:**
- Modify: `src/pages/index.astro` (linhas 6 e 22)
- Modify: `src/content.config.ts` (linhas 83-95 + 136)
- Modify: `public/admin/config.yml` (linhas 180-199)
- Modify: `src/styles/new-sections.css` (linhas 284-287 + 589-611)
- Delete: `src/components/Included.astro`
- Delete: `src/content/included.yml`

- [ ] **Step 2.1: Remover import e uso no `index.astro`**

Edite `src/pages/index.astro`:

```astro
---
import About from '../components/About.astro';
import Bars from '../components/Bars.astro';
import Footer from '../components/Footer.astro';
import Hero from '../components/Hero.astro';
import Included from '../components/Included.astro';   // ← remova esta linha
import Menu from '../components/Menu.astro';
...
---

<Base>
  <Navbar />
  <Hero />
  <About />
  <Team />
  <Menu />
  <Bars />
  <Included />        ← remova esta linha
  <Testimonials />
  ...
</Base>
```

Resultado final esperado do arquivo:

```astro
---
import About from '../components/About.astro';
import Bars from '../components/Bars.astro';
import Footer from '../components/Footer.astro';
import Hero from '../components/Hero.astro';
import Menu from '../components/Menu.astro';
import Navbar from '../components/Navbar.astro';
import ReserveForm from '../components/ReserveForm.astro';
import Team from '../components/Team.astro';
import Testimonials from '../components/Testimonials.astro';
import Base from '../layouts/Base.astro';
---

<Base>
  <Navbar />
  <Hero />
  <About />
  <Team />
  <Menu />
  <Bars />
  <Testimonials />
  <ReserveForm />
  <Footer />
</Base>
```

- [ ] **Step 2.2: Remover schema `included` do `content.config.ts`**

Edite `src/content.config.ts`. Remova as linhas 83-95 inteiras (o bloco `const included = defineCollection({...})` e a linha em branco depois):

```typescript
const included = defineCollection({
  loader: file('src/content/included.yml'),
  schema: z.object({
    columns: z
      .array(
        z.object({
          title: z.string(),
          items: z.array(z.string()).min(1)
        })
      )
      .length(3)
  })
});
```

Depois remova `  included,` do export (linha 136):

```typescript
export const collections = {
  site,
  hero,
  about,
  team,
  drinks,
  bars,
  included,         ← remova esta linha
  testimonials,
  form,
  pricing
};
```

- [ ] **Step 2.3: Remover collection `included` do Sveltia CMS**

Edite `public/admin/config.yml`. Remova o bloco completo das linhas 180-199:

```yaml
  - name: included
    label: Estrutura — Itens Inclusos
    icon: checklist
    files:
      - name: included
        label: Itens Inclusos
        file: src/content/included.yml
        fields:
          - name: included
            label: Itens Inclusos
            widget: object
            fields:
              - name: columns
                label: Colunas
                widget: list
                min: 3
                max: 3
                fields:
                  - { name: title, label: Título da coluna, widget: string }
                  - { name: items, label: Itens, widget: list }
```

A próxima collection (`- name: testimonials`) fica em sequência direta após a anterior (`- name: bars` ou similar).

- [ ] **Step 2.4: Remover CSS órfão de `new-sections.css`**

Em `src/styles/new-sections.css`, remova:

1. As linhas 284-287:

```css
/* Section "Inclusos" (Included.astro) — wrapper com respiro lateral. */
.incluso-section {
  padding: 80px 5%;
}
```

2. As linhas 589-611:

```css
/* Included grid (Bloco B) */
.included-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
@media (max-width: 768px) {
  .included-grid {
    grid-template-columns: 1fr;
  }
}
.included-col h4 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.included-col ul {
  list-style: disc;
  padding-left: 1.25rem;
}
.included-col li {
  margin-bottom: 0.4rem;
}
```

- [ ] **Step 2.5: Deletar componente e yml com `git rm`**

```bash
git rm src/components/Included.astro src/content/included.yml
```

Expected output:
```
rm 'src/components/Included.astro'
rm 'src/content/included.yml'
```

- [ ] **Step 2.6: Validar build**

```bash
pnpm build
```

Expected: build completa com sucesso, sem erros de TypeScript ou `getEntry`. Se aparecer erro tipo "Cannot find module 'included'" ou "Property 'included' does not exist", revise os steps 2.1-2.4 — alguma referência ficou.

- [ ] **Step 2.7: Validar TypeScript**

```bash
pnpm ts:check
```

Expected: `Result (... files): - 0 errors - 0 warnings - 0 hints`

- [ ] **Step 2.8: Validar Biome**

```bash
pnpm check
```

Expected: `Checked 25 files in <Xms>. No fixes applied.` (25 porque o `Included.astro` saiu).

- [ ] **Step 2.9: Verificar Sveltia CMS abre sem erro**

Abra `http://localhost:4321/admin/` no navegador (Chrome ou Edge — Sveltia usa File System Access API). Verifique que a sidebar de collections **não mostra** "Estrutura — Itens Inclusos" e que nenhuma das outras carrega com erro. Se você não conseguir abrir o CMS em dev local (precisa de OAuth Worker em produção), pule este step — o `pnpm build` no Step 2.6 já valida o YAML estaticamente.

- [ ] **Step 2.10: Verificar referências residuais**

```bash
grep -ri "included" src/ public/admin/ --include="*.astro" --include="*.ts" --include="*.yml" --include="*.css"
```

Expected: nenhuma linha retornada, ou apenas comentários históricos sem referência funcional. Se aparecer alguma linha de código, remova.

- [ ] **Step 2.11: Commit**

```bash
git add src/pages/index.astro src/content.config.ts public/admin/config.yml src/styles/new-sections.css
git commit -m "chore(content): remove section Included (componente, yml, schema, CMS, CSS)

a section Included (3 colunas com itens incluídos no pacote) não tinha
mais uso funcional na home e estava visualmente desconectada do
restante. removemos:

- src/components/Included.astro
- src/content/included.yml
- entrada \"included\" em src/content.config.ts (schema + export)
- collection \"included\" em public/admin/config.yml (Sveltia CMS)
- regras CSS órfãs (.incluso-section, .included-grid, .included-col)
  em src/styles/new-sections.css
- <Included /> de src/pages/index.astro

próximo commit: nova section <Follow /> ocupa essa posição."
```

---

## Task 3: Section Follow

**Files:**
- Create: `src/assets/icons/instagram.svg`
- Create: `src/components/Follow.astro`
- Modify: `src/styles/new-sections.css` (adiciona overrides do `.decorative-button`)
- Modify: `src/pages/index.astro` (adiciona `<Follow />`)

- [ ] **Step 3.1: Baixar o asset Instagram SVG**

Crie o arquivo `src/assets/icons/instagram.svg` com o conteúdo abaixo (ícone do Simple Icons, CC0, cor branca):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ffffff" role="img" aria-label="Instagram"><title>Instagram</title><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
```

- [ ] **Step 3.2: Validar SVG**

Confirme que o arquivo foi criado e tem ~700 bytes:

```bash
ls -la src/assets/icons/instagram.svg
```

Expected: arquivo existe, tamanho entre 600 e 1000 bytes.

- [ ] **Step 3.3: Criar `Follow.astro` — markup base**

Crie `src/components/Follow.astro` com o conteúdo completo abaixo. Reusa imports de drinks já presentes no `Hero.astro` (mesmas imagens, sem novos imports binários):

```astro
---
// src/components/Follow.astro
// Section "Follow" — réplica estrutural do template original
// (_archive/reference/index.html linhas 330-396), adaptada à paleta
// Cinnamon:
// - decorative-button usa gradient rosa→laranja (var(--btn-hero-bg))
//   em vez do branco do template
// - só Instagram (handle vem de src/content/site.yml)
// - tubes-block reusam classes existentes em global.css (animações
//   .to-left / .to-right / .to-up / .to-down já presentes no template
//   via webflow.js IX2 + CSS keyframes)
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';
import instagramIcon from '../assets/icons/instagram.svg';
import drinkAlecrim from '../assets/drinks/drink-alecrim.jpg';
import drinkAzul from '../assets/drinks/drink-azul.jpg';
import drinkCamadas from '../assets/drinks/drink-camadas.jpg';
import drinkCitrico from '../assets/drinks/drink-citrico.jpg';
import drinkCristalino from '../assets/drinks/drink-cristalino.jpg';
import drinkMaracuja from '../assets/drinks/drink-maracuja.jpg';
import drinkRosa from '../assets/drinks/drink-rosa.jpg';
import drinkWhisky from '../assets/drinks/drink-whisky.jpg';

const site = await getEntry('site', 'site');
const handle = site!.data.instagram;
const url = `https://instagram.com/${handle}`;
const tubeWidths = [400, 800];
const tubeSizes = '(max-width: 800px) 100vw, 800px';
---

<section id="follow" class="section sticky full-height">
  <div class="container-small">
    <div class="hero-background-row">
      <div class="tubes-block to-left">
        <div class="tube-row">
          <Image src={drinkRosa} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
        <div class="tube-row">
          <Image src={drinkAlecrim} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
      </div>
      <div class="tubes-block to-left">
        <div class="tube-row">
          <Image src={drinkMaracuja} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
        <div class="tube-row">
          <Image src={drinkCamadas} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
      </div>
    </div>

    <div class="follow-content">
      <h2 class="heading-2">FOLLOW</h2>
      <a href={url} target="_blank" rel="noopener noreferrer" class="follow-socials-container b-w w-inline-block">
        <div class="decorative-button white" aria-hidden="true">
          <svg class="submit-arrow sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="follow-links-contain black">
          <img src={instagramIcon.src} loading="lazy" width="20" height="20" alt={`Instagram @${handle}`} class="social-link-lg" />
        </div>
      </a>
    </div>

    <div class="hero-background-row">
      <div class="tubes-block to-right">
        <div class="tube-row">
          <Image src={drinkCitrico} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
        <div class="tube-row">
          <Image src={drinkAzul} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
      </div>
      <div class="tubes-block to-right">
        <div class="tube-row">
          <Image src={drinkCitrico} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
        <div class="tube-row">
          <Image src={drinkAzul} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
        </div>
      </div>
    </div>
  </div>

  <div class="follow-showcase">
    <div class="flex-row rotate-right">
      <div class="hero-column rotate">
        <div class="tubes-block to-up">
          <div class="tube">
            <Image src={drinkCristalino} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
          <div class="tube">
            <Image src={drinkWhisky} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
        </div>
        <div class="tubes-block to-up">
          <div class="tube">
            <Image src={drinkCristalino} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
          <div class="tube">
            <Image src={drinkWhisky} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
        </div>
      </div>
      <div class="hero-column rotate top">
        <div class="tubes-block to-down">
          <div class="tube">
            <Image src={drinkRosa} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
          <div class="tube">
            <Image src={drinkMaracuja} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
        </div>
        <div class="tubes-block to-down">
          <div class="tube">
            <Image src={drinkRosa} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
          <div class="tube">
            <Image src={drinkMaracuja} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
        </div>
      </div>
      <div class="hero-column rotate">
        <div class="tubes-block to-up">
          <div class="tube">
            <Image src={drinkAlecrim} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
          <div class="tube">
            <Image src={drinkCamadas} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
        </div>
        <div class="tubes-block to-up">
          <div class="tube">
            <Image src={drinkAlecrim} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
          <div class="tube">
            <Image src={drinkCamadas} alt="" widths={tubeWidths} sizes={tubeSizes} loading="lazy" class="cover-image" />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3.4: Adicionar overrides CSS no `new-sections.css`**

Em `src/styles/new-sections.css`, adicione um novo bloco no final do arquivo (depois das regras `.included-grid` que foram removidas no Task 2):

```css
/* ─────────────────────────────────────────────────────────────────────
 * Section #follow (Follow.astro) — réplica do template original.
 * As classes .follow-content, .follow-socials-container.b-w,
 * .follow-links-contain.black, .social-link-lg e .follow-showcase
 * já estão em global.css (cobertas pelo CSS Webflow original).
 * Aqui só sobrescrevemos o .decorative-button pra usar o gradient
 * oficial da marca em vez do branco do template (que era da paleta
 * RESTURANTO/amarela).
 * ────────────────────────────────────────────────────────────────────*/
#follow .decorative-button {
  background: var(--btn-hero-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-white);
}
#follow .decorative-button .submit-arrow.sm {
  width: 1.4em;
  height: 1.4em;
  color: inherit;
}
```

- [ ] **Step 3.5: Adicionar `<Follow />` ao `index.astro`**

Edite `src/pages/index.astro`. Adicione o import e o uso na posição onde estava o `<Included />` (entre `<Bars />` e `<Testimonials />`):

```astro
---
import About from '../components/About.astro';
import Bars from '../components/Bars.astro';
import Follow from '../components/Follow.astro';
import Footer from '../components/Footer.astro';
import Hero from '../components/Hero.astro';
import Menu from '../components/Menu.astro';
import Navbar from '../components/Navbar.astro';
import ReserveForm from '../components/ReserveForm.astro';
import Team from '../components/Team.astro';
import Testimonials from '../components/Testimonials.astro';
import Base from '../layouts/Base.astro';
---

<Base>
  <Navbar />
  <Hero />
  <About />
  <Team />
  <Menu />
  <Bars />
  <Follow />
  <Testimonials />
  <ReserveForm />
  <Footer />
</Base>
```

(Imports ordenados alfabeticamente como já estão no arquivo.)

- [ ] **Step 3.6: Validar build e TypeScript**

```bash
pnpm build
```

Expected: build sucesso, sem erros.

```bash
pnpm ts:check
```

Expected: `0 errors - 0 warnings - 0 hints`.

- [ ] **Step 3.7: Validar Biome**

```bash
pnpm check
```

Expected: `Checked 26 files in <Xms>. No fixes applied.` (26 porque o `Follow.astro` entrou).

- [ ] **Step 3.8: Verificar visualmente em mobile com Playwright**

Abra `http://localhost:4321/#follow` em viewport 390×844 e meça:

```js
() => {
  const sec = document.querySelector('#follow');
  sec?.scrollIntoView({ block: 'start' });
  const heading = sec.querySelector('h2.heading-2');
  const pill = sec.querySelector('.follow-socials-container');
  const arrow = sec.querySelector('.decorative-button');
  const icon = sec.querySelector('.social-link-lg');
  const showcase = sec.querySelector('.follow-showcase');
  return {
    sectionH: +sec.getBoundingClientRect().height.toFixed(0),
    heading: {
      text: heading.textContent.trim(),
      y: +heading.getBoundingClientRect().y.toFixed(0),
      fontSize: getComputedStyle(heading).fontSize,
    },
    pill: {
      y: +pill.getBoundingClientRect().y.toFixed(0),
      h: +pill.getBoundingClientRect().height.toFixed(0),
      w: +pill.getBoundingClientRect().width.toFixed(0),
    },
    arrowBg: getComputedStyle(arrow).background.slice(0, 80),
    iconVisible: icon.getBoundingClientRect().width > 0,
    showcaseH: +showcase.getBoundingClientRect().height.toFixed(0),
  };
}
```

Expected:
- `heading.text: "FOLLOW"`
- `heading.fontSize: "65.0754px"` (mesma de Drinks/Estrutura)
- `pill.w > 100` e `pill.h > 30` (pílula visível)
- `arrowBg` contém `linear-gradient(90deg, rgb(242, 98, 148)` (gradient rosa→laranja)
- `iconVisible: true`
- `showcaseH > 0` (galeria lateral renderizando)

- [ ] **Step 3.9: Decidir sobre `.follow-showcase` em mobile**

Olhe visualmente no Safari iOS (ou screenshot Playwright se conseguir): a galeria `.follow-showcase` em mobile está pesada/poluída?

Se SIM, adicione no `new-sections.css` dentro do `@media (max-width: 768px)`:

```css
  /* Galeria lateral .follow-showcase pesa visualmente em mobile
   * (3 colunas de drinks animadas além das 2 linhas do .container-small).
   * Esconde só em mobile — desktop mantém. */
  #follow .follow-showcase {
    display: none;
  }
```

Se NÃO (parece OK no celular real), pule este step. Se incerto, pergunte ao Luis com screenshot.

- [ ] **Step 3.10: Verificar desktop não regrediu**

Resize viewport pra 1280×800, navegue pra `#follow`:

```js
() => {
  const sec = document.querySelector('#follow');
  sec?.scrollIntoView({ block: 'start' });
  const heading = sec.querySelector('h2.heading-2');
  const showcase = sec.querySelector('.follow-showcase');
  return {
    headingFontSize: getComputedStyle(heading).fontSize,
    showcaseVisible: showcase.getBoundingClientRect().width > 0,
    sectionH: +sec.getBoundingClientRect().height.toFixed(0),
  };
}
```

Expected: heading com font 99.01px, showcase visível (width > 0), section h ≈ 800 (viewport height).

- [ ] **Step 3.11: Verificar link Instagram funcional**

No DevTools/console, confirme que o link `<a>` da pílula:

```js
() => {
  const a = document.querySelector('#follow .follow-socials-container');
  return { href: a.getAttribute('href'), target: a.getAttribute('target'), rel: a.getAttribute('rel') };
}
```

Expected: `href: "https://instagram.com/cinnamondrinks"`, `target: "_blank"`, `rel: "noopener noreferrer"`.

- [ ] **Step 3.12: Commit**

```bash
git add src/assets/icons/instagram.svg src/components/Follow.astro src/styles/new-sections.css src/pages/index.astro
git commit -m "feat(follow): adiciona section Follow com link pro Instagram

réplica estrutural do template de referência (_archive/reference/
index.html linhas 330-396) ocupando a posição da antiga section
Included (entre <Bars /> e <Testimonials />).

estrutura:
- container-small com 2 linhas .hero-background-row (to-left + to-right)
  envolvendo o .follow-content central
- follow-content tem <h2>FOLLOW</h2> + pílula com decorative-button
  (seta) + ícone Instagram
- .follow-showcase lateral com 3 colunas animadas (to-up / to-down)

adaptações à paleta Cinnamon:
- decorative-button usa gradient rosa→laranja (var(--btn-hero-bg))
  em vez do branco do template original (que era da paleta amarela
  do RESTURANTO)
- só Instagram por enquanto, handle reutilizado de
  src/content/site.yml (instagram: cinnamondrinks)
- ícone do Simple Icons (CC0) em src/assets/icons/instagram.svg

classes .follow-content / .follow-socials-container.b-w /
.follow-links-contain.black / .social-link-lg / .follow-showcase
já estavam em global.css herdadas do template — não duplicamos.

próximas iterações (fora deste commit):
- adicionar WhatsApp/Facebook/TikTok se necessário
- migrar IX2 do Webflow pra animação CSS pura
- avaliar visual da .follow-showcase em mobile real"
```

---

## Self-Review

**Spec coverage:**

| Spec section | Task que implementa |
|---|---|
| Parte 1 — Padronização títulos | Task 1 (todos os steps) |
| Parte 2 — Remover Included | Task 2 (todos os steps) |
| Parte 3 — Section Follow | Task 3 (todos os steps) |
| Asset `instagram.svg` | Task 3 Step 3.1 |
| CSS override `.decorative-button` gradient | Task 3 Step 3.4 |
| Posição entre Bars e Testimonials | Task 3 Step 3.5 |
| Animações IX2 (reusar via classes) | Task 3 Step 3.3 (mesmas classes `.tubes-block.to-*`) |
| Validação `pnpm build` / `ts:check` / Biome | Steps 2.6-2.8 e 3.6-3.7 |
| Risco mobile `.follow-showcase` pesado | Step 3.9 (decisão informada) |

Nenhuma seção da spec ficou sem task correspondente.

**Placeholder scan:** Nenhum "TBD", "TODO", "implement later". Todo step tem código concreto ou comando exato.

**Type consistency:** `Follow.astro` usa `site!.data.instagram` (consistente com `getEntry('site', 'site')` que retorna entry com `.data`). Classes CSS usadas no markup batem com seletores nos overrides (`.decorative-button`, `.social-link-lg`).

Plano OK pra execução.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-26-follow-section.md`. Two execution options:

**1. Subagent-Driven (recommended)** — Dispatch fresh subagent per task, two-stage review between tasks. Independência entre as 3 tasks favorece esse modelo (cada task vira 1 commit isolado).

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Mais rápido se você quer acompanhar tudo na mesma conversa.

Which approach?
