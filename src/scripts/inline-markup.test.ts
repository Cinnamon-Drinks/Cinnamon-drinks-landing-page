import { describe, expect, it } from 'vitest';
import { renderInlineBold } from './inline-markup';

describe('renderInlineBold', () => {
  it('wraps **text** in <strong>', () => {
    expect(renderInlineBold('normal **destaque** normal')).toBe(
      'normal <strong>destaque</strong> normal'
    );
  });

  it('wraps multiple occurrences', () => {
    expect(renderInlineBold('**um** e **dois**')).toBe(
      '<strong>um</strong> e <strong>dois</strong>'
    );
  });

  it('returns the text unchanged when there is no markup', () => {
    expect(renderInlineBold('sem destaque nenhum')).toBe('sem destaque nenhum');
  });

  it('handles an empty string', () => {
    expect(renderInlineBold('')).toBe('');
  });
});
