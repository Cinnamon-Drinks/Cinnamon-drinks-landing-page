# Astro patterns para Cinnamon Drinks

> Quando trabalhar com Astro neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: Astro 5.x

## Princípios

- Content Collections **v5**: sempre com `loader` explícito (`glob` ou `file`) — formato v3/v4 (pasta mágica `src/content/<col>/`) não funciona em v5.
- Schemas Zod em `src/content.config.ts` são **source of truth** do conteúdo. Tipos derivam via `z.infer`, nunca duplicados manualmente.
- `getEntry` para singletons (config global, site, contato), `getCollection` para múltiplos itens.
- Image API: `<Image />` exige `import` do asset; nunca strings cruas para `/src/...`.
- `<script>` em `.astro` deve ser curto. Lógica vai para `src/scripts/*.ts` e é importada (`import '../scripts/x.ts';`).
- `is:inline` para scripts que precisam executar antes da hidratação Astro (jQuery, `webflow.js` IX2). `client:load` para componentes interativos.

## ✅ Bom

```ts
// src/content.config.ts — Content Collections v5 com loaders explícitos
import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

const drinks = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/drinks' }),
  schema: z.object({
    nome: z.string(),
    descricao: z.string(),
    destaque: z.boolean().default(false),
  }),
});

const site = defineCollection({
  loader: file('./src/content/site.yml'),
  schema: z.object({
    whatsappNumber: z.string().regex(/^\d{12,13}$/),
    instagram: z.string().url(),
  }),
});

export const collections = { drinks, site };
```
**Por quê:** `glob`/`file` loaders são obrigatórios em Astro 5. Sem eles, `getEntry`/`getCollection` retorna `undefined`. Schemas Zod validam o YAML em build — quebra cedo, não em produção.

```astro
---
// src/pages/index.astro — singleton com getEntry, lista com getCollection
import { getEntry, getCollection } from 'astro:content';
import { Image } from 'astro:assets';
import heroImg from '../assets/hero.webp';

const site = await getEntry('site', 'site');     // singleton via file loader
const drinks = await getCollection('drinks',     // só destaques
  ({ data }) => data.destaque
);
---

<Image src={heroImg} alt="Bartender preparando drink" widths={[480, 960, 1920]} />
{drinks.map(d => <article>{d.data.nome}</article>)}
```
**Por quê:** `getEntry` retorna `undefined` se faltar — destrutive bem cedo. `Image` com `widths` gera srcset responsivo. `alt` obrigatório no schema (não no template) garante a11y.

```astro
---
// src/layouts/Base.astro — slots nomeados + default
---
<html lang="pt-BR">
  <head>
    <slot name="head" />
    <title><slot name="title">Cinnamon Drinks</slot></title>
  </head>
  <body>
    <slot />
    <script is:inline src="/js/jquery-3.5.1.min.dc5e7f18c8.js"></script>
    <script is:inline src="/js/webflow.js"></script>
  </body>
</html>
```
**Por quê:** `is:inline` preserva ordem e evita bundling Astro — `webflow.js` IX2 depende de jQuery global no `window`, qualquer reordenação quebra animações.

```astro
---
// Form interativo — script externo via import
---
<form class="reserve-form" data-cinnamon-form>...</form>

<script>
  import '../scripts/reserve-form.ts';
</script>
```
**Por quê:** lógica em `.ts` testável (Vitest) e tipada. `<script>` sem diretivas é processado pelo Astro (bundle, tree-shake, minify). `is:inline` só quando precisar.

## ❌ Ruim

```ts
// src/content/config.ts — formato Astro v3/v4 (não funciona em v5)
import { defineCollection, z } from 'astro:content';

export const collections = {
  drinks: defineCollection({
    type: 'data',
    schema: z.object({ nome: z.string() }),
  }),
};
```
**Problema:** `type: 'data'`/`type: 'content'` foi removido em v5. Sem `loader`, a coleção retorna vazia silenciosamente. Resultado: build passa, página renderiza sem conteúdo.

```astro
---
// Uso direto de path string para imagem
---
<img src="/src/assets/hero.webp" alt="" />
```
**Problema:** path `/src/...` não existe em produção (Astro reescreve durante build). `alt=""` em imagem informativa quebra WCAG 1.1.1. Nunca string crua: importa o asset e passa para `<Image />`.

```astro
---
// Lógica grande dentro do .astro
---
<script is:inline>
  // 200 linhas de validação de form, máscara, redirect WhatsApp...
  document.querySelector('form').addEventListener('submit', ...);
</script>
```
**Problema:** sem TypeScript, sem testes, sem tree-shake. `is:inline` desnecessário (não precisa rodar antes da hidratação). Mover para `src/scripts/reserve-form.ts` e importar.

```astro
---
// getEntry sem checagem
const site = await getEntry('site', 'site');
---
<a href={`https://wa.me/${site.data.whatsappNumber}`}>WhatsApp</a>
```
**Problema:** se `site.yml` faltar, `site` é `undefined` e `site.data` explode em runtime. Verificar (`if (!site) throw new Error(...)`) ou usar `!` apenas após validação consciente.

## Referências

- Astro Content Collections v5: https://docs.astro.build/en/guides/content-collections/
- Astro Image: https://docs.astro.build/en/guides/images/
- Hydration directives: https://docs.astro.build/en/reference/directives-reference/
- Cross-ref: `docs/patterns/typescript.md` (Zod schemas), `docs/patterns/css.md` (Webflow `w-*`)
- Spec: §4.6 (convenções) e §5 (estrutura de arquivos)
