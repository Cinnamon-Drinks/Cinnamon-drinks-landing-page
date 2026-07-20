# TypeScript patterns para Cinnamon Drinks

> Quando trabalhar com TypeScript neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: TypeScript 5.x (Astro tsconfig `strict`)

## Princípios

- `strict: true` é inegociável (`tsconfig.json` herda `astro/tsconfigs/strict`).
- **Sem `any`**. Biome reporta `noExplicitAny: error` no `lint`.
- **Sem `as unknown as T`** para silenciar o checker — se precisou desse cast, modele o type direito.
- Schemas Zod em `src/content.config.ts` são source of truth. Para tipos de domínio: `type X = z.infer<typeof XSchema>`.
- Types compartilhados de domínio em `src/scripts/types.ts` (centralizado, fácil de auditar).
- Discriminated unions para estados (loading/success/error), nunca booleans paralelos.

## ✅ Bom

```ts
// src/scripts/whatsapp.ts — interface explícita, sem any
export interface Lead {
  nome: string;
  telefone: string;
  email: string;
  evento: string;
  data: string;
  convidados: string;
  local: string;
  duracao: string;
  mensagem: string;
}

export function buildWhatsappUrl(args: { phone: string; lead: Lead }): string {
  const { phone, lead } = args;
  // ...
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
```
**Por quê:** input e output completamente tipados; consumer no `reserve-form.ts` recebe autocomplete e erro de compilação se faltar campo.

```ts
// Tipo derivado do schema Zod — não duplicar manualmente
import { z } from 'astro/zod';

export const SiteSchema = z.object({
  whatsappNumber: z.string().regex(/^\d{12,13}$/),
  instagram: z.string().url(),
});

export type Site = z.infer<typeof SiteSchema>;
// Site = { whatsappNumber: string; instagram: string }
```
**Por quê:** uma única fonte. Mudança no schema propaga automaticamente para o type. Sem risco de schema e type divergirem.

```ts
// Discriminated union para estado de submit do form
type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; whatsappUrl: string }
  | { status: 'error'; message: string };

function render(state: SubmitState) {
  switch (state.status) {
    case 'success': return state.whatsappUrl; // narrowed
    case 'error': return state.message;       // narrowed
    case 'submitting':
    case 'idle': return null;
  }
}
```
**Por quê:** estados impossíveis (`success && error`) viram inexpressáveis. `switch` exaustivo com `noFallthroughCasesInSwitch` pega buracos.

```ts
// safeParse + early return em vez de any
const result = SiteSchema.safeParse(data);
if (!result.success) {
  console.error(result.error.issues);
  throw new Error('site.yml inválido');
}
const site = result.data; // Site, totalmente tipado
```
**Por quê:** validação em runtime + narrowing em compile-time. Sem `as Site`. Sem `any`.

## ❌ Ruim

```ts
// any ou as unknown as — silencia o checker
function submitForm(data: any) {
  fetch('/x', { body: data as unknown as BodyInit });
}
```
**Problema:** `any` deleta toda checagem. `as unknown as T` é o caminho do "eu não sei o que isso é, vai dar certo". Biome bloqueia. Modele o type ou use `unknown` + narrowing.

```ts
// Type duplicado do schema
export const SiteSchema = z.object({ whatsappNumber: z.string() });
export type Site = { whatsappNumber: string }; // ← duplicado!
```
**Problema:** schema e type derivam da mesma intenção mas vivem separados. Em três meses, alguém adiciona `instagram` no schema e esquece do type — TypeScript não pega. Use `z.infer`.

```ts
// Booleans paralelos para estado
let isLoading = false;
let isSuccess = false;
let isError = false;
let errorMsg = '';
```
**Problema:** `isLoading && isSuccess` é alcançável. `isError` sem `errorMsg` também. Estados impossíveis criam bugs sutis. Use discriminated union.

```ts
// Function sem return type explícito em API pública
export function buildWhatsappUrl(args) {
  return `https://wa.me/${args.phone}`;
}
```
**Problema:** sem types em `args`, TS infere `any`. Sem return type explícito, refactor pode silenciosamente mudar a API. Em pública (exported), sempre tipar entradas e saída.

## Referências

- Zod docs (Context7 query: "zod schema patterns"): https://zod.dev/
- TS strict config: https://www.typescriptlang.org/tsconfig#strict
- Biome rules: https://biomejs.dev/linter/rules/no-explicit-any/
- Cross-ref: `docs/patterns/astro.md` (Content Collections), `docs/patterns/forms.md` (Lead type usage)
