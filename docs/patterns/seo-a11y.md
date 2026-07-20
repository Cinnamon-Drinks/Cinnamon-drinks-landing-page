# SEO & A11y patterns para Cinnamon Drinks

> Quando trabalhar com SEO ou acessibilidade neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: schema.org · WCAG 2.1 AA · axe-core 4.x

## Princípios

- **Meta tags base** ficam em `src/layouts/Base.astro` (title, description, OG, Twitter Card, canonical). Páginas sobrescrevem via slot/prop.
- **JSON-LD `LocalBusiness` ou `BarOrPub`** com endereço, telefone, geo, openingHours, sameAs (Instagram). Dados puxam de `src/content/site.yml`.
- **OG image 1200×630px** em `public/og-image.jpg`. Gerado uma vez, não dinâmico (overhead não vale para landing single-page).
- **Alt-text obrigatório no schema Zod** (`image()` + `alt: z.string().min(3)`). Sem alt → build quebra.
- **Contraste mínimo 4.5:1** (WCAG AA texto normal). Branco em rosa `#F26294`: 3.0:1 — **não passa**, exigir maior tamanho ou outline. Branco em preto `#000000`: 21:1 — ok.
- **`:focus-visible` com outline rosa** `#F26294` (3px). Visível para teclado, invisível para mouse — `:focus-visible` faz a distinção.
- **Validar no CI**: `axe-core` via Playwright/Puppeteer rodando contra `pnpm preview`. Falha do build se `wcag2a` ou `wcag2aa` violation.

## ✅ Bom

```astro
---
// src/layouts/Base.astro — meta base + OG + Twitter + canonical
import { getEntry } from 'astro:content';
const site = await getEntry('site', 'site');
const { title = 'Cinnamon Drinks', description, path = '' } = Astro.props;
const url = new URL(path, 'https://cinnamondrinks.com.br').toString();
---
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content="/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />

  <slot name="head" />
</head>
```
**Por quê:** uma única fonte de truth (Base.astro). Páginas passam só `title` e `description` via props; OG e canonical derivam. `<slot name="head" />` permite override pontual (ex.: noindex em /admin).

```astro
---
// JSON-LD LocalBusiness/BarOrPub — em src/components/StructuredData.astro
const site = await getEntry('site', 'site');
const data = {
  '@context': 'https://schema.org',
  '@type': 'BarOrPub',
  name: 'Cinnamon Drinks',
  description: 'Coquetelaria autoral para eventos em Lavras-MG.',
  telephone: '+5535997494991',
  url: 'https://cinnamondrinks.com.br',
  image: 'https://cinnamondrinks.com.br/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Av. Dr. Silvio Menicucci, 2315 - Loja 1',
    addressLocality: 'Lavras',
    addressRegion: 'MG',
    postalCode: '37200-000',
    addressCountry: 'BR'
  },
  geo: { '@type': 'GeoCoordinates', latitude: -21.2415, longitude: -45.0006 },
  sameAs: [site.data.instagram]
};
---
<script type="application/ld+json" set:html={JSON.stringify(data)} />
```
**Por quê:** `BarOrPub` é mais específico que `LocalBusiness` (Google Rich Results suporta). `set:html={JSON.stringify(...)}` serializa sem escapar HTML (tag `<script>` aceita JSON cru). Telefone em E.164.

```ts
// src/content.config.ts — alt obrigatório no schema
const drinks = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/drinks' }),
  schema: ({ image }) => z.object({
    nome: z.string(),
    foto: image(),
    fotoAlt: z.string().min(3, 'alt-text obrigatório, descreva a foto'),
  })
});
```
**Por quê:** Zod valida no build. Editor que esquecer alt-text vê erro claro com mensagem em PT-BR. WCAG 1.1.1 (Non-text Content) garantido por construção.

