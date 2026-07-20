# Forms patterns para Cinnamon Drinks

> Quando trabalhar com formulários neste projeto, consulte estes padrões.
> Última revisão: 2026-05-04 · Versão da stack: HTML5 + TypeScript + Formspree + Cloudflare Turnstile

## Princípios

- **Submit final = redirect para WhatsApp**. O Formspree (ou similar) só recebe um backup; a conversa real acontece no WhatsApp via `https://wa.me/<num>?text=<mensagem>`.
- **Honeypot** (campo invisível `name="_gotcha"`) é defesa primária contra bots. Cheap, sem JS, ignorado por humanos.
- **Turnstile** é deterrente extra (não validação server-side). Cloudflare bloqueia bots óbvios; o token gerado vai no submit mas o frontend não falha se o widget não carregar.
- **Validação HTML5 nativa** (`required`, `pattern`, `minlength`, `type="email"`, `type="tel"`) + `form.reportValidity()` é a primeira camada. JS adiciona máscara e narrowing de erro.
- **Máscara client-side é puro UX** — server (e a util `buildWhatsappUrl`) sempre normaliza só dígitos.
- **LGPD inline**: checkbox de consentimento + linha curta com link para política de privacidade. Sem dark patterns, sem pré-marcado.

## ✅ Bom

```astro
---
// src/components/ReserveForm.astro — honeypot, Turnstile, novalidate
---
<form class="reserve-form" data-cinnamon-form novalidate
      action="https://formspree.io/f/FORM_ID" method="POST">

  <!-- honeypot: bots preenchem; humanos não veem -->
  <input type="text" name="_gotcha" tabindex="-1" autocomplete="off"
         aria-hidden="true" style="position:absolute;left:-9999px" />

  <label>Nome*
    <input name="nome" type="text" required minlength="2" autocomplete="name" />
  </label>

  <label>WhatsApp*
    <input name="telefone" type="tel" required
           pattern="[0-9() \-+]{10,16}" placeholder="(35) 99999-9999"
           autocomplete="tel-national" />
  </label>

  <label>
    <input type="checkbox" name="lgpd" required />
    Concordo com a <a href="/privacidade">Política de Privacidade</a>.
  </label>

  <div class="cf-turnstile" data-sitekey="TURNSTILE_SITEKEY_PLACEHOLDER"></div>

  <button type="submit">Enviar pedido</button>
</form>

<script>
  import '../scripts/reserve-form.ts';
</script>
```
**Por quê:** `novalidate` desliga o tooltip nativo (estilo inconsistente entre browsers) — JS chama `reportValidity()` quando precisa. `autocomplete` ajuda navegadores móveis. LGPD checkbox `required` força consentimento explícito.

```ts
// src/scripts/whatsapp.ts — util pura testável
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
  const text = [
    `Olá! Quero um orçamento Cinnamon Drinks.`,
    ``,
    `Nome: ${lead.nome}`,
    `WhatsApp: ${lead.telefone}`,
    lead.email && `Email: ${lead.email}`,
    `Evento: ${lead.evento}`,
    `Data: ${lead.data}`,
    `Convidados: ${lead.convidados}`,
    lead.local && `Local: ${lead.local}`,
    lead.duracao && `Duração: ${lead.duracao}`,
    lead.mensagem && `\nMensagem:\n${lead.mensagem}`
  ].filter(Boolean).join('\n');
  return `https://wa.me/${onlyDigits}?text=${encodeURIComponent(text)}`;
}
```
**Por quê:** função pura → 100% testável (`whatsapp.test.ts` em Vitest). `replace(/\D/g, '')` normaliza telefone independente de máscara. `encodeURIComponent` evita quebra com acentos/quebras de linha.

```ts
// src/scripts/reserve-form.ts — fluxo: validate → POST → redirect WhatsApp
import { buildWhatsappUrl, type Lead } from './whatsapp';

const form = document.querySelector<HTMLFormElement>('[data-cinnamon-form]');
form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!form.reportValidity()) return; // dispara UI nativa do browser

  // honeypot — silenciosamente sucesso (bot fica feliz, nada acontece)
  const gotcha = (form.elements.namedItem('_gotcha') as HTMLInputElement)?.value;
  if (gotcha) { window.location.href = '/obrigado'; return; }

  const fd = new FormData(form);
  const lead = Object.fromEntries(fd) as unknown as Lead;

  // Backup: POST async (não bloqueia redirect)
  fetch(form.action, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
    .catch(() => { /* swallow — WhatsApp é o canal real */ });

  const phone = form.dataset.whatsappNumber ?? '5535997494991';
  window.location.href = buildWhatsappUrl({ phone, lead });
});
```
**Por quê:** `reportValidity()` mostra erros HTML5 nativos sem CSS extra. Honeypot redireciona pra `/obrigado` — bot acha que conseguiu, fica feliz, vai embora. POST é fire-and-forget (Formspree backup); usuário sempre cai no WhatsApp.

```ts
// Máscara de telefone — leve, testada
export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
```
**Por quê:** função pura → testável. `slice(0, 11)` impede overflow. Server lida com dígitos puros — máscara é só visual.

## ❌ Ruim

```html
<!-- Sem honeypot, sem Turnstile -->
<form action="/api/lead" method="POST">
  <input name="nome" />
  <input name="telefone" />
  <button>Enviar</button>
</form>
```
**Problema:** spam imediato. Bots de scraping varrem GitHub Pages e Webflow procurando forms abertos. Honeypot custa 1 input, bloqueia 90%+ dos bots; Turnstile pega o resto.

```ts
// Validação manual quando HTML5 cobre
if (!form.nome.value) alert('Preencha o nome');
if (!form.telefone.value.match(/^\d+$/)) alert('Telefone só números');
```
**Problema:** `alert()` é UX terrível. Reinventa o que `required` + `pattern` + `reportValidity()` faz nativo, com a11y embutida.

```ts
// Bloquear submit se Turnstile não carregar
if (!window.turnstile) {
  alert('Falha na verificação. Tente novamente.');
  return;
}
```
**Problema:** Turnstile é **deterrente**, não auth. Se a CF cair ou o usuário tiver ad-blocker agressivo, bloquear submit perde lead real. Aceite ausência do token; backend (Formspree free) já filtra.

```ts
// Telefone com máscara indo direto pro buildWhatsappUrl
window.location.href = `https://wa.me/${form.telefone.value}`;
// → wa.me/(35) 99749-4991  ← inválido
```
**Problema:** WhatsApp deeplink só aceita dígitos. Sempre `replace(/\D/g, '')` antes de montar URL — `buildWhatsappUrl` faz isso, mas se você bypassar a util, perde a normalização.

```html
<!-- Checkbox LGPD pré-marcado -->
<input type="checkbox" name="lgpd" checked />
Aceito termos
```
**Problema:** LGPD exige consentimento **ativo, livre, inequívoco**. Pré-marcado é dark pattern e tecnicamente nulo. ANPD pode multar. Sempre desmarcado + `required`.

## Referências

- HTML5 form validation MDN: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- Formspree: https://formspree.io/
- Honeypot técnica: https://www.aspsnippets.com/Articles/HoneyPot-CAPTCHA-with-Form-Submission/
- LGPD ANPD: https://www.gov.br/anpd/pt-br
- Cross-ref: `docs/patterns/typescript.md` (`Lead` interface), `docs/patterns/seo-a11y.md` (a11y de form)
- Spec: §4.4 (form), §4.7 (LGPD), Plan §Task 8 (setup Formspree+Turnstile)
