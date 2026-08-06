# Pacotes de Serviço — Drinks Curados (sem bar + categoria) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-08-05-menu-drinks-curadoria-design.md`](../specs/2026-08-05-menu-drinks-curadoria-design.md) (v3)

**Goal:** Remover a combinação `bar` + `category` dos 3 cardápios (`type: menu`), tornando a curadoria manual de drinks a fonte única de cada aba, com nome e imagem próprios.

**Architecture:** Astro Content Collections com schema Zod (`discriminatedUnion` por `type`). O membro `menu` perde `bar`/`category`/`layout` e ganha `image`/`drinks`. A página `/menu/[package]` resolve os drinks curados direto (sem filtro por categoria) e renderiza sempre `SidebarMenuLayout`. Os 3 layouts alternativos, que dependiam de `bar`, são removidos.

**Tech Stack:** Astro, Zod (`astro:content`), TypeScript strict, Sveltia CMS (YAML), Biome, pnpm.

## Global Constraints

- Package manager: **pnpm** (npm/yarn proibidos).
- Linter/formatter: **Biome** (sem ESLint/Prettier).
- Conteúdo editável vive em `src/content/*.yml` (via Sveltia CMS) — nunca hardcoded em componentes.
- Classes Webflow `w-*` (`w-tabs`, `w-tab-link`, `w-tab-pane`, `w-inline-block`) são **imutáveis** — `webflow.js` IX2 depende delas. Não tocar.
- Relation do CMS grava o id do arquivo: `value_field: '{{slug}}'` (a collection `drinks` não tem campo `slug`).
- O `enum` de `category` em `content.config.ts` **permanece** (a collection `drinks` e a home `Menu.astro` o usam).
- **Commits (ai-jail):** o ambiente bloqueia `git add -A` e assinatura GPG. Cada task termina com `git add <paths explícitos>` (deixa staged); **o commit em si o Luis faz fora do jail** com a mensagem sugerida. **Sem `Co-Authored-By`.**

## Estratégia de verificação

O projeto **não tem testes unitários** de content collections / páginas Astro (`pnpm test` cobre só `whatsapp.test.ts`) — criar uma suíte pra isso seria over-engineering fora do escopo. O gate de cada task é:

- `pnpm ts:check` → `astro check`, 0 erros. **Gotcha:** despeja o `public/webflow.js` minificado no output — ignore as linhas longas minificadas, procure erros reais em `src/`.
- `pnpm build` → build completo sem erro.
- Verificação visual no browser: **Task 4**.

**Gotcha:** `pnpm check` (Biome na raiz) pode falhar por um `biome.json` no worktree órfão `.claude/worktrees/menu-drinks-curadoria/` — use `pnpm build` + `pnpm ts:check` como gate principal.

---

### Task 1: Remover os 3 layouts órfãos (menu-2/3/4)

**Files:**
- Delete: `src/components/menu-layouts/TextGridMenuLayout.astro`
- Delete: `src/components/menu-layouts/CategoryGridMenuLayout.astro`
- Delete: `src/components/menu-layouts/CenteredPillMenuLayout.astro`
- Modify: `src/pages/menu/[package].astro` (imports + blocos de render)

**Interfaces:**
- Consumes: nada.
- Produces: `[package].astro` importa só `SidebarMenuLayout` e `StructureLayout`. O render de `menu` ainda condiciona por `pkg.data.layout === 'menu-1'` — o campo `layout` só sai na Task 2 (nesta task o schema e os `.yml` ficam intocados, então o build segue verde).

- [ ] **Step 1: Deletar os 3 componentes**

```bash
git rm src/components/menu-layouts/TextGridMenuLayout.astro src/components/menu-layouts/CategoryGridMenuLayout.astro src/components/menu-layouts/CenteredPillMenuLayout.astro
```

- [ ] **Step 2: Remover imports e blocos no `[package].astro`**

Remover os 3 imports (`CategoryGridMenuLayout`, `CenteredPillMenuLayout`, `TextGridMenuLayout`). O topo do frontmatter fica:

```astro
import SidebarMenuLayout from '../../components/menu-layouts/SidebarMenuLayout.astro';
import StructureLayout from '../../components/menu-layouts/StructureLayout.astro';
import Navbar from '../../components/Navbar.astro';
import Base from '../../layouts/Base.astro';
```

