# Pacotes de Serviço — cardápio com drinks curados (sem bar + categoria) — Design Spec

**Data:** 2026-08-05 (criada) · **Revisão v3:** 2026-08-06
**Solicitante:** Zandor/Roger (via Luis)
**Escopo:** os 3 cardápios `type: menu` — `pacotes-de-servico`, `orcamento-1`, `orcamento-2`.

> **Histórico de versões** (o corpo abaixo descreve sempre o modelo **vigente** — v3):
> - **v1 (2026-08-05):** curadoria como campo opcional com *fallback* por categoria (mantinha `bar` + `category`).
> - **v2 (2026-08-06):** reconciliação pós-rodadas 1 e 2; limite de drinks travado (teto 20).
> - **v3 (2026-08-06):** **`bar` + `category` removidos** dos cardápios (decisão do Zandor, análoga à que virou "Estrutura e Serviços Extras" em rótulos livres). Some o fallback automático: os drinks curados passam a ser a **fonte única**. Cada aba ganha nome livre obrigatório e imagem própria. Os 3 layouts órfãos (`menu-2/3/4`) e o campo `layout` são removidos.

## Contexto

Cada cardápio (`type: menu`) renderiza abas. Até a v2, cada aba era uma **combinação `bar` + `category`**: o nome vinha do bar, a imagem lateral vinha do `tallPhoto` do bar, e a lista de drinks era derivada automaticamente filtrando a collection `drinks` por `category` (`src/pages/menu/[package].astro:37-38`).

O Zandor pediu para **remover a combinação bar + categoria** e escolher manualmente quais drinks aparecem em cada aba — o mesmo movimento de liberdade que "Estrutura e Serviços Extras" ganhou ao virar rótulos livres, mas aqui **mantendo a lista de drinks** (que o structure não tem). O filtro por categoria nunca serviu ao conceito acumulativo dos pacotes (ex.: Signature "inclui os dos pacotes anteriores") — daí a curadoria manual.

**Nota contratual:** funcionalidade nova, não ajuste de texto/imagem — fora da cláusula 1.4 (3 rodadas grátis), cai na 1.5 (aditivo). Soma-se ao achado de que o sistema `/menu/[package]` nunca esteve na cláusula 1.2 do escopo original. Luis decidiu seguir; formalização do aditivo com a CONTRATANTE fica fora do escopo técnico desta spec.

## Decisões desta rodada (todas ratificadas pelo Luis)

1. **Modelo da aba:** nome livre + drinks curados (não vira `structure` puro — mantém drinks e o clicar-no-drink).
2. **Imagem lateral:** campo `image` próprio por aba (override do admin); sem ele, o painel usa a **foto do 1º drink curado** como fallback — nunca fica vazio e garante o `<img>` de que a troca-ao-clicar depende. No lugar do `tallPhoto` do bar.
3. **Drinks atuais:** migrados — cada aba é pré-preenchida com os drinks que hoje apareceriam pela sua categoria, como ponto de partida editável.
4. **Layouts órfãos `menu-2/3/4`:** removidos (dependiam de `bar`, nenhum pacote usa). Sobra só o `menu-1` (Sidebar); o campo `layout` deixa de existir.
5. **Limite de drinks:** sem limite artificial — teto `20` (= total de drinks hoje). Guarda-corpo de layout, não regra de negócio; revisar se a collection crescer.

## Fora de escopo

- A seção "Cardápio de Drinks" da home (`src/components/Menu.astro`) — agrupa a collection `drinks` por categoria fixa, sem dependência de `menuPackages`. **Não é afetada**, e por isso o `enum` de categorias em `content.config.ts` (usado pela collection `drinks`) **permanece**.
- Os pacotes `type: structure` (Estruturas, Serviços Extras) e o `StructureLayout` — intactos.

## Design

### 1. Schema — `src/content.config.ts`

Reescrever `menuPackageMenu`: remover `layout`, `bar` e `category`; tornar `label` obrigatório; adicionar `image` e `drinks`.

```ts
const menuPackageMenu = z.object({
  type: z.literal('menu'),
  name: z.string(),
  combinations: z
    .array(
      z.object({
        label: z.string(),
        description: z.string().optional(),
        note: z.string().optional(),
        price: z.string().optional(),
        // nullish: o Sveltia grava `null` quando o object de imagem é
        // deixado desabilitado no CMS (mesmo padrão do structureLabel).
        image: z.object({ src: z.string(), alt: z.string() }).nullish(),
        // Fonte única dos drinks da aba. Vazio/omitido → aba mostra "Em breve".
        drinks: z.array(reference('drinks')).max(20).optional()
      })
    )
    .min(1),
  order: z.number().int(),
  hidden: z.boolean().default(false)
});
```

O `enum` `menuPackageStructure`, a collection `drinks` e seu `enum` de `category` não mudam. A chave `combinations` é mantida (renomear geraria churn em schema + layout + CMS + 3 `.yml` por ganho só cosmético — o rótulo no CMS é ajustado, a chave fica).

### 2. Resolução — `src/pages/menu/[package].astro`

Substituir a montagem atual (que resolve `bar` e filtra por `category`) por resolução direta dos drinks curados:

```ts
const combinations =
  pkg.data.type === 'menu'
    ? await Promise.all(
        pkg.data.combinations.map(async (c) => ({
          label: c.label,
          description: c.description,
          note: c.note,
          price: c.price,
          image: c.image,
          drinks: c.drinks?.length
            ? await Promise.all(c.drinks.map((ref) => getEntry(ref)))
            : []
        }))
      )
    : [];
```

Some o `getCollection('drinks')` global, o `getEntry(bar)` e o filtro/sort por categoria. No render, remover os imports e blocos de `menu-2/3/4`; `type: menu` passa a ter um único layout:

