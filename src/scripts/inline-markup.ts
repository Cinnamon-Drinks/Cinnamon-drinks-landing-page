// src/scripts/inline-markup.ts
// Transforma **texto** em <strong>texto</strong> pra dar destaque pontual
// dentro de campos de texto simples do CMS (ex: menuPackages.combinations.note).
export function renderInlineBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