E remover os 3 blocos `menu-2/3/4` do render, deixando só:

```astro
  {pkg.data.type === 'structure' && <StructureLayout labels={pkg.data.labels} />}
  {pkg.data.type === 'menu' && pkg.data.layout === 'menu-1' && <SidebarMenuLayout combinations={combinations} />}
```

- [ ] **Step 3: Verificar ts:check + build**

Run: `pnpm ts:check && pnpm build`
Expected: 0 erros em `src/`; build gera as páginas `/menu/*` (os 3 cardápios ainda com bar/category, inalterados aqui).

- [ ] **Step 4: Stage**

```bash
git add "src/pages/menu/[package].astro"
```
(As deleções já foram staged pelo `git rm`.)
→ **Luis commita fora do jail.** Msg sugerida: `refactor(menu): remove layouts órfãos menu-2/3/4`

---

### Task 2: Remodelar o modelo dos cardápios (schema + resolução + layout + conteúdo)

Breaking change atômico — schema, página, layout e os 3 `.yml` mudam juntos pro build voltar a ficar verde (sem shim de retrocompatibilidade).

**Files:**
- Modify: `src/content.config.ts` (bloco `menuPackageMenu`)
- Modify: `src/pages/menu/[package].astro` (resolução de `combinations` + render)
- Modify: `src/components/menu-layouts/SidebarMenuLayout.astro` (Props + template)
- Modify: `src/content/menu-packages/pacotes-de-servico.yml`
- Modify: `src/content/menu-packages/orcamento-1.yml`
- Modify: `src/content/menu-packages/orcamento-2.yml`

**Interfaces:**
- Consumes: Task 1 (render já sem menu-2/3/4).
- Produces:
  - Schema `menuPackageMenu.combinations[]` = `{ label: string; description?: string; note?: string; price?: string; image?: {src,alt}|null; drinks?: reference('drinks')[] }` (sem `bar`/`category`/`layout`).
  - `SidebarMenuLayout` Props `Combination` = `{ label: string; description?: string; note?: string; price?: string; image?: {src:string;alt:string}|null; drinks: CollectionEntry<'drinks'>[] }`.

- [ ] **Step 1: Reescrever `menuPackageMenu` no schema**

Em `src/content.config.ts`, substituir todo o bloco `const menuPackageMenu = z.object({ … });` (o comentário acima dele inclusive) por:

```ts
// Cardápio de serviço: cada aba tem nome livre, preço, descrição e uma lista
// curada de drinks (fonte única — sem derivação por categoria). Imagem própria
// no painel lateral, editável pelo admin.
const menuPackageMenu = z.object({
  type: z.literal('menu'),
  name: z.string(),
  combinations: z
    .array(
      z.object({
        // Nome da aba (ex: "Standard"). Obrigatório — antes caía no nome do bar.
        label: z.string(),
        description: z.string().optional(),
        note: z.string().optional(),
        price: z.string().optional(),
        // Painel lateral. nullish: o Sveltia grava null quando o object de
        // imagem é deixado desabilitado no CMS (mesmo padrão do structureLabel).
        image: z.object({ src: z.string(), alt: z.string() }).nullish(),
        // Fonte única dos drinks da aba, na ordem escolhida. Vazio/omitido →
        // aba mostra "Em breve". Teto 20 (= total de drinks hoje).
        drinks: z.array(reference('drinks')).max(20).optional()
      })
    )
    .min(1),
  order: z.number().int(),
  hidden: z.boolean().default(false)
});
```

Não tocar em `structureLabel`, `menuPackageStructure`, `drinks`, `bars` nem no `enum` de `category` da collection `drinks`.

- [ ] **Step 2: Reescrever a resolução no `[package].astro`**

Substituir as linhas que hoje montam `const drinks = …` e `const combinations = …` (a montagem que resolve `bar` e filtra por `category`) por:

```ts
// A variante "menu" resolve os drinks curados de cada aba; "structure" usa
// rótulos livres (labels) e é renderizada pelo StructureLayout.
const combinations =
  pkg.data.type === 'menu'
    ? await Promise.all(
        pkg.data.combinations.map(async (combination) => ({
          label: combination.label,
          description: combination.description,
          note: combination.note,
          price: combination.price,
          image: combination.image,
          drinks: combination.drinks?.length
            ? await Promise.all(combination.drinks.map((ref) => getEntry(ref)))
            : []
        }))
      )
    : [];
```

