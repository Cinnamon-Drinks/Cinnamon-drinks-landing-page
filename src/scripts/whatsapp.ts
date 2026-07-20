export interface Lead {
  nome: string;
  telefone: string;
  email: string;
  evento: string;
  data: string;
  convidados: string;
  local: string;
  duracao: string;
  mensagem: string;
}

export function buildWhatsappUrl(args: { phone: string; lead: Lead }): string {
  const { phone, lead } = args;
  const onlyDigits = phone.replace(/\D/g, '');
  const lines = [
    'Olá! Quero um orçamento Cinnamon Drinks.',
    '',
    `Nome: ${lead.nome}`,
    `WhatsApp: ${lead.telefone}`,
    lead.email && `Email: ${lead.email}`,
    `Evento: ${lead.evento}`,
    `Data: ${lead.data}`,
    `Convidados: ${lead.convidados}`,
    lead.local && `Local: ${lead.local}`,
    lead.duracao && `Duração: ${lead.duracao}`,
    lead.mensagem && `\nMensagem:\n${lead.mensagem}`
  ].filter(Boolean);
  return `https://wa.me/${onlyDigits}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const LEAD_FIELDS = [
  'nome',
  'telefone',
  'email',
  'evento',
  'data',
  'convidados',
  'local',
  'duracao',
  'mensagem'
] as const satisfies ReadonlyArray<keyof Lead>;

export function getLeadFromFormData(fd: FormData): Lead {
  const lead = {} as Lead;
  for (const field of LEAD_FIELDS) {
    const value = fd.get(field);
    lead[field] = typeof value === 'string' ? value : '';
  }
  return lead;
}
