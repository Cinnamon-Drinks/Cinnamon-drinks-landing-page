# Spec — Section Follow + ajustes de títulos e remoção da section Included

**Data:** 2026-05-26
**Autor:** Luis (decisões) + Claude (redação)
**Status:** aprovado, aguardando plano de implementação
**Escopo:** mobile e desktop · 3 mudanças relacionadas no fluxo da home

---

## Contexto

Após uma rodada de ajustes visuais em mobile (commits `4f268be`, `c66c969`, `9ae7885`, `6e9fb22`, `82c0c2f` e os pendentes do botão MENU sticky e títulos `Drinks/Estrutura`), três pontos ficaram em aberto:

1. Os títulos novos de `#menu` ("Drinks") e `#estrutura` ("Estrutura") foram adicionados com `font-size: 1.75rem` em mobile — bem menor que o padrão `.heading-2` (65px) usado pelas outras sections (Sobre, Equipe, Reserva, Contato).
2. A section `<Included />` (Bloco "Inclusos" com 3 colunas de texto sobre o que está incluso no pacote) ficou sem uso real e visualmente desconectada do restante da home.
3. O template de referência tem uma section **Follow** com heading + pílula de redes sociais + galerias animadas de drinks ao redor — está ausente do nosso projeto.

Decisão (este spec): padronizar os títulos, remover Included, e adicionar Follow no lugar dele.

---

## Decisões load-bearing

- **Padrão de título:** usar `.heading-2` (Outfit weight 600, uppercase, 65px em mobile) — mesma classe das outras sections. Sem override de `font-size` em mobile pros títulos de `#menu`/`#estrutura`.
- **Included será removido de vez:** componente, yml, schema e collection do Sveltia CMS. Git preserva histórico.
- **Follow contém só Instagram** (`@cinnamondrinks` já em `src/content/site.yml`). Sem WhatsApp/Facebook/TikTok.
- **Visual do Follow adaptado à Cinnamon:** estrutura idêntica ao template (heading + pílula com `decorative-button` + `social-link-lg`), mas o `decorative-button` usa o gradient oficial da marca (`var(--btn-hero-bg)` = rosa → laranja) em vez do branco do template.
- **Réplica completa do template:** 2 linhas animadas (`.hero-background-row` to-left/to-right) + galeria lateral animada (`.follow-showcase`). Risco de peso visual em mobile vai ser avaliado com Playwright na implementação — se ficar ruim, `display: none` na galeria lateral em ≤768px.
- **Heading "FOLLOW"** (inglês, igual ao template, casa com o "Drinks" que já é cognato EN/PT).
- **Posição no `index.astro`:** entre `<Bars />` e `<Testimonials />` (mesmo lugar do antigo `<Included />`).

---

## Parte 1 — Padronização dos títulos `Drinks` / `Estrutura`

### O que muda

Remover o override de `font-size: 1.75rem` que está em `src/styles/new-sections.css` dentro do bloco `@media (max-width: 768px)` para `.menu-section-title`. Sem o override, a regra base `.heading-2` herda — 65px em mobile, igual às outras sections.

### Arquivos afetados

- `src/styles/new-sections.css`

### Diff conceitual

```css
@media (max-width: 768px) {
  .menu-section-title {
    padding-top: 0;
-   font-size: 1.75rem;       /* remove */
    margin-bottom: 1.25rem;
  }
}
```

### Riscos

- Título maior (65px vs 28px) pode apertar contra a navbar de 63px ou contra o conteúdo das tabs. Vai exigir ajuste do `padding-top` do `.container-full-width.border` mobile se necessário (passar de `calc(63px + 0.5rem)` para algo como `calc(63px + 1rem)`).
- A section #menu já estava em 876px de altura (32px overflow do viewport 844). Título maior pode aumentar o overflow.

### Critério de pronto

- "Drinks" e "Estrutura" em 65px em mobile, igual a "Sobre"/"Equipe".
- Sem sobreposição visível com navbar ou tabs.
- Conteúdo das tabs continua acessível (não cortado por overflow oculto).

---

## Parte 2 — Remoção do componente `Included`

### O que muda

Limpeza completa:

