// ============================================
// app.js — comportamiento compartido en todas las páginas
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar: cambia de fondo al hacer scroll ---------- */
  const nav = document.querySelector('.gx-nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 40) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  /* ---------- Música de fondo en loop, con botón de mute/play ---------- */
  const audio = document.getElementById('theme-audio');
  const toggle = document.getElementById('audio-toggle');

  if (audio && toggle) {
    audio.loop = true;
    audio.volume = 0.45;

    const updateIcon = () => {
      toggle.textContent = audio.paused ? '🔇' : '🔊';
      toggle.classList.toggle('muted', audio.paused);
    };

    const tryPlay = () => audio.play().then(updateIcon).catch(() => updateIcon());
    tryPlay();

    const startOnFirstInteraction = () => {
      if (audio.paused) tryPlay();
      document.removeEventListener('click', startOnFirstInteraction);
      document.removeEventListener('keydown', startOnFirstInteraction);
    };
    document.addEventListener('click', startOnFirstInteraction, { once: true });
    document.addEventListener('keydown', startOnFirstInteraction, { once: true });

    toggle.addEventListener('click', () => {
      if (audio.paused) tryPlay();
      else { audio.pause(); updateIcon(); }
    });

    updateIcon();
  }

  /* ---------- Modal de detalle al hacer clic en una tarjeta ---------- */
  const modalBackdrop = document.getElementById('gx-modal-backdrop');
  const modalImg     = document.getElementById('gx-modal-img');
  const modalTitle   = document.getElementById('gx-modal-title');
  const modalBody    = document.getElementById('gx-modal-body-content');
  const modalClose   = document.getElementById('gx-modal-close');

  if (modalBackdrop) {
    document.querySelectorAll('[data-modal-title]').forEach(card => {
      card.addEventListener('click', () => {
        modalImg.src           = card.dataset.modalImg   || '';
        modalTitle.textContent = card.dataset.modalTitle || '';
        modalBody.innerHTML    = card.dataset.modalBody  || '';
        modalBackdrop.classList.add('open');
      });
    });

    const closeModal = () => modalBackdrop.classList.remove('open');
    modalClose?.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Animación de entrada "caída por la madriguera": cada bloque de tema
  // (.gx-topic) se revela con fade + desplazamiento cuando aparece en pantalla.
  const topics = document.querySelectorAll('.gx-topic');
  if (topics.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('gx-fall-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    topics.forEach(topic => revealObserver.observe(topic));
  }

  /* ─────────────────────────────────────────────────────────────────────────
     CARRUSEL estilo Disney+
     Por cada .gx-topic que tenga un .gx-cards:
       1. Envuelve .gx-cards en un .gx-carousel-wrap
       2. Inyecta los botones prev / next
       3. Gestiona el scroll y activa/desactiva flechas + gradientes laterales
     ───────────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.gx-topic').forEach(topic => {
    const track = topic.querySelector('.gx-cards');
    if (!track) return;

    // Sólo activar si las tarjetas desbordan (más de 4)
    // Lo comprobamos después de renderizar con un pequeño delay
    const setup = () => {
      const cardCount = track.querySelectorAll('.gx-card').length;
      if (cardCount <= 4) return; // 4 o menos → no hace falta carrusel

      // Crear wrap
      const wrap = document.createElement('div');
      wrap.className = 'gx-carousel-wrap';
      track.parentNode.insertBefore(wrap, track);
      wrap.appendChild(track);

      // Crear botones
      const btnPrev = document.createElement('button');
      btnPrev.className = 'gx-carousel-btn prev';
      btnPrev.setAttribute('aria-label', 'Anterior');
      btnPrev.innerHTML = '&#8249;'; // ‹

      const btnNext = document.createElement('button');
      btnNext.className = 'gx-carousel-btn next';
      btnNext.setAttribute('aria-label', 'Siguiente');
      btnNext.innerHTML = '&#8250;'; // ›

      wrap.appendChild(btnPrev);
      wrap.appendChild(btnNext);

      // Cuánto desplazarse: ancho de una tarjeta × 4
      const scrollAmount = () => {
        const card = track.querySelector('.gx-card');
        return card ? (card.offsetWidth + 14) * 4 : 280 * 4;
      };

      btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
      });
      btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        track.scrollBy({ left:  scrollAmount(), behavior: 'smooth' });
      });

      // Actualizar estado de flechas y gradientes laterales
      const updateButtons = () => {
        const atStart = track.scrollLeft <= 4;
        const atEnd   = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
        btnPrev.disabled = atStart;
        btnNext.disabled = atEnd;
        wrap.classList.toggle('can-prev', !atStart);
        wrap.classList.toggle('can-next', !atEnd);
      };

      track.addEventListener('scroll', updateButtons, { passive: true });
      // Estado inicial
      updateButtons();
      // Re-check al cambiar tamaño de ventana
      window.addEventListener('resize', updateButtons, { passive: true });
    };

    // Pequeño delay para dejar que el browser calcule el layout
    requestAnimationFrame(() => requestAnimationFrame(setup));
  });

});
