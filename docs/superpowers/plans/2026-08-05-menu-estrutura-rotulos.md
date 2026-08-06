# Pacote de Estrutura como rótulos livres — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o pacote "Estrutura e Serviços Extras" usar rótulos livres (nome + descrição + imagem + preço) em vez da combinação bar+categoria que deriva drinks, sem afetar os cardápios.

**Architecture:** `menuPackages` vira uma discriminated union por `type` (`menu` | `structure`). A variante `structure` guarda `labels[]`; um componente novo `StructureLayout` renderiza os rótulos reaproveitando a sidebar/painel do `SidebarMenuLayout`. No CMS, duas collections apontam para a mesma pasta, separadas por `filter` sobre `type`.

**Tech Stack:** Astro 5 Content Collections (Zod), Sveltia CMS, componentes `.astro`, Webflow IX2 (classes `w-*`).

**Spec de referência:** `docs/superpowers/specs/2026-08-05-menu-estrutura-rotulos-design.md` — contém os literais de schema, config CMS e branch de rota. Este plano define **ordem, gates e o código novo** (o componente); onde a spec já traz o literal, o plano aponta para ela em vez de duplicar.

## Global Constraints

- **Package manager:** pnpm. `npm`/`yarn` proibidos.
- **Linter/formatter:** Biome (`pnpm check`). Sem ESLint/Prettier.
- **Classes Webflow `w-*` são imutáveis** — `webflow.js` IX2 depende delas. Adicionar classes ao lado, nunca substituir.
- **Conteúdo editável** vive em `src/content/*.yml`, nunca hardcoded em `.astro`.
- **Sem test runner para schema/componentes Astro** — o projeto só tem `whatsapp.test.ts` (Vitest). Gate de verificação de cada tarefa = `pnpm ts:check` + `pnpm build` + QA manual, conforme a spec.
- **Commits são do Luis, fora do jail** — cada tarefa lista a mensagem sugerida (Conventional Commits, PT-BR, imperativo, sem `Co-Authored-By`); a execução do commit não faz parte da tarefa.
- **Limite de 5 rótulos** por pacote de estrutura (`labels[].min(1).max(5)`).
- **Cor escura:** `#000000` puro. Paleta/tipografia travadas (não introduzir cor nova neste trabalho).

---

## File Structure

- **Create** `src/components/menu-layouts/StructureLayout.astro` — renderiza os rótulos de um pacote de estrutura (sidebar de abas + painel descrição/imagem). Responsabilidade única: apresentação da variante `structure`.
- **Modify** `src/content.config.ts` — `menuPackages` vira discriminated union por `type`.
- **Modify** `src/pages/menu/[package].astro` — ramifica render por `pkg.data.type`; resolução de drinks só no ramo `menu`.
- **Modify** `src/content/menu-packages/estrutura-e-servicos-extras.yml` — migra de `combinations` para `labels` (`type: structure`).
- **Modify** `src/content/menu-packages/pacotes-de-servicos.yml`, `orcamento-1.yml`, `orcamento-2.yml` — adiciona `type: menu`.
- **Modify** `public/admin/config.yml` — renomeia a collection atual (filtro `type: menu` + `type` hidden) e adiciona a collection `menuStructures`.
- **Modify** `docs/superpowers/specs/2026-08-05-menu-drinks-curadoria-design.md` — nota de versão restringindo a curadoria aos cardápios.

---

## Task 1: Componente `StructureLayout.astro`

Componente isolado, ainda não referenciado — o build permanece verde. Define sua própria interface `Props` (como os demais layouts), sem depender do schema.

**Files:**
- Create: `src/components/menu-layouts/StructureLayout.astro`

**Interfaces:**
- Produces: componente `StructureLayout` com prop `labels: { name: string; description?: string; image?: { src: string; alt: string }; price?: string }[]`.

- [ ] **Step 1: Criar o componente**

Base estrutural e CSS reaproveitados do `SidebarMenuLayout.astro` (mesmas classes Webflow `w-tabs`). Diferenças: itera `labels` em vez de `combinations`; corpo da aba é `description` (texto simples), não lista de drinks; painel usa `label.image` com fallback de `alt` para `label.name`; sem `menu-drink-image.ts`, sem `renderInlineBold`, sem `.collection-item-2`.

