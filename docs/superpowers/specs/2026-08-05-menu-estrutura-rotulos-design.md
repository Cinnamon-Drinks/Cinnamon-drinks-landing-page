# Pacote de Estrutura como rótulos livres — Design Spec

**Data:** 2026-08-05
**Solicitante:** Zandor (via Luis)
**Escopo:** o pacote **"Estrutura e Serviços Extras"** (`menuPackages` → `/menu/estrutura-e-servicos-extras`). Os demais pacotes de menu não mudam.

## Contexto

Hoje todos os pacotes de menu compartilham um único schema `menuPackages` (`src/content.config.ts:95-126`): cada aba é uma `combination` = `bar` (referência à collection `bars`) + `category` (enum de drink) + `label?` + `description?` + `note?` + `price?`. A lista de drinks exibida em cada aba **não é editável** — é derivada filtrando a collection global `drinks` pela `category` (`src/pages/menu/[package].astro:32-33`). O `bar` fornece a foto do painel (`tallPhoto`/`gallery`) e o nome fallback da aba.

Esse modelo faz sentido para os **cardápios** (Pacotes de Serviços, Orçamento 1/2), onde cada aba é um pacote de drinks. Mas o pacote **"Estrutura e Serviços Extras"** usa os rótulos como **estruturas físicas** (`MADEIRA CLASSIC`, `CAPTONADO`, `VERDE`, `BIKE SPRITZ`) — a lista de drinks derivada da categoria "Clássicos" não tem relação com a estrutura. O Zandor pediu para trocar a combinação bar+categoria por **rótulos livres**: cada rótulo com nome, descrição e imagem escritos manualmente pelo admin, e o preço que já existe hoje.

## Decisão (escopo aprovado)

Das três opções avaliadas (ver Artifact de demos da sessão), Luis aprovou a **Opção A — só o pacote Estrutura muda**: introduzir um tipo de pacote novo, mantendo os cardápios intactos com o sistema de drinks atual. Motivo: menor superfície de risco, preserva "Pacotes de Serviços" (visível, em produção) e não invalida a spec de curadoria de drinks (`2026-08-05-menu-drinks-curadoria-design.md`).

### Decisões travadas

- **Campos por rótulo:** nome + descrição + imagem + **preço**. O preço é mantido (já existe no conteúdo e na aba). Removidos: `bar`, `category`, a lista de drinks derivada e o campo `note`.
- **Limite de 5 rótulos por pacote** (`labels[].min(1).max(5)`). Mantém a sidebar de abas dentro da calibração atual (~5 abas — `SidebarMenuLayout.astro:107-161`); acima disso o layout estouraria. Luis comunica o limite ao cliente.
- **Imagem opcional com fallback:** sem imagem, o painel mostra só o nome do rótulo (mesmo comportamento do `tallPhoto` ausente hoje).
- **Descrição em texto simples** (sem o realce em negrito que a `note` tinha).

## Fora de escopo

- Os 3 pacotes de cardápio (`pacotes-de-servicos`, `orcamento-1`, `orcamento-2`) continuam com `combinations`/drinks, sem mudança visual ou de schema além de ganhar o discriminador `type: menu`.
- Os 4 layouts de menu existentes (`SidebarMenuLayout`, `CategoryGridMenuLayout`, `CenteredPillMenuLayout`, `TextGridMenuLayout`) não são alterados.
- A seção "Cardápio de Drinks" da home (`src/components/Menu.astro`) não é afetada — não depende de `menuPackages`.
- A curadoria manual de drinks (spec de `2026-08-05-menu-drinks-curadoria-design.md`) continua pendente e passa a valer só para os cardápios (ver Reconciliação).

## Design

### 1. Schema — `src/content.config.ts`

`menuPackages` passa a ser uma discriminated union por um campo `type`. A variante `menu` reproduz o schema atual; a variante `structure` é nova.

