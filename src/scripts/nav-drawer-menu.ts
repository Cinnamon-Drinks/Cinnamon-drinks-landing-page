// src/scripts/nav-drawer-menu.ts
const burgerTrigger = document.querySelector<HTMLElement>('.burger-menu.tablet');
const drawerLinks = document.querySelectorAll<HTMLAnchorElement>(
  '.drawer-menu .menu-links-container a'
);

if (burgerTrigger) {
  for (const link of drawerLinks) {
    link.addEventListener('click', () => burgerTrigger.click());
  }
}
