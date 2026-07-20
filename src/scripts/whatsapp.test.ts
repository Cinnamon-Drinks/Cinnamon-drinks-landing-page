import { describe, expect, it } from 'vitest';
import { buildWhatsappUrl, getLeadFromFormData, type Lead, maskPhone } from './whatsapp';

const fullLead: Lead = {
  nome: 'Maria Silva',
  telefone: '(35) 99999-8888',
  email: 'maria@example.com',
  evento: 'Casamento',
  data: '2026-12-20',
  convidados: '120',
  local: 'Lavras/MG',
  duracao: '6 horas',
  mensagem: 'Quero degustação prévia.'
};

describe('buildWhatsappUrl', () => {
  it('returns wa.me link with digits-only phone', () => {
    const url = buildWhatsappUrl({ phone: '5535998224771', lead: fullLead });
    expect(url.startsWith('https://wa.me/5535998224771?text=')).toBe(true);
  });

  it('strips non-digits from the phone before building the URL', () => {
    const url = buildWhatsappUrl({ phone: '+55 (35) 99822-4771', lead: fullLead });
    expect(url.startsWith('https://wa.me/5535998224771?text=')).toBe(true);
  });

  it('encodes the message body (lead fields appear when decoded)', () => {
    const url = buildWhatsappUrl({ phone: '5535998224771', lead: fullLead });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).toContain('Maria Silva');
    expect(decoded).toContain('Casamento');
    expect(decoded).toContain('120');
    expect(decoded).toContain('Lavras/MG');
    expect(decoded).toContain('Quero degustação prévia.');
  });

  it('omits empty optional fields (email, local, duracao, mensagem) from the message', () => {
    const minimal: Lead = {
      nome: 'João',
      telefone: '31988887777',
      email: '',
      evento: 'Aniversário',
      data: '2026-08-01',
      convidados: '40',
      local: '',
      duracao: '',
      mensagem: ''
    };
    const url = buildWhatsappUrl({ phone: '5535998224771', lead: minimal });
    const decoded = decodeURIComponent(url.split('text=')[1]);
    expect(decoded).not.toContain('Email:');
    expect(decoded).not.toContain('Local:');
    expect(decoded).not.toContain('Duração:');
    expect(decoded).not.toContain('Mensagem:');
    expect(decoded).toContain('João');
    expect(decoded).toContain('Aniversário');
  });
});

describe('maskPhone', () => {
  it('formats 11 digits as (XX) XXXXX-XXXX', () => {
    expect(maskPhone('35999998888')).toBe('(35) 99999-8888');
  });

  it('formats 10 digits as (XX) XXXX-XXXX', () => {
    expect(maskPhone('3533334444')).toBe('(35) 3333-4444');
  });

  it('formats partial input progressively', () => {
    expect(maskPhone('35')).toBe('35');
    expect(maskPhone('359')).toBe('(35) 9');
    expect(maskPhone('359999')).toBe('(35) 9999');
    expect(maskPhone('3599998')).toBe('(35) 9999-8');
  });

  it('caps at 11 digits (extras ignored)', () => {
    expect(maskPhone('35999998888999')).toBe('(35) 99999-8888');
  });

  it('strips non-digits from input before formatting', () => {
    expect(maskPhone('(35) 99999-8888')).toBe('(35) 99999-8888');
    expect(maskPhone('+55 35 999 9888')).toBe('(55) 35999-9888');
  });
});

describe('getLeadFromFormData', () => {
  it('extracts all 9 lead fields from FormData', () => {
    const fd = new FormData();
    fd.append('nome', 'Maria');
    fd.append('telefone', '(35) 99999-8888');
    fd.append('email', 'maria@example.com');
    fd.append('evento', 'Casamento');
    fd.append('data', '2026-12-20');
    fd.append('convidados', '120');
    fd.append('local', 'Lavras/MG');
    fd.append('duracao', '6 horas');
    fd.append('mensagem', 'oi');

    const lead = getLeadFromFormData(fd);
    expect(lead).toEqual({
      nome: 'Maria',
      telefone: '(35) 99999-8888',
      email: 'maria@example.com',
      evento: 'Casamento',
      data: '2026-12-20',
      convidados: '120',
      local: 'Lavras/MG',
      duracao: '6 horas',
      mensagem: 'oi'
    });
  });

  it('coerces missing fields to empty strings', () => {
    const fd = new FormData();
    fd.append('nome', 'João');
    const lead = getLeadFromFormData(fd);
    expect(lead.nome).toBe('João');
    expect(lead.email).toBe('');
    expect(lead.local).toBe('');
    expect(lead.mensagem).toBe('');
  });

  it('ignores unknown fields like _gotcha and lgpd', () => {
    const fd = new FormData();
    fd.append('nome', 'Maria');
    fd.append('_gotcha', 'spam-bot-filled-this');
    fd.append('lgpd', 'on');
    const lead = getLeadFromFormData(fd);
    expect(lead).not.toHaveProperty('_gotcha');
    expect(lead).not.toHaveProperty('lgpd');
  });
});