Remover o `const drinks = … getCollection('drinks')` (não é mais usado). Manter os imports `getCollection` (usado no `getStaticPaths`) e `getEntry`.

- [ ] **Step 3: Trocar o render de `menu` no `[package].astro`**

Substituir a linha do Sidebar por uma sem o teste de `layout`:

```astro
  {pkg.data.type === 'structure' && <StructureLayout labels={pkg.data.labels} />}
  {pkg.data.type === 'menu' && <SidebarMenuLayout combinations={combinations} />}
```

- [ ] **Step 4: Ajustar Props e template do `SidebarMenuLayout`**

Em `src/components/menu-layouts/SidebarMenuLayout.astro`:

Substituir a `interface Combination` por (remove `bar`/`category`, `label` obrigatório, add `image`):

```ts
interface Combination {
  label: string;
  description?: string;
  note?: string;
  price?: string;
  image?: { src: string; alt: string } | null;
  drinks: CollectionEntry<'drinks'>[];
}
```

Trocar as 3 referências a `bar`:

- Nome na aba: `<div class="menu-text">{combo.label ?? combo.bar.data.name}</div>` → `<div class="menu-text">{combo.label}</div>`
- Foto do painel: `const photo = combo.bar.data.tallPhoto;` → `const photo = combo.image ?? (foto do 1º drink curado)`. Fallback garante o `<img>` no DOM pra troca-ao-clicar (senão quebra quando `image` é vazio):

```ts
const firstDrink = combo.drinks[0];
const photo =
  combo.image ??
  (firstDrink?.data.image
    ? { src: firstDrink.data.image, alt: firstDrink.data.name }
    : null);
```
- Título no painel: `<p class="menu-1-title heading-3">{combo.label ?? combo.bar.data.name}</p>` → `<p class="menu-1-title heading-3">{combo.label}</p>`

Manter `import type { CollectionEntry } from 'astro:content';` (ainda usado por `CollectionEntry<'drinks'>`). O `data-drink-image`/`data-drink-name` e o `menu-drink-image.ts` não mudam.

- [ ] **Step 5: Migrar `pacotes-de-servico.yml`**

Substituir todo o conteúdo por (sem `layout`/`bar`/`category`; drinks da categoria original de cada aba):

```yaml
type: menu
name: Pacotes de Serviço
combinations:
  - label: Standard
    description: Para celebrações menores e cardápios objetivos.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 2 drinks do menu abaixo**:'
    price: R$ 45 / pessoa - R$ 2.250 total
    drinks:
      - moscow-mule
      - mojito
      - pina-colada
      - sex-on-the-beach
      - ipanema
      - daiquiri
      - lagoa-azul
      - dream-coffee
  - label: Premium
    description: Maior variedade de drinks e possibilidades de personalização.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 4 drinks do menu abaixo, incluindo os do pacote anterior**:'
    price: R$ 65 / pessoa - R$ 3.250 total
    drinks:
      - moscow-mule
      - mojito
      - pina-colada
      - sex-on-the-beach
      - ipanema
      - daiquiri
      - lagoa-azul
      - dream-coffee
  - label: Cinnamon
    description: Experiência completa para eventos que buscam impacto e sofisticação.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 6 drinks do menu abaixo, incluindo os dos pacotes anteriores**:'
    price: R$ 85 / pessoa - R$ 4.250 total
    drinks:
      - aperol-spritz
      - maracujack
      - saquerita
      - spritz-grape
      - bramble
  - label: Signature
    description: Seleção ampla, destilados especiais e máxima personalização.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 6 drinks do menu abaixo, incluindo os dos pacotes anteriores**:'
    price: R$ 120 / pessoa - R$ 6.000 total
    drinks:
      - caipirinha
      - caipvodka
order: 3
```

