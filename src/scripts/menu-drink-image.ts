// src/scripts/menu-drink-image.ts
// No layout "menu-1" (SidebarMenuLayout), clicar num drink troca a foto do
// painel fixo pela foto daquele drink. Cada aba tem seu próprio
// .tabs-content-wrapper com painel de foto independente — closest() garante
// que o clique só afeta a foto da aba em que o drink está, nunca as outras.
//
// Restrito ao desktop (≥992px, mesmo breakpoint do resto do componente) —
// no mobile a foto não é fixa, rola junto com a lista, então a troca ainda
// não faz sentido lá. Comportamento mobile fica pra decidir depois; o
// check é feito a cada clique (não só uma vez no load) pra já respeitar
// se a janela for redimensionada através do breakpoint.
const DESKTOP_QUERY = '(min-width: 992px)';

const drinkButtons = document.querySelectorAll<HTMLButtonElement>('[data-drink-image]');

for (const button of drinkButtons) {
  button.addEventListener('click', () => {
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const imageUrl = button.dataset.drinkImage;
    if (!imageUrl) return;

    const wrapper = button.closest('.tabs-content-wrapper');
    const img = wrapper?.querySelector<HTMLImageElement>('.menu-1-img .cover-image');
    if (!img) return;

    img.src = imageUrl;
    img.alt = button.dataset.drinkName ?? '';

    for (const item of wrapper?.querySelectorAll('.collection-item-2') ?? []) {
      item.classList.remove('is-selected');
    }
    button.classList.add('is-selected');
  });
}
