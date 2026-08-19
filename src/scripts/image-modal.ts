const modal = document.querySelector<HTMLElement>('[data-image-modal]');
const modalImage = modal?.querySelector<HTMLImageElement>('[data-image-modal-image]');
const modalCaption = modal?.querySelector<HTMLElement>('[data-image-modal-caption]');
const closeControls = modal?.querySelectorAll<HTMLElement>('[data-image-modal-close]') ?? [];
const triggers = document.querySelectorAll<HTMLElement>('[data-image-modal-trigger]');

let activeTrigger: HTMLElement | null = null;

const isOpen = () => modal?.classList.contains('is-open') ?? false;

const closeModal = () => {
  if (!modal || !modalImage || !isOpen()) return;

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove('is-image-modal-open');
  modalImage.removeAttribute('src');
  modalImage.alt = '';
  if (modalCaption) modalCaption.textContent = '';

  activeTrigger?.focus();
  activeTrigger = null;
};

const openModal = (trigger: HTMLElement) => {
  if (!modal || !modalImage || !modalCaption) return;

  const src = trigger.dataset.imageModalSrc;
  if (!src) return;

  const title = trigger.dataset.imageModalTitle ?? '';
  const alt = trigger.dataset.imageModalAlt ?? title;

  activeTrigger = trigger;
  modalImage.src = src;
  modalImage.alt = alt;
  modalCaption.textContent = title || alt;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('is-image-modal-open');

  modal.querySelector<HTMLButtonElement>('.image-modal__close')?.focus();
};

for (const trigger of triggers) {
  trigger.addEventListener('click', () => openModal(trigger));
}

for (const control of closeControls) {
  control.addEventListener('click', closeModal);
}

document.addEventListener('keydown', (event) => {
  if (!isOpen()) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }

  if (event.key !== 'Tab' || !modal) return;

  const focusableElements = [...modal.querySelectorAll<HTMLElement>('button:not([disabled])')];
  const firstElement = focusableElements.at(0);
  const lastElement = focusableElements.at(-1);
  if (!firstElement || !lastElement) return;

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});