1. `src/pages/index.astro` — remove `import Included from '../components/Included.astro'` e `<Included />`.
2. `src/components/Included.astro` — `git rm`.
3. `src/content/included.yml` — `git rm`.
4. `src/content.config.ts` — remove `defineCollection({...}) for included` e a entrada `included` no `export const collections`.
5. `public/admin/config.yml` — remove a collection `included` se estiver registrada (Sveltia CMS deixa de listar).
6. `src/styles/new-sections.css` — remove regras CSS órfãs: `.incluso-section`, `.included-grid`, `.included-col` e suas variantes mobile.

### Validação

- `pnpm build` precisa passar sem erros de tipo (TypeScript do `getEntry('included')` desapareceu junto com o schema).
- `pnpm ts:check` (astro check) precisa passar.
- Sveltia CMS no `/admin/` carrega sem erro (collection removida).

### Risco

- Se houver edição não-commitada do Sveltia local, perdemos os dados. Improvável (usuário avisado). Reversão: `git revert` ou `git checkout` do commit anterior.

### Critério de pronto

- Build sucesso, ts:check sucesso, `/admin/` abre sem erro, repo sem referências a "included" via `grep -ri included src/ public/`.

---

## Parte 3 — Nova section `Follow`

### Arquivo novo

`src/components/Follow.astro`

### Estrutura HTML

Réplica do template `_archive/reference/index.html` linhas 330-396:

```astro
---
import { Image } from 'astro:assets';
import { getEntry } from 'astro:content';
import instagramIcon from '../assets/icons/instagram.svg';
import drinkRosa from '../assets/drinks/drink-rosa.jpg';
import drinkAlecrim from '../assets/drinks/drink-alecrim.jpg';
import drinkMaracuja from '../assets/drinks/drink-maracuja.jpg';
import drinkCamadas from '../assets/drinks/drink-camadas.jpg';
import drinkCitrico from '../assets/drinks/drink-citrico.jpg';
import drinkAzul from '../assets/drinks/drink-azul.jpg';
import drinkCristalino from '../assets/drinks/drink-cristalino.jpg';
import drinkWhisky from '../assets/drinks/drink-whisky.jpg';

const site = await getEntry('site', 'site');
const handle = site!.data.instagram;
const url = `https://instagram.com/${handle}`;
---

<section id="follow" class="section sticky full-height">
  <div class="container-small">
    <div class="hero-background-row">
      <div class="tubes-block to-left">
        <div class="tube-row"><Image src={drinkRosa} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        <div class="tube-row"><Image src={drinkAlecrim} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
      </div>
      <div class="tubes-block to-left">
        <div class="tube-row"><Image src={drinkMaracuja} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        <div class="tube-row"><Image src={drinkCamadas} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
      </div>
    </div>

    <div class="follow-content">
      <h2 class="heading-2">FOLLOW</h2>
      <a href={url} target="_blank" rel="noopener" class="follow-socials-container b-w w-inline-block">
        <div class="decorative-button white">
          <svg class="submit-arrow sm" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="follow-links-contain black">
          <img src={instagramIcon.src} loading="lazy" width="20.5" alt={`Instagram @${handle}`} class="social-link-lg" />
        </div>
      </a>
    </div>

    <div class="hero-background-row">
      <div class="tubes-block to-right">
        <div class="tube-row"><Image src={drinkCitrico} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        <div class="tube-row"><Image src={drinkAzul} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
      </div>
      <div class="tubes-block to-right">
        <div class="tube-row"><Image src={drinkCitrico} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        <div class="tube-row"><Image src={drinkAzul} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
      </div>
    </div>
  </div>

  <div class="follow-showcase">
    <div class="flex-row rotate-right">
      <div class="hero-column rotate">
        <div class="tubes-block to-up">
          <div class="tube"><Image src={drinkCristalino} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
          <div class="tube"><Image src={drinkWhisky} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        </div>
        <div class="tubes-block to-up">
          <div class="tube"><Image src={drinkCristalino} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
          <div class="tube"><Image src={drinkWhisky} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        </div>
      </div>
      <div class="hero-column rotate top">
        <div class="tubes-block to-down">
          <div class="tube"><Image src={drinkRosa} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
          <div class="tube"><Image src={drinkMaracuja} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        </div>
        <div class="tubes-block to-down">
          <div class="tube"><Image src={drinkRosa} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
          <div class="tube"><Image src={drinkMaracuja} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        </div>
      </div>
      <div class="hero-column rotate">
        <div class="tubes-block to-up">
          <div class="tube"><Image src={drinkAlecrim} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
          <div class="tube"><Image src={drinkCamadas} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        </div>
        <div class="tubes-block to-up">
          <div class="tube"><Image src={drinkAlecrim} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
          <div class="tube"><Image src={drinkCamadas} alt="" widths={[400, 800]} sizes="100vw" loading="lazy" class="cover-image" /></div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### CSS (overrides em `new-sections.css`)