> Nota: Signature migra só 2 drinks (categoria Caip's) — subdimensionado de propósito, é ponto de partida; o admin cura o cardápio real no `/admin/`.

- [ ] **Step 6: Migrar `orcamento-1.yml`**

Substituir todo o conteúdo por:

```yaml
type: menu
name: Orçamento 1
combinations:
  - label: Standard
    description: Para celebrações menores e cardápios objetivos.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 2 drinks do menu abaixo**:'
    price: R$ 50 / pessoa - R$ 2.500 total
    drinks:
      - caipirinha
      - caipvodka
  - label: Premium
    description: Maior variedade de drinks e possibilidades de personalização.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 4 drinks do menu abaixo, incluindo os do pacote anterior**:'
    price: R$ 70 / pessoa - R$ 3.500 total
    drinks:
      - moscow-mule
      - mojito
      - pina-colada
      - sex-on-the-beach
      - ipanema
      - daiquiri
      - lagoa-azul
      - dream-coffee
  - label: Cinnamon
    description: Experiência completa para eventos que buscam impacto e sofisticação.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 6 drinks do menu abaixo, incluindo os dos pacotes anteriores**:'
    price: R$ 85/ pessoa 3.000
    drinks:
      - moscow-mule
      - mojito
      - pina-colada
      - sex-on-the-beach
      - ipanema
      - daiquiri
      - lagoa-azul
      - dream-coffee
  - label: Signature
    description: Seleção ampla, destilados especiais e máxima personalização.
    note: 'Para além de caipirinha e caipvodka, **você poderá escolher MAIS 6 drinks do menu abaixo, incluindo os dos pacotes anteriores**:'
    price: ''
    drinks:
      - moscow-mule
      - mojito
      - pina-colada
      - sex-on-the-beach
      - ipanema
      - daiquiri
      - lagoa-azul
      - dream-coffee
order: 3
hidden: true
```

- [ ] **Step 7: Migrar `orcamento-2.yml`**

Substituir todo o conteúdo por (as 2 abas ganham `label` provisório = nome do bar antigo):

```yaml
type: menu
name: Orçamento 2
combinations:
  - label: Rústico
    description: Bar Rústico com cardápio de drinks especiais.
    price: "R$ 90 / pessoa - R$ 4.500 total"
    drinks:
      - aperol-spritz
      - maracujack
      - saquerita
      - spritz-grape
      - bramble
  - label: Tropical
    description: Bar Tropical com cardápio de Gin & Whisky.
    price: "R$ 75 / pessoa - R$ 3.750 total"
    drinks:
      - negroni
      - gt-especiarias
      - bees-knees
      - pinicilin
      - cosmopolitan
order: 4
hidden: true
```

> Nota: `label` "Rústico"/"Tropical" é provisório (essas abas não tinham nome próprio) — sinalizar ao Roger pra ajustar no `/admin/`. Cardápio é `hidden`, baixo risco.

- [ ] **Step 8: Verificar ts:check + build**

Run: `pnpm ts:check && pnpm build`
Expected: 0 erros em `src/`. Build gera os 3 cardápios; abas de `pacotes-de-servico` exibem os drinks migrados. Se `ts:check` acusar `combo.bar`/`combo.category` em algum layout, é sinal de referência esquecida — corrigir.

- [ ] **Step 9: Stage**

```bash
git add src/content.config.ts "src/pages/menu/[package].astro" src/components/menu-layouts/SidebarMenuLayout.astro src/content/menu-packages/pacotes-de-servico.yml src/content/menu-packages/orcamento-1.yml src/content/menu-packages/orcamento-2.yml
```
→ **Luis commita fora do jail.** Msg sugerida: `feat(menu): drinks curados como fonte única, remove bar+categoria dos cardápios`

---

### Task 3: Atualizar o CMS (Sveltia)

**Files:**
- Modify: `public/admin/config.yml` (collection `menuPackages`)

**Interfaces:**
- Consumes: schema da Task 2 (campos `label`, `image`, `drinks`).
- Produces: `/admin/` edita os cardápios sem `bar`/`category`/`layout`.

O CMS YAML não é validado pelo `build` (é lido em runtime pelo Sveltia) — a verificação real é visual, na Task 4.

- [ ] **Step 1: Remover o campo `layout`**

Na collection `menuPackages`, apagar o bloco do campo `layout` inteiro (`- name: layout … options: …` com as 4 opções menu-1/2/3/4).

- [ ] **Step 2: Remodelar o widget `combinations`**

Substituir o bloco `- name: combinations … fields: …` inteiro por (remove `bar`/`category`; `label` obrigatório; add `image` e `drinks`):

```yaml
      - name: combinations
        label: Abas do cardápio
        widget: list
        min: 1
        fields:
          - name: label
            label: Nome da aba
            widget: string
            hint: 'Ex: "Standard", "Premium".'
          - name: description
            label: 'Descrição breve (opcional)'
            widget: text
            required: false
            hint: 'Aparece acima da lista de drinks. Ex: "Para celebrações menores e cardápios objetivos."'
          - name: note
            label: 'Observação em texto miúdo (opcional)'
            widget: text
            required: false
            hint: 'Abaixo da descrição, em letra menor. Use **texto** para destaque colorido. Ex: regra de escolha de drinks.'
          - name: price
            label: 'Preço (opcional)'
            widget: string
            required: false
            hint: 'Ex: "R$ 45 / pessoa - R$ 2.250 total"'
          - name: image
            label: 'Imagem do painel (opcional)'
            widget: object
            required: false
            fields:
              - { name: src, label: Foto, widget: image }
              - { name: alt, label: Texto alternativo, widget: string }
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

- [ ] **Step 3: Sanity de indentação**

Revisar que o bloco está indentado com 2 espaços consistentes sob `fields:` da collection (mesmo nível dos campos `type`/`name`/`order`/`hidden` vizinhos). Não há linter de YAML no gate; a validação funcional é a Task 4.

- [ ] **Step 4: Stage**

```bash
git add public/admin/config.yml
```
→ **Luis commita fora do jail.** Msg sugerida: `feat(cms): campos de drinks e imagem por aba, remove bar/categoria/layout`

---

### Task 4: Verificação visual (browser)

**Files:** nenhum (verificação).

**Interfaces:**
- Consumes: Tasks 1-3.
- Produces: confirmação de que a página e o CMS funcionam.

- [ ] **Step 1: Subir o dev server**

Run: `pnpm dev` (Astro em `http://localhost:4321`).

- [ ] **Step 2: Conferir `/menu/pacotes-de-servico`**

Abrir `http://localhost:4321/menu/pacotes-de-servico` e confirmar:
- 4 abas na sidebar: Standard, Premium, Cinnamon, Signature — cada uma com o preço abaixo do nome.
- Aba ativa mostra descrição + note (com trecho em destaque) + lista de drinks.
- Standard/Premium: 8 drinks; Cinnamon: 5; Signature: 2.
- Clicar em outra aba troca o conteúdo; o painel direito mostra a foto do 1º drink da aba (fallback, pois `image` está vazio).
- Clicar num drink (desktop ≥992px) troca a foto do painel pela imagem do drink e marca o item.

- [ ] **Step 3: Conferir o CMS `/admin/`**

Abrir `http://localhost:4321/admin/`, entrar em **Pacotes de Cardápio → Pacotes de Serviço**, e confirmar:
- Não há mais campo "Estilo visual" (layout) nem `bar`/`categoria`.
- Cada aba tem: Nome da aba, Descrição, Observação, Preço, Imagem do painel, Drinks da aba.
- O campo "Drinks da aba" lista os drinks migrados e permite adicionar/reordenar por busca de nome.

- [ ] **Step 4: Registrar resultado**

Anotar o que passou/falhou. Se algo divergir (aba sem drink, erro de referência, campo faltando no CMS), voltar à task correspondente. Sem regressão → plano concluído.

---

## Self-review (preenchido ao escrever o plano)

- **Cobertura da spec:** schema (T2), resolução (T2), layout (T2), CMS (T3), migração de conteúdo (T2 steps 5-7), remoção de layouts órfãos (T1), verificação (T4). Todas as seções da spec têm task.
- **Sem placeholders:** todo step tem código/comando/critério concreto.
- **Consistência de tipos:** `Combination` (layout) espelha o schema `combinations[]` — `label` obrigatório, `image?: {src,alt}|null`, `drinks` resolvido para `CollectionEntry<'drinks'>[]`. `value_field: '{{slug}}'` idêntico ao campo `bar` que já funciona.
- **Ordem/atomicidade:** T1 deixa build verde mantendo `bar`; T2 é o breaking change atômico; T3 (CMS) não afeta build; T4 valida.
