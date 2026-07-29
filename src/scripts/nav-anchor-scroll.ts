// src/scripts/nav-anchor-scroll.ts
// Seções full-height usam `position: sticky` (efeito de cards empilhados,
// ver .sticky em global.css) — isso quebra o scroll nativo do browser para
// âncoras: clicar em <a href="#id"> ou carregar a página com #id na URL não
// move o scroll (só o hash muda), tanto pra frente quanto pra trás. Scroll
// manual (roda do mouse) continua funcionando normalmente porque não passa
// pelo mesmo mecanismo. scrollIntoView() calcula a posição pela geometria
// atual do elemento e funciona independente de sticky — por isso substitui
// o comportamento nativo aqui. Lógica pura de resolução de hash testada em
// ./anchor-scroll.test.ts.
import { resolveSameDocumentHash } from './anchor-scroll';

function scrollToHash(hash: string, behavior: ScrollBehavior): boolean {
  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return false;
  target.scrollIntoView({ behavior, block: 'start' });
  return true;
}

if (location.hash) scrollToHash(location.hash, 'instant');

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest('a[href*="#"]');
  if (!(link instanceof HTMLAnchorElement)) return;

  const hash = resolveSameDocumentHash(location.pathname, link.getAttribute('href') ?? '');
  if (!hash || !scrollToHash(hash, 'smooth')) return;

  event.preventDefault();
  history.pushState(null, '', hash);
});