```astro
---
// src/components/menu-layouts/StructureLayout.astro
// Variante "structure" do pacote de menu: sidebar de abas (uma por rótulo)
// com preenchimento em gradiente ao ativar/hover, descrição em texto e
// imagem própria do rótulo no painel fixo à direita. Reaproveita o widget
// nativo de Tabs do Webflow (w-tabs/w-tab-link/w-tab-pane) — sem JS próprio.
interface Label {
  name: string;
  description?: string;
  image?: { src: string; alt: string };
  price?: string;
}

interface Props {
  labels: Label[];
}

const { labels } = Astro.props;
---

<div
  data-current="Tab 1"
  data-easing="ease"
  data-duration-in="300"
  data-duration-out="100"
  class="flex-container w-tabs"
>
  <div class="sidebar-menu-tabs w-tab-menu">
    {
      labels.map((label, i) => (
        <a
          data-w-tab={`Tab ${i + 1}`}
          class={`menu-tab w-inline-block w-tab-link${i === 0 ? ' w--current' : ''}`}
        >
          <div class="menu-text">{label.name}</div>
          {label.price && <div class="menu-tab-price">{label.price}</div>}
          <div class="tab-bg menu-1" />
        </a>
      ))
    }
  </div>
  <div class="tabs-content w-tab-content">
    {
      labels.map((label, i) => (
        <div data-w-tab={`Tab ${i + 1}`} class={`w-tab-pane${i === 0 ? ' w--tab-active' : ''}`}>
          <div class="tabs-content-wrapper">
            <div class="menu-items-list">
              {label.description && <p class="menu-tab-description">{label.description}</p>}
            </div>
            <div class="menu-1-img border">
              {label.image && (
                <img
                  src={label.image.src}
                  alt={label.image.alt || label.name}
                  loading="lazy"
                  class="cover-image"
                />
              )}
              <div class="text-holder tablet-gradient">
                <p class="menu-1-title heading-3">{label.name}</p>
              </div>
            </div>
          </div>
        </div>
      ))
    }
  </div>
  <div class="menu-border border" />
</div>

<style>
  /* Sidebar de abas fixa — replica os valores do template original com "top"
   * ajustado pra não ficar sob a navbar sticky. Idêntico ao SidebarMenuLayout. */
  .sidebar-menu-tabs {
    z-index: 5;
    grid-row-gap: 0.2em;
    flex-direction: column;
    justify-content: flex-start;
    width: 25vw;
    padding-top: 2rem;
    display: flex;
    position: fixed;
    top: 10rem;
  }
  @media screen and (max-width: 991px) {
    .sidebar-menu-tabs {
      background-color: var(--brand-white);
      border-radius: 2.5em;
      flex-direction: row;
      justify-content: space-between;
      width: 95vw;
      height: auto;
      margin-bottom: 1em;
      margin-left: auto;
      margin-right: auto;
      padding: 0.3em;
      position: fixed;
      top: auto;
      inset: auto 0% 0%;
    }
  }

  @media screen and (min-width: 992px) {
    .menu-tab {
      font-size: 1.3em;
      padding-left: 6.5vw;
    }
  }
  @media screen and (max-width: 991px) {
    .menu-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 0.55em 0.4em;
      font-size: 0.92em;
    }
  }

  @media screen and (max-width: 991px) {
    .text-holder .menu-1-title {
      font-size: 2.6rem;
    }
  }

  /* Preço abaixo do nome de cada aba (todas mostram preço ao mesmo tempo,
   * editável via CMS em labels[].price). :has força column só quando há
   * preço, pra no mobile (abas lado a lado) o preço não colar no nome. */
  .menu-tab-price {
    display: block;
    width: 100%;
    font-size: 0.42em;
    font-weight: 400;
    opacity: 0.85;
    margin-top: 0.2em;
  }
  @media screen and (max-width: 991px) {
    .menu-tab:has(.menu-tab-price) {
      flex-direction: column;
    }
    .menu-tab-price {
      font-size: 0.8em;
      margin-top: 0.2em;
    }
  }
</style>
```

- [ ] **Step 2: Verificar tipos e build**

Run: `pnpm ts:check`
Expected: 0 errors.

Run: `pnpm build`
Expected: build success; o componente novo compila mesmo sem ser referenciado.

- [ ] **Step 3: Commit sugerido (Luis, fora do jail)**

```
feat(menu): adiciona StructureLayout para pacotes de estrutura
```

---

## Task 2: Schema + migração de conteúdo + roteamento (atômica)

**Janela de build vermelho:** a discriminated union exige `type` em todos os 4 arquivos e o branch na rota. Faça os steps 1-5 juntos; só verifique no step 6. Um sem o outro quebra `pnpm build`.

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/content/menu-packages/estrutura-e-servicos-extras.yml`
- Modify: `src/content/menu-packages/pacotes-de-servicos.yml`
- Modify: `src/content/menu-packages/orcamento-1.yml`
- Modify: `src/content/menu-packages/orcamento-2.yml`
- Modify: `src/pages/menu/[package].astro`

**Interfaces:**
- Consumes: `StructureLayout` (Task 1).
- Produces: `menuPackages` como `z.discriminatedUnion('type', [menu, structure])`; `pkg.data.type` estreita para `combinations` (menu) ou `labels` (structure).

- [ ] **Step 1: Schema — discriminated union**

Em `src/content.config.ts`, substituir a definição de `menuPackages` (linhas 95-126) pelos literais da spec §1 (`structureLabel`, `menuPackageMenu`, `menuPackageStructure`, `z.discriminatedUnion('type', [...])`). Manter `reference`/`glob` já importados.

- [ ] **Step 2: Migrar o pacote de estrutura**

Reescrever `src/content/menu-packages/estrutura-e-servicos-extras.yml`:

```yaml
type: structure
name: Estrutura e Serviços Extras
labels:
  - name: MADEIRA CLASSIC
    description: ''
    price: '350'
  - name: CAPTONADO
    description: ''
    price: '1000'
  - name: VERDE
    description: ''
    price: '450'
  - name: BIKE SPRITZ
    description: ''
    price: '2250'