```ts
const structureLabel = z.object({
  name: z.string(),
  description: z.string().optional(),
  image: z.object({ src: z.string(), alt: z.string() }).optional(),
  price: z.string().optional()
});

const menuPackageMenu = z.object({
  type: z.literal('menu'),
  name: z.string(),
  layout: z.enum(['menu-1', 'menu-2', 'menu-3', 'menu-4']),
  combinations: z
    .array(
      z.object({
        bar: reference('bars'),
        category: z.enum(["Caip's", 'Clássicos', 'Gin & Whisky', 'Especiais']),
        label: z.string().optional(),
        description: z.string().optional(),
        note: z.string().optional(),
        price: z.string().optional()
      })
    )
    .min(1),
  order: z.number().int(),
  hidden: z.boolean().default(false)
});

const menuPackageStructure = z.object({
  type: z.literal('structure'),
  name: z.string(),
  labels: z.array(structureLabel).min(1).max(5),
  order: z.number().int(),
  hidden: z.boolean().default(false)
});

const menuPackages = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/menu-packages' }),
  schema: z.discriminatedUnion('type', [menuPackageMenu, menuPackageStructure])
});
```

- `image` segue o padrão `{ src, alt }` já usado em `bars.gallery`/`bars.tallPhoto` — não o helper `image()` do `astro:assets`, que o projeto não adota (paths crus servidos de `/uploads`). O `alt` cai no nome do rótulo no componente quando vazio.
- `price` permanece `string` livre, como nos cardápios (o valor atual é cru, ex. `'350'` — o admin formata se quiser).

### 2. CMS — `public/admin/config.yml`

Duas collections apontando para a **mesma pasta** `src/content/menu-packages`, separadas por `filter` (padrão documentado do Sveltia — collections por valor de campo na mesma folder). O discriminador `type` é um `widget: hidden` com `default`, invisível ao admin.

A collection `menuPackages` atual (`config.yml:194-259`) é renomeada e ganha filtro + discriminador:

```yaml
- name: menuPackages
  label: Pacotes de Cardápio
  label_singular: Pacote de cardápio
  icon: restaurant_menu
  folder: src/content/menu-packages
  extension: yml
  format: yml
  identifier_field: name
  filter: { field: type, value: menu }
  slug: '{{slug}}'
  create: true
  fields:
    - { name: type, widget: hidden, default: menu }
    # ... (campos atuais de combinations, inalterados)
```

Nova collection para estruturas:

```yaml
- name: menuStructures
  label: Estrutura e Serviços
  label_singular: Pacote de estrutura
  icon: deck
  folder: src/content/menu-packages
  extension: yml
  format: yml
  identifier_field: name
  filter: { field: type, value: structure }
  slug: '{{slug}}'
  create: true
  fields:
    - { name: type, widget: hidden, default: structure }
    - { name: name, label: Nome do pacote, widget: string, hint: 'Ex: "Estrutura e Serviços Extras"' }
    - name: labels
      label: 'Rótulos (máx. 5)'
      widget: list
      min: 1
      max: 5
      hint: 'Cada rótulo vira uma aba na página, com nome, descrição, imagem e preço próprios.'
      fields:
        - { name: name, label: Nome do rótulo, widget: string, hint: 'Ex: "Bike Spritz"' }
        - { name: description, label: Descrição, widget: text, required: false }
        - name: image
          label: Imagem
          widget: object
          required: false
          fields:
            - { name: src, label: Foto, widget: image }
            - { name: alt, label: Texto alternativo, widget: string }
        - { name: price, label: 'Preço (opcional)', widget: string, required: false }
    - { name: order, label: Ordem, widget: number, value_type: int }
    - name: hidden
      label: 'Ocultar do menu e do dropdown (opcional)'
      widget: boolean
      required: false
      default: false
```

`min`/`max` no list widget barram o 6º rótulo no formulário; `.max(5)` no Zod é a garantia dura no build.

### 3. Resolução e roteamento — `src/pages/menu/[package].astro`

`getStaticPaths` não muda (gera todos os pacotes). A resolução de `combinations` (getEntry do bar + filtro de drinks, linhas 21-37) passa a rodar **só** para `type === 'menu'` — a discriminated union garante em tipo que `combinations` não existe no ramo `structure`. O template ramifica por `type` antes do switch de layout:

