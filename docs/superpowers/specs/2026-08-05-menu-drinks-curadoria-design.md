# Curadoria de drinks por combinação nos Pacotes de Menu — Design Spec

**Data:** 2026-08-05
**Solicitante:** Zandor/Roger (via Luis), repassado na sessão de auditoria do CMS
**Escopo:** `menuPackages` (`/menu/[package]`) — Pacotes de Serviços, Estrutura e Serviços Extras, Orçamento 1, Orçamento 2

## Contexto

Hoje, dentro de cada combinação (aba) de um pacote de menu, a lista de drinks exibida **não é editável** — é derivada automaticamente filtrando a collection global `drinks` pela `category` da combinação (`src/pages/menu/[package].astro:33`). O CMS (`public/admin/config.yml`) só expõe, por combinação, os campos `bar`, `category`, `label`, `description`, `note` e `price` — nenhum deles controla quais drinks aparecem.

O Zandor pediu liberdade para escolher manualmente quais drinks aparecem em cada combinação, nos 4 pacotes de menu.

**Nota contratual:** esta é uma funcionalidade nova, não um ajuste de texto/imagem — está fora da cláusula 1.4 (3 rodadas de ajuste grátis) e cai na 1.5 (exige aditivo). Soma-se ao achado já registrado de que o próprio sistema `/menu/[package]` nunca esteve na cláusula 1.2 do escopo original. Luis decidiu seguir com a implementação; formalização do aditivo com a CONTRATANTE fica de fora do escopo técnico desta spec.

## Fora de escopo

- A seção "Cardápio de Drinks" da home (`src/components/Menu.astro`) **não é afetada**. Ela agrupa a collection `drinks` inteira por categoria fixa, sem nenhuma dependência de `menuPackages`/`combinations` — confirmado lendo o componente.
- Nenhuma mudança visual nos 4 layouts de pacote (`SidebarMenuLayout`, `CategoryGridMenuLayout`, `CenteredPillMenuLayout`, `TextGridMenuLayout`).
- Sem migração dos 4 pacotes existentes — continuam funcionando como estão.

## Design

Comportamento de fallback: cada combinação ganha uma lista opcional de drinks curados. Vazio → mantém o filtro automático por categoria (comportamento atual). Preenchido → mostra só os escolhidos, na ordem escolhida.

### 1. Schema — `src/content.config.ts`

Em `menuPackages.combinations[]`, adicionar campo opcional:

```ts
drinks: z.array(reference('drinks')).optional()
```

`category` permanece obrigatório e sem mudança de tipo — quando `drinks` está preenchido, `category` deixa de ser usado para filtrar mas continua como metadado da combinação (evita discriminated union / schema condicional por um ganho marginal).

### 2. CMS — `public/admin/config.yml`

Novo campo dentro da lista `combinations` (collection `menuPackages`), usando `widget: list` com `field:` singular para reordenação por drag-and-drop nativa do Sveltia CMS:

```yaml
- name: drinks
  label: 'Drinks selecionados (opcional)'
  widget: list
  required: false
  hint: 'Deixe vazio para mostrar automaticamente todos os drinks da categoria acima. Preencha para escolher manualmente quais aparecem e em que ordem.'
  field:
    label: Drink
    name: drink
    widget: relation
    collection: drinks
    search_fields: [name]
    value_field: slug
    display_fields: [name]
```

### 3. Resolução — `src/pages/menu/[package].astro`

Na função que monta `combinations` (linhas 22-37), substituir a resolução incondicional por categoria por fallback:

```ts
drinks: combination.drinks?.length
  ? await Promise.all(combination.drinks.map((ref) => getEntry(ref)))
  : drinks
      .filter((drink) => drink.data.category === combination.category)
      .sort((a, b) => a.data.order - b.data.order)
```

### 4. Componentes de layout

Nenhuma mudança. Os 4 componentes (`src/components/menu-layouts/*.astro`) recebem `combo.drinks: CollectionEntry<'drinks'>[]` já resolvido — a origem do array (filtro automático ou lista curada) é opaca para eles.

## Edge cases

- **Referência quebrada:** se um drink referenciado em `combinations[].drinks` for apagado da collection `drinks`, o build do Astro falha ao resolver a `reference()`. Comportamento padrão do Astro Content Collections, já existente hoje para o campo `bar` — não é introduzido tratamento novo.
- **Lista vazia explícita (`drinks: []`):** tratada igual a `undefined` pelo optional chaining (`?.length` é falsy em array vazio) — cai no fallback automático por categoria, não resulta em aba sem drinks.

## Verificação

- `pnpm ts:check` — valida que o schema novo compila e que `[package].astro` tipa corretamente.
- `pnpm build` — build completo dos 4 pacotes existentes (sem `drinks` preenchido) deve gerar exatamente o mesmo HTML de hoje.
- Teste manual no `/admin/` local: preencher `drinks` numa combinação de teste e confirmar que a aba passa a mostrar só os itens escolhidos, na ordem escolhida; limpar o campo e confirmar que volta ao filtro automático.
- Sem suíte de teste automatizado dedicada — não há testes de content collections/páginas Astro no projeto hoje (`pnpm test` cobre só `whatsapp.test.ts`); verificação é build + checagem visual, consistente com o padrão já usado para as demais mudanças de schema deste projeto.
