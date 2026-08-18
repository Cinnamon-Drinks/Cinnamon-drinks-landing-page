// src/scripts/menu-drink-image.ts
// No layout "menu-1" (SidebarMenuLayout), clicar num drink troca a foto do
// painel fixo pela foto daquele drink. Cada aba tem seu próprio
// .tabs-content-wrapper com painel de foto independente — closest() garante
// que o clique só afeta a foto da aba em que o drink está, nunca as outras.
//
const drinkButtons = document.querySelectorAll<HTMLButtonElement>('[data-drink-image]');

for (const button of drinkButtons) {
  button.addEventListener('click', () => {
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