```astro
{pkg.data.type === 'structure' && (
  <StructureLayout labels={pkg.data.labels} />
)}
{pkg.data.type === 'menu' && (
  <>
    {pkg.data.layout === 'menu-1' && <SidebarMenuLayout combinations={combinations} />}
    {pkg.data.layout === 'menu-2' && <TextGridMenuLayout combinations={combinations} />}
    {pkg.data.layout === 'menu-3' && <CategoryGridMenuLayout combinations={combinations} />}
    {pkg.data.layout === 'menu-4' && <CenteredPillMenuLayout combinations={combinations} />}
  </>
)}
```

### 4. Componente novo — `src/components/menu-layouts/StructureLayout.astro`

Reaproveita a estrutura do `SidebarMenuLayout` (mesmas classes Webflow `w-tabs`/`w-tab-menu`/`w-tab-link`/`w-tab-pane` — imutáveis, IX2 depende delas) e o CSS scoped da sidebar. Diferenças:

- Cada aba usa `label.name` (nome do rótulo) e `label.price`.
- O corpo da aba mostra `label.description` (parágrafo) no lugar da lista de drinks.
- O painel usa `label.image` (`src`/`alt`, alt fallback = `label.name`) no lugar de `bar.data.tallPhoto`.
- **Não** importa `menu-drink-image.ts` (a troca de foto por drink não existe aqui) e não renderiza `<button>` de drink.

Props: `labels: { name: string; description?: string; image?: { src: string; alt: string }; price?: string }[]`.

### 5. Migração de conteúdo — `src/content/menu-packages/`

- **`estrutura-e-servicos-extras.yml`** reescrito de `combinations` para `labels`, com `type: structure`. Os 4 rótulos reais atuais viram labels: `MADEIRA CLASSIC` (price `350`), `CAPTONADO` (`1000`), `VERDE` (`450`), `BIKE SPRITZ` (`2250`). A combination sem `label` e sem `price` — a 3ª na ordem atual — é **descartada** (placeholder vazio); sobram 4 rótulos, dentro do limite de 5. `description` e `image` ficam vazios até o admin preencher.
- **`pacotes-de-servicos.yml`, `orcamento-1.yml`, `orcamento-2.yml`** ganham a linha `type: menu` (obrigatório para a discriminated union; sem ele o build falha).

### 6. Reconciliação com a spec de curadoria de drinks

`2026-08-05-menu-drinks-curadoria-design.md:5` lista "Estrutura e Serviços Extras" no escopo da curadoria manual de drinks. Como esse pacote deixa de ter drinks, aquela spec recebe uma **nota de versão** restringindo a curadoria aos 3 cardápios e apontando para esta spec. A curadoria continua não-implementada e independente desta mudança — pode ir antes ou depois.

## Edge cases

- **Arquivo sem `type`:** a discriminated union falha o build com erro de discriminador. Por isso a linha `type: menu` nos 3 cardápios é migração obrigatória e simultânea à troca de schema.
- **Rótulo sem imagem:** painel sem `<img>`, só o nome (fallback existente do `tallPhoto` ausente).
- **Rótulo sem descrição/preço:** o parágrafo/preço simplesmente não renderiza (campos opcionais, igual ao comportamento atual de `description`/`price` vazios).
- **Filtro do CMS:** um arquivo com `type` divergente aparece na collection errada — mitigado pelo `hidden`+`default`, que grava o valor certo sem intervenção do admin.
- **`reference('bars')` quebrada:** inalterado — segue valendo só para os cardápios (`type: menu`).

## Verificação

- `pnpm ts:check` (`astro check`) — valida a discriminated union e o estreitamento por `type` em `[package].astro`.
- `pnpm build` — os 3 cardápios geram o mesmo HTML de hoje; o pacote de estrutura renderiza o `StructureLayout`.
- `pnpm check` — Biome lint + format.
- QA manual no `/admin/` local (Chrome/Edge, "Work with Local Repository"): a collection "Estrutura e Serviços" mostra só os campos de rótulo; "Pacotes de Cardápio" mostra combinations; criar/editar rótulo e subir imagem reflete na página.
- QA visual no browser: `/menu/estrutura-e-servicos-extras` renderiza abas com descrição + imagem + preço, sem drinks; `/menu` (index) e o dropdown do navbar continuam listando o pacote.
- Sem suíte automatizada dedicada — consistente com o padrão do projeto para mudanças de content collection (`pnpm test` cobre só `whatsapp.test.ts`).
