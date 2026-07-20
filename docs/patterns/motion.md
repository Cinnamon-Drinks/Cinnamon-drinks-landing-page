# Motion patterns para Cinnamon Drinks

> Quando trabalhar com Motion (animações JS) neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: motion 12.x (build mini, ~2.3kb)

## Princípios

- Import **apenas** de `motion/mini`. O build completo (`motion`) traz spring physics, layout, scroll progress — nada disso é usado aqui e custa ~12kb extras.
- Toda animação **respeita `prefers-reduced-motion`**. Se o usuário pediu silêncio, o site cumpre.
- `inView` para gatilhos por scroll (revelar elementos quando entram no viewport). Anima uma vez (`once: true`) — segunda passada já tá lá.
- Animações **complementam** o IX2 do Webflow, não substituem. `webflow.js` cuida de menus, tabs, transitions de UI; Motion entra só onde IX2 não chega ou o IX2 já foi removido na migração.
- Duração curta: 200–600ms. Easings simples (`ease-out`, `[0.22, 1, 0.36, 1]`). Nada de animação de 2 segundos.
- Fica em `src/scripts/animations.ts` ou perto do componente. Nunca inline gigante em `.astro`.

## ✅ Bom

```ts
// src/scripts/animations.ts — mini build, gate em reduced-motion
import { animate, inView } from 'motion/mini';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduced) {
  inView(
    '.reveal',
    (element) => {
      animate(
        element,
        { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] },
        { duration: 0.45, easing: [0.22, 1, 0.36, 1] }
      );
    },
    { amount: 0.3 }
  );
}
```
**Por quê:** mini export é ~2.3kb. `inView` dispara o callback uma vez por elemento por default — perfeito para reveal-on-scroll. `amount: 0.3` espera 30% visível antes de animar (evita disparo prematuro em telas pequenas).

```ts
// Hover micro-interaction com fallback estático
import { animate } from 'motion/mini';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-cinnamon-cta]').forEach((el) => {
  if (reduced) return; // estado natural CSS já cobre
  el.addEventListener('mouseenter', () => {
    animate(el, { transform: 'scale(1.03)' }, { duration: 0.18 });
  });
  el.addEventListener('mouseleave', () => {
    animate(el, { transform: 'scale(1)' }, { duration: 0.18 });
  });
});
```
**Por quê:** quando `reduced` é true, retorna cedo — CSS hover state (definido em `cinnamon-drinks.webflow.css`) continua valendo. Usuário com motion-sickness vê o destaque mas sem animação.

```ts
// Listener de mudança em tempo real (usuário troca config no SO)
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
mq.addEventListener('change', (e) => {
  document.documentElement.dataset.reducedMotion = String(e.matches);
});
document.documentElement.dataset.reducedMotion = String(mq.matches);
```
**Por quê:** snapshot único no load não pega usuário que toggou no meio da sessão. CSS pode ler `[data-reduced-motion="true"]` e desligar `transition`/`animation`.

```css
/* Backup CSS — animações sem JS também respeitam */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
**Por quê:** belt-and-suspenders. Se algum CSS escapou da regra JS (incluindo IX2 do Webflow), a media query corta tudo. Sem isso, IX2 ainda anima.

## ❌ Ruim

```ts
// Build completo do motion — peso desnecessário
import { animate } from 'motion';
animate('.hero', { x: 100 });
```
**Problema:** `motion` (sem `/mini`) puxa spring physics, layout animations, scroll API — ~12kb a mais sem ganho real para reveals + hovers. Sempre `motion/mini` neste projeto.

```ts
// Anima sem checar reduced-motion
import { animate } from 'motion/mini';
animate('.hero', { opacity: [0, 1], scale: [0.8, 1] }, { duration: 1.2 });
```
**Problema:** WCAG 2.3.3 (Animation from Interactions). Usuário com vestibular disorder pode passar mal com animações longas. Sempre gate em `prefers-reduced-motion`.

```ts
// inView sem `once` em animação não-reversível
inView('.reveal', (el) => {
  animate(el, { opacity: [0, 1] }); // anima toda vez que entra/sai
});
```
**Problema:** o callback do `inView` retorna uma função de cleanup que dispara quando sai do viewport — animar opacity de novo a cada scroll é flicker garantido. Se a intenção é animar só na entrada, basta não retornar nada (já é "once" por default no mini).

```astro
---
// Lógica gigante inline em .astro
---
<script>
  import { animate, inView } from 'motion/mini';
  // 80 linhas de seletores, condicionais, easings...
</script>
```
**Problema:** sem testes Vitest, sem reuso entre páginas, dificil de auditar. Mover para `src/scripts/animations.ts` e importar.

```ts
// Animação de 3s na home
animate('.hero-title', { opacity: [0, 1] }, { duration: 3 });
```
**Problema:** primeira impressão = 3 segundos esperando. Lighthouse penaliza LCP. Animações de hero ficam em 300–600ms. Use easings para sensação de "premium", não duração longa.

## Referências

- Motion docs: https://motion.dev/docs
- Motion mini API: https://motion.dev/docs/animate#mini
- WCAG 2.3.3 Animation from Interactions: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions
- `prefers-reduced-motion` MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Cross-ref: `docs/patterns/astro.md` (`<script>` em `.astro`), `docs/patterns/seo-a11y.md` (WCAG)
- Spec: §4.6.1 (animações Motion sobre IX2 onde necessário)
