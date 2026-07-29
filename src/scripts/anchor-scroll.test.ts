import { describe, expect, it } from 'vitest';
import { resolveSameDocumentHash } from './anchor-scroll';

describe('resolveSameDocumentHash', () => {
  it('returns the hash for a same-page absolute anchor link', () => {
    expect(resolveSameDocumentHash('/', '/#sobre')).toBe('#sobre');
  });

  it('returns the hash for a same-page relative anchor link', () => {
    expect(resolveSameDocumentHash('/', '#estrutura')).toBe('#estrutura');
  });

  it('returns null when the link points to a different page', () => {
    expect(resolveSameDocumentHash('/menu/menu-1', '/#sobre')).toBeNull();
  });

  it('returns null when there is no hash in the link', () => {
    expect(resolveSameDocumentHash('/', '/menu')).toBeNull();
  });

  it('returns null for a bare "#" with no real target', () => {
    expect(resolveSameDocumentHash('/', '#')).toBeNull();
  });

  it('matches when both paths are nested and identical', () => {
    expect(resolveSameDocumentHash('/menu/menu-1', '/menu/menu-1#topo')).toBe('#topo');
  });
});
