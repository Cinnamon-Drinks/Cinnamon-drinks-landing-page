# Sveltia CMS patterns para Cinnamon Drinks

> Quando trabalhar com Sveltia CMS neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: Sveltia CMS (sucessor compatível com Decap CMS)

## Princípios

- Sveltia CMS herda o formato de config do Decap CMS, mas **não é 100% compatível**: `local_backend`, `editorial_workflow` e outros recursos do Decap são ignorados (ver compatibility notes do Sveltia).
- Backend GitHub via OAuth proxy (Cloudflare Worker em `cms-oauth/`). **Nunca** commitar tokens/secrets.
- Dev local: abrir `/admin/` no Chrome/Edge e usar **"Work with Local Repository"** (File System Access API). O Sveltia **não usa proxy server** — não existe `@sveltia/cms-proxy-server`.
- Cada **widget Sveltia** mapeia 1:1 para um **type Zod** em `src/content.config.ts`. Schema CMS e schema Astro **devem casar**.
- Conteúdo editável: **só** `src/content/*.yml` ou `src/content/<col>/*.yml`. Nunca hardcoded em `.astro`.
- Collections de arquivo único cujo `.yml` tem chave-wrapper (`site:`, `hero:`...) precisam de **um widget `object`** com o nome dessa chave — senão o Sveltia grava os campos no root e quebra o loader `file()` do Astro.
- `media_folder: public/uploads` · `public_folder: /uploads` — mídia do CMS vai para `public/`, servida como path estático plano.

## ✅ Bom

```yaml
# public/admin/config.yml — backend prod com OAuth via Worker
backend:
  name: github
  repo: Cinnamon-Drinks/Cinnamon-drinks-landing-page
  branch: main
  base_url: https://cms-oauth.cinnamondrinks.workers.dev
  auth_endpoint: auth

media_folder: public/uploads
public_folder: /uploads

collections:
  - name: site
    label: Configuração do site
    files:
      - file: src/content/site.yml
        name: site
        label: Site
        fields:
          - { name: whatsappNumber, label: WhatsApp (55XX9XXXXXXXX), widget: string, pattern: ['^\d{12,13}$', 'Formato 55XX9XXXXXXXX'] }
          - { name: instagram, label: Instagram URL, widget: string }
```
**Por quê:** `pattern` no widget casa com `.regex()` no Zod — quem editar pelo CMS ou pelo arquivo cru bate na mesma validação.

```yaml
# Coleção folder de drinks — espelha glob loader do Astro
- name: drinks
  label: Drinks
  folder: src/content/drinks
  format: yml
  extension: yml
  identifier_field: nome
  create: true
  slug: '{{slug}}'
  fields:
    - { name: nome, label: Nome do drink, widget: string }
    - { name: descricao, label: Descrição, widget: text }
    - { name: destaque, label: 'Destaque na home?', widget: boolean, default: false }
    - { name: foto, label: Foto, widget: image, required: true }
```
**Por quê:** `folder + format: yml` espelha `glob({ pattern: '**/*.yml' })` no Astro. `image` widget grava path relativo a `media_folder` — `astro:assets` consome direto.

```ts
// src/content.config.ts — Zod casa com config.yml widget-a-widget
const drinks = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/drinks' }),
  schema: ({ image }) => z.object({
    nome: z.string(),
    descricao: z.string(),
    destaque: z.boolean().default(false),
    foto: image(),  // ← validado e otimizado pelo Astro
  }),
});
```
**Por quê:** `image()` helper do Astro 5 valida que o arquivo existe E gera metadata para `<Image />`. Sem isso, paths de upload do Sveltia podem entrar quebrados.

```bash
# Dev local — sem proxy, sem OAuth: o Sveltia usa a File System Access API
pnpm dev
# Acesse /admin/index.html no Chrome/Edge → "Work with Local Repository"
# → selecione a pasta raiz do repo. O Sveltia lê/escreve direto no FS.
```
**Por quê:** valida schema CMS + Zod sem precisar do OAuth Worker rodando. Bug-shielding cedo. Em dev o path é `/admin/index.html` (o dev server do Astro não resolve index de diretório em `public/`); em produção a Cloudflare Pages serve `/admin/` normalmente.

## ❌ Ruim

```yaml
# Token hardcoded no config.yml
backend:
  name: github
  repo: luiscarlos/cinnamon-drinks
  token: ghp_AbCdEf123...  # ← NUNCA
```
**Problema:** `config.yml` é público (servido em `/admin/config.yml`). Token aí = repositório comprometido em segundos. OAuth via Worker resolve: token nunca toca o cliente.

```yaml
# Widget sem validação que casa com Zod
- { name: whatsappNumber, label: WhatsApp, widget: string }
```
**Problema:** Roger digita "(35) 99999-9999" no CMS, salva. Build quebra porque Zod regex `^\d{12,13}$` rejeita. Sem `pattern` no widget, só descobre quando o site quebra.

```yaml
# Coleção sem media_folder — uploads vão pra raiz
collections:
  - name: drinks
    folder: src/content/drinks
    fields:
      - { name: foto, widget: image }
# (sem media_folder no top-level)
```
**Problema:** Sveltia salva em `/static/` ou `/public/` por default — Astro `image()` não acha. Sempre defina `media_folder: src/assets/uploads` no top-level.

```yaml
# Hardcoded em .astro em vez de yml
---
const drinks = [
  { nome: 'Caipirinha', destaque: true },
  // ...
];
---
```
**Problema:** Roger não consegue editar sem mexer em código. Quebra a premissa do projeto ("editor pós-entrega: Roger via Sveltia"). Tudo editável → `src/content/*.yml`.

## Referências

- Sveltia CMS: https://github.com/sveltia/sveltia-cms
- Decap CMS widgets (Sveltia herda): https://decapcms.org/docs/widgets/
- Cross-ref: `docs/patterns/astro.md` (Content Collections), `docs/patterns/cloudflare-workers.md` (OAuth proxy)
- Spec: §5 (estrutura `public/admin/`) e §7 (fluxo CMS)

> Context7 query "sveltia cms config" / "decap cms widgets" não consultado nesta passagem (limite por sessão); expandir manualmente em revisão trimestral.