```css
/* :focus-visible com outline da marca, contraste alto */
:focus-visible {
  outline: 3px solid var(--color-brand-pink); /* #F26294 */
  outline-offset: 2px;
  border-radius: 2px;
}
:focus:not(:focus-visible) { outline: none; }
```
**Por quê:** WCAG 2.4.7 (Focus Visible). Rosa contra fundo branco/preto: 3.5:1 contra branco (passa para gráficos não-textuais 3:1) e 12:1 contra preto. `:focus-visible` mostra apenas para teclado/AT.

```bash
# CI — axe-core via Playwright contra build local
pnpm build
pnpm preview --port 4321 &
PID=$!
sleep 2
npx playwright test tests/a11y.spec.ts
kill $PID
```
```ts
// tests/a11y.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home WCAG 2 AA', async ({ page }) => {
  await page.goto('http://localhost:4321/');
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(violations).toEqual([]);
});
```
**Por quê:** roda contra build real (não dev mode), pega cor de fundo, contraste, ARIA. Cobertura `wcag2a + wcag2aa + wcag21aa` é o baseline obrigatório.

## ❌ Ruim

```html
<!-- Sem alt, ou alt="" em imagem informativa -->
<img src="/drinks/caipirinha.webp" />
<img src="/logo.svg" alt="" />
```
**Problema:** WCAG 1.1.1. Screen reader anuncia "imagem" sem contexto. `alt=""` vale apenas para imagens **decorativas** (separadores, ícones puramente visuais com texto adjacente). Logo principal precisa de `alt="Cinnamon Drinks"`.

```css
/* Botão branco em fundo rosa puro */
.cta-on-pink {
  background: #F26294;
  color: #ffffff; /* contraste 3.0:1 — falha AA texto normal */
}
```
**Problema:** WCAG 1.4.3. 3.0:1 só passa para "texto grande" (≥18pt regular ou ≥14pt bold). Texto normal precisa 4.5:1. Use preto em rosa (10:1) ou aumente o tamanho/peso explicitamente.

```html
<!-- Heading hierarchy quebrada -->
<h1>Cinnamon Drinks</h1>
<h3>Drinks</h3>      <!-- ← pulou h2 -->
<h2>Eventos</h2>     <!-- ← volta atrás -->
```
**Problema:** WCAG 1.3.1 (Info and Relationships). Screen reader perde estrutura. axe-core marca como `heading-order` violation. Sempre h1 → h2 → h3 sem pular nem retroceder.

```html
<!-- title genérico repetido em todas as páginas -->
<title>Cinnamon Drinks</title>
<!-- em /sobre, /eventos, /contato — todos iguais -->
```
**Problema:** SEO ruim (Google não diferencia páginas). A11y ruim (usuário com várias tabs perde referência). Sempre `<title>{página} | Cinnamon Drinks</title>`.

```html
<!-- :focus removido sem replacement -->
<style>
  *:focus { outline: none; }
</style>
```
**Problema:** WCAG 2.4.7. Usuário de teclado fica perdido. Use `:focus-visible` com outline da marca (`#F26294`) em vez de remover.

```html
<!-- JSON-LD com campo errado -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "Cinnamon Drinks",
  "telephone": "(35) 99749-4991"
}
</script>
```
**Problema:** dois problemas. `Restaurant` é semanticamente errado (Cinnamon serve em eventos, não tem restaurante físico) — `BarOrPub` ou `EventService` é mais preciso. Telefone deve ser E.164 (`+5535997494991`) — Google Rich Results valida formato.

## Referências

- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/?levels=aa
- schema.org BarOrPub: https://schema.org/BarOrPub
- schema.org LocalBusiness: https://schema.org/LocalBusiness
- axe-core rules: https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md
- Open Graph protocol: https://ogp.me/
- Contraste — WebAIM checker: https://webaim.org/resources/contrastchecker/
- Cross-ref: `docs/patterns/css.md` (`:focus-visible`, tokens), `docs/patterns/astro.md` (`<Image alt>` obrigatório)
- Spec: §4.5 (a11y), §4.7 (SEO+JSON-LD)