A maioria das classes (`.follow-content`, `.follow-socials-container.b-w`, `.follow-links-contain.black`, `.follow-showcase`, `.social-link-lg`) já está em `global.css` herdada do template. Precisamos só sobrescrever:

```css
/* Decorative-button do Follow ganha gradient da marca em vez do branco
 * do template original (que usava paleta amarela). */
#follow .decorative-button {
  background: var(--btn-hero-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}
#follow .decorative-button .submit-arrow.sm {
  width: 1.4em;
  height: 1.4em;
  color: var(--brand-white);
}
```

Eventuais ajustes de mobile (`@media max-width: 768px`) ficam pra fase de implementação após render visual.

### Asset novo

`src/assets/icons/instagram.svg` — ícone branco, ~20×20px. Fonte: [Simple Icons](https://simpleicons.org/?q=instagram) (CC0). Vou baixar e otimizar.

### Animações IX2 (Webflow)

O `public/webflow.js` minificado tem os triggers IX2 registrados via `data-w-id`. Estratégia:

1. **Tentativa 1:** reusar os mesmos `data-w-id` que estão no `_archive/reference/index.html` linhas 366-394 para os `.tubes-block` da galeria. Vou conferir se eles ainda estão presentes no nosso `webflow.js` (provavelmente sim — é o mesmo bundle).
2. **Fallback:** se não houver triggers IX2 pros novos elementos, replicamos a animação CSS pura (keyframes `translateY` infinitos) — já temos `.tubes-block.to-up`, `.tubes-block.to-down` que provavelmente já têm animação CSS no global.css.
3. **Validação:** Playwright em mobile 390px confirma se as imagens animam (mede transform/translate ao longo do tempo).

### Conteúdo

`src/content/site.yml.instagram` (já existe: `cinnamondrinks`).

Quando o Luis quiser trocar a rede ou o handle, edita o `site.yml`. Quando quiser adicionar WhatsApp/Facebook/TikTok, estendemos o schema do `site.yml` com array `socials: [{platform, handle}]` e adaptamos o Follow.astro.

### Posição no `index.astro`

```astro
<Base>
  <Navbar />
  <Hero />
  <About />
  <Team />
  <Menu />
  <Bars />
  <Follow />   ← onde estava <Included />
  <Testimonials />
  <ReserveForm />
  <Footer />
</Base>
```

### Critério de pronto

- Section `#follow` aparece entre Bars e Testimonials em desktop e mobile.
- Heading "FOLLOW" usa `.heading-2` (mesmo tamanho de "Sobre"/"Estrutura").
- Pílula com seta gradient + ícone Instagram, link funcional pra `instagram.com/cinnamondrinks` (target=_blank, rel=noopener).
- Imagens animadas (linhas + galeria lateral) renderizam sem layout shift.
- Em mobile, se a galeria lateral pesar visualmente, `display: none` em ≤768px.
- `pnpm build` e `pnpm ts:check` passam.
- Biome lint sem erros.

---

## Ordem de implementação (resumo)

1. **Parte 1** (1 edit CSS) → testar mobile com Playwright → commit.
2. **Parte 2** (5 deletes + 2 edits) → `pnpm build` + ts:check + lint → commit.
3. **Parte 3** (1 componente novo + asset + 1 bloco CSS + 1 edit no index) → Playwright em mobile e desktop → ajustar galeria se pesado → commit.

Cada parte vira 1 commit separado (`feat(menu): ...`, `chore(content): ...`, `feat(follow): ...`) pra facilitar revert isolado se necessário.

---

## Fora de escopo (não fazer agora)

- Adicionar mais redes sociais (WhatsApp/Facebook/TikTok) — só Instagram por enquanto.
- Newsletter/subscribe form (existe no template original mas não foi pedido).
- Replicar a galeria de vídeos do template (`<video class="background-video">`).
- Migrar IX2 do Webflow pra animação CSS puro (planejado pra refactor futuro do `webflow.js`).
- Ajustar Sveltia CMS pra editar handle Instagram via /admin/ (`site.instagram` já está editável lá; não precisa schema novo).