```astro
{pkg.data.type === 'structure' && <StructureLayout labels={pkg.data.labels} />}
{pkg.data.type === 'menu' && <SidebarMenuLayout combinations={combinations} />}
```

### 3. Layout — `src/components/menu-layouts/SidebarMenuLayout.astro`

Ajustes pontuais (a estrutura visual e o `menu-drink-image.ts` não mudam):

- `interface Combination`: remover `bar` e `category`; `label` vira `string` (obrigatório); adicionar `image?: { src: string; alt: string } | null`.
- Nome da aba: `{combo.label ?? combo.bar.data.name}` → `{combo.label}` (2 ocorrências).
- Imagem do painel: `const photo = combo.bar.data.tallPhoto` → `const photo = combo.image ?? (foto do 1º drink curado)`. O fallback garante que o `<img class="cover-image">` sempre exista quando a aba tem drinks — sem ele, `menu-drink-image.ts` não teria onde escrever e a troca-ao-clicar quebraria (bug pego no teste de browser). `image` e a foto do drink têm a mesma forma `{ src, alt }`; o resto (`{photo && <img src={photo.src} …>}`) já funciona.

### 4. CMS — `public/admin/config.yml` (collection `menuPackages`)

- Remover o campo `layout` (select).
- No widget `combinations` (rótulo → "Abas do cardápio"): remover `bar` e `category`; tornar `label` obrigatório; manter `description`, `note`, `price`; adicionar `image` (object `src`/`alt`, opcional — igual ao dos rótulos de structure) e `drinks`:

```yaml
- name: drinks
  label: 'Drinks da aba'
  widget: list
  required: false
  max: 20
  hint: 'Escolha os drinks desta aba, na ordem em que devem aparecer. Vazio mostra "Em breve".'
  field:
    label: Drink
    name: drink
    widget: relation
    collection: drinks
    search_fields: [name]
    value_field: '{{slug}}'
    display_fields: [name]
```

`value_field: '{{slug}}'` (igual ao campo `bar` que já funciona) grava o id do arquivo, que é o que `reference('drinks')` resolve — a collection `drinks` não tem campo `slug`.

### 5. Migração de conteúdo — `src/content/menu-packages/*.yml`

Nos 3 cardápios: remover `layout`, `bar`, `category` de cada aba; preencher `drinks` com os slugs da categoria atual (ordem `order`); **deixar `image` omitido**. Migrar o `tallPhoto` do bar reintroduziria o acoplamento ao bar que estamos removendo (a foto retrata o *bar*, não o *pacote*), então a imagem própria de cada aba fica a cargo do admin no CMS. Sem `image`, o painel cai no fallback da foto do 1º drink curado (ver §3) — nunca fica vazio, e a troca-ao-clicar funciona desde o deploy.

Drinks por categoria (fonte da migração):

- **Clássicos:** `moscow-mule, mojito, pina-colada, sex-on-the-beach, ipanema, daiquiri, lagoa-azul, dream-coffee`
- **Especiais:** `aperol-spritz, maracujack, saquerita, spritz-grape, bramble`
- **Gin & Whisky:** `negroni, gt-especiarias, bees-knees, pinicilin, cosmopolitan`
- **Caip's:** `caipirinha, caipvodka`

Pontos de atenção:

- **`pacotes-de-servico` / Signature (Caip's):** migra só 2 drinks, mas o `note` promete "MAIS 6, incluindo os anteriores". Fica subdimensionado de propósito — é o ponto de partida; o admin cura o cardápio real depois.
- **`orcamento-2`:** as 2 abas **não têm `label`** hoje (usavam o nome do bar). Como `label` vira obrigatório, atribuir provisoriamente o nome do bar de origem (ex.: "Rústico", "Tropical") e sinalizar ao Roger que ajuste. Cardápio é `hidden`, então baixo risco.

### 6. Remoção dos layouts órfãos

Deletar `TextGridMenuLayout.astro`, `CategoryGridMenuLayout.astro`, `CenteredPillMenuLayout.astro`; remover seus imports/blocos no `[package].astro`, o campo `layout` do schema e do CMS, e a linha `layout: menu-1` dos 3 `.yml`. Recuperável via git se um estilo alternativo for retomado.

## Edge cases

- **Aba sem drinks** (`drinks` vazio/omitido): `SidebarMenuLayout` já renderiza o placeholder "Em breve" — não quebra.
- **Referência de drink quebrada** (drink apagado da collection): build do Astro falha ao resolver a `reference()` — comportamento padrão, já existente para o antigo `bar`.
- **`image` nula e aba sem drinks:** `photo` fica null e o layout condiciona `{photo && <img>}` — painel sem foto (só o título), sem erro. Com drinks, o fallback do 1º drink preenche o painel.

## Verificação

- `pnpm ts:check` — schema novo compila; `[package].astro` e `SidebarMenuLayout` tipam sem `bar`/`category`; nenhum import solto dos layouts removidos.
- `pnpm build` — os 3 cardápios geram; as abas migradas exibem os drinks e a imagem esperados.
- `/admin/` local — editar `drinks` e `image` de uma aba e confirmar que reflete; reordenar drinks e ver a ordem mudar.
- Visual (Playwright/browser) — `pacotes-de-servico`: 4 abas com nome, preço, descrição, lista de drinks e imagem lateral; clicar na aba troca a imagem; clicar no drink troca a imagem (desktop).
- Sem suíte automatizada dedicada (o projeto não tem testes de content collections/páginas Astro; `pnpm test` cobre só `whatsapp.test.ts`) — verificação é build + checagem visual, consistente com as demais mudanças de schema.
