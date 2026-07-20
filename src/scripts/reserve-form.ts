// src/scripts/reserve-form.ts
// Cola: valida form → dispara POST Formspree (fire-and-forget) → redireciona pra WhatsApp.
// Lógica pura mora em ./whatsapp.ts (testada via Vitest).
import { buildWhatsappUrl, getLeadFromFormData, maskPhone } from './whatsapp';

const FALLBACK_PHONE = '5535998224771';

function init() {
  const form = document.querySelector<HTMLFormElement>('[data-cinnamon-form]');
  if (!form) return;

  const phone = form.dataset.whatsappNumber ?? FALLBACK_PHONE;

  const tel = form.querySelector<HTMLInputElement>('input[name="telefone"]');
  if (tel) {
    tel.addEventListener('input', () => {
      tel.value = maskPhone(tel.value);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.reportValidity()) return;

    const fd = new FormData(form);

    const gotcha = fd.get('_gotcha');
    if (typeof gotcha === 'string' && gotcha.length > 0) {
      window.location.href = '/privacidade';
      return;
    }

    const lead = getLeadFromFormData(fd);

    fetch(form.action, {
      method: 'POST',
      body: fd,
      headers: { Accept: 'application/json' }
    }).catch(() => {
      // Backup-only — WhatsApp é o canal real.
    });

    window.location.href = buildWhatsappUrl({ phone, lead });
  });
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