order: 1
```

- [ ] **Step 3: Marcar os 3 cardápios como `type: menu`**

Adicionar `type: menu` como primeira linha de cada um: `pacotes-de-servicos.yml`, `orcamento-1.yml`, `orcamento-2.yml`. Nenhum outro campo muda.

- [ ] **Step 4: Ramificar a rota por `type`**

Em `src/pages/menu/[package].astro`: importar `StructureLayout`; condicionar a resolução de `combinations` (linhas 21-37) a `pkg.data.type === 'menu'` (a union impede acessar `combinations` no ramo structure); e no template, seguir a spec §3 (branch `type === 'structure'` → `<StructureLayout labels={pkg.data.labels} />`; `type === 'menu'` → switch de layout atual).

- [ ] **Step 5: Formatar**

Run: `pnpm format`
Expected: arquivos formatados sem erro.

- [ ] **Step 6: Verificar tipos e build**

Run: `pnpm ts:check`
Expected: 0 errors (union estreita corretamente; nenhum acesso a `combinations` no ramo structure).

Run: `pnpm build`
Expected: build success. Os 3 cardápios geram o mesmo HTML de antes; `/menu/estrutura-e-servicos-extras` renderiza o `StructureLayout`.

- [ ] **Step 7: QA visual**

Run: `pnpm preview` e abrir `/menu/estrutura-e-servicos-extras`.
Expected: 4 abas (Madeira Classic, Captonado, Verde, Bike Spritz) com preço; painel sem drinks; sem imagem ainda (fallback só com o nome). Abrir `/menu/pacotes-de-servicos`: inalterado, com drinks. `/menu` (index) e dropdown do navbar listam ambos.

- [ ] **Step 8: Commit sugerido (Luis, fora do jail)**

```
feat(menu): pacote de estrutura usa rotulos livres em vez de bar+categoria
```

---

## Task 3: CMS — duas collections no Sveltia

Não afeta o build do Astro (`config.yml` é servido estático). Gate = QA no `/admin/` local.

**Files:**
- Modify: `public/admin/config.yml`

- [ ] **Step 1: Ajustar a collection de cardápio e adicionar a de estrutura**

Aplicar a spec §2 em `public/admin/config.yml`: na collection `menuPackages` atual (linhas 194-259), trocar `label` para "Pacotes de Cardápio", adicionar `filter: { field: type, value: menu }` e `- { name: type, widget: hidden, default: menu }` como primeiro campo. Adicionar a collection `menuStructures` (folder igual, `filter: { field: type, value: structure }`, campos `labels` com `min: 1`/`max: 5`, `type` hidden default `structure`).

- [ ] **Step 2: QA no /admin/ local**

Abrir `/admin/index.html` no Chrome/Edge → "Work with Local Repository".
Expected: a collection "Estrutura e Serviços" mostra só os campos de rótulo e lista o pacote existente; "Pacotes de Cardápio" mostra combinations e lista os 3 cardápios; o campo `type` não aparece em nenhuma. Editar um rótulo e subir imagem grava em `labels[].image` e reflete na página.

- [ ] **Step 3: Commit sugerido (Luis, fora do jail)**

```
feat(cms): separa colecoes de cardapio e estrutura por tipo
```

---

## Task 4: Reconciliar a spec de curadoria de drinks

**Files:**
- Modify: `docs/superpowers/specs/2026-08-05-menu-drinks-curadoria-design.md`

- [ ] **Step 1: Nota de versão**

No topo (após o cabeçalho de escopo, linha ~5), adicionar nota: a curadoria manual de drinks passa a valer só para os cardápios (`pacotes-de-servicos`, `orcamento-1`, `orcamento-2`); "Estrutura e Serviços Extras" saiu do modelo de drinks — ver `2026-08-05-menu-estrutura-rotulos-design.md`.

- [ ] **Step 2: Commit sugerido (Luis, fora do jail)**

```
docs(menu): restringe spec de curadoria de drinks aos cardapios
```

---

## Self-Review

**Spec coverage:**
- Schema (spec §1) → Task 2 Step 1. ✓
- CMS (spec §2) → Task 3. ✓
- Rota (spec §3) → Task 2 Step 4. ✓
- Componente (spec §4) → Task 1. ✓
- Migração de conteúdo (spec §5) → Task 2 Steps 2-3. ✓
- Reconciliação (spec §6) → Task 4. ✓
- Edge cases (imagem/descrição/preço ausentes) → cobertos pelo render condicional em Task 1 (`&&`) e QA em Task 2 Step 7. ✓

**Placeholder scan:** `description: ''` nos YAML é dado real (campo vazio até o admin preencher), não placeholder de plano. Sem TBD/TODO. ✓

**Type consistency:** `labels` e a interface `Label` (`name`/`description?`/`image?{src,alt}`/`price?`) são idênticos no componente (Task 1), no schema (Task 2 via spec §1) e na prop passada na rota (Task 2 Step 4). ✓
