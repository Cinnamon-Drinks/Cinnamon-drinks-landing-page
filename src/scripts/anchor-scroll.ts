// src/scripts/anchor-scroll.ts
// Lógica pura (testada via Vitest). Wiring de DOM mora em ./nav-anchor-scroll.ts.
export function resolveSameDocumentHash(currentPathname: string, href: string): string | null {
  const url = new URL(href, `https://cinnamondrinks.com.br${currentPathname}`);
  if (url.pathname !== currentPathname) return null;
  if (!url.hash || url.hash === '#') return null;
  return url.hash;
}
