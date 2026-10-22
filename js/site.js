/* SP Safety: Bootstrap navigation, GSAP motion, catalogue filters and image dialog. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion = Boolean(window.gsap) && !reducedMotion.matches;
  const menu = document.getElementById('main-navigation');
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.bootstrap && menu.classList.contains('show')) {
        bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
      }
    });
  });
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  const marquee = document.querySelector('.brand-marquee');
  const pauseButton = document.querySelector('.marquee-toggle');
  pauseButton.addEventListener('click', () => {
    const paused = marquee.classList.toggle('is-paused');
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', paused ? 'Resume brand animation' : 'Pause brand animation');
    pauseButton.querySelector('span').textContent = paused ? 'Resume' : 'Pause';
    pauseButton.querySelector('i').className = `bi bi-${paused ? 'play' : 'pause'}`;
  });

  // Hero text stays readable if GSAP or a plugin cannot load.
  if (motion && window.SplitText) {
    gsap.registerPlugin(SplitText);
    const animateHero = () => {
      if (reducedMotion.matches) return;
      SplitText.create('#hero-title', {
        type: 'lines', mask: 'lines', autoSplit: true,
        onSplit: split => gsap.from(split.lines, {
          yPercent: 105, opacity: 0, duration: .8,
          stagger: .12, ease: 'power3.out', delay: .1
        })
      });
    };
    if (document.fonts) document.fonts.ready.then(animateHero);
    else animateHero();
  }

  const grid = document.querySelector('.product-gallery-grid');
  const cards = [...grid.querySelectorAll('.catalog-item')];
  const previews = cards.map(card => card.querySelector('.catalog-preview'));
  const filterBar = document.getElementById('product-filters');
  const count = document.getElementById('product-count');
  const revealed = new WeakSet();
  let revealTriggers = [];
  let filteringAnimation = null;
  if (motion && window.Flip) gsap.registerPlugin(Flip);
  if (motion && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  function clearReveals() {
    revealTriggers.forEach(trigger => trigger.kill());
    revealTriggers = [];
    if (window.gsap) {
      gsap.killTweensOf(previews);
      gsap.set(previews, { clearProps: 'opacity,transform' });
    }
  }

  // The GSAP example uses ScrollTrigger.batch() to stagger newly entering items.
  // Inner buttons reveal; Flip controls outer cards, keeping their transforms independent.
  function setupReveals(afterFiltering = false) {
    clearReveals();
    if (!motion || reducedMotion.matches || !window.ScrollTrigger) return;
    const pending = cards.filter(card => !card.hidden).map(card => card.querySelector('.catalog-preview')).filter(preview => {
      const top = preview.getBoundingClientRect().top;
      if (top < 0 || (afterFiltering && top < window.innerHeight)) revealed.add(preview);
      return !revealed.has(preview);
    });
    if (!pending.length) return;
    gsap.set(pending, { opacity: 0, y: 24 });
    revealTriggers = ScrollTrigger.batch(pending, {
      start: 'top 94%', once: true, interval: .1, batchMax: 4,
      onEnter: batch => {
        batch.forEach(item => revealed.add(item));
        gsap.to(batch, { opacity: 1, y: 0, duration: .6, stagger: .075, ease: 'power2.out', overwrite: true, clearProps: 'opacity,transform' });
      }
    });
    ScrollTrigger.refresh();
  }
  setupReveals();

  filterBar.addEventListener('click', event => {
    const button = event.target.closest('button[data-filter]');
    if (!button || button.classList.contains('is-active')) return;
    // Finish an earlier layout transition before measuring again on rapid clicks.
    if (filteringAnimation) filteringAnimation.progress(1);
    clearReveals();
    const animate = motion && !reducedMotion.matches && window.Flip;
    const state = animate ? Flip.getState(cards) : null;
    filterBar.querySelectorAll('button').forEach(chip => {
      const selected = chip === button;
      chip.classList.toggle('is-active', selected);
      chip.setAttribute('aria-pressed', String(selected));
    });
    cards.forEach(card => {
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    });
    count.textContent = cards.filter(card => !card.hidden).length;
    const finish = () => {
      filteringAnimation = null;
      setupReveals(true);
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    if (state) {
      filteringAnimation = Flip.from(state, {
        duration: .48, ease: 'power2.inOut', absolute: true, scale: true,
        onEnter: elements => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: .3, clearProps: 'opacity' }),
        onComplete: finish
      });
    } else finish();
  });

  // In-page image enlargement with native Escape handling and focus restoration.
  const dialog = document.getElementById('product-image-dialog');
  const enlargedImage = dialog.querySelector('.image-dialog-photo');
  const caption = document.getElementById('image-dialog-caption');
  let opener = null;
  grid.addEventListener('click', event => {
    const preview = event.target.closest('.catalog-preview');
    if (!preview) return;
    opener = preview;
    const name = preview.querySelector('.catalog-caption').textContent.trim();
    enlargedImage.src = preview.dataset.image;
    enlargedImage.alt = name;
    caption.textContent = name;
    dialog.showModal();
    document.body.classList.add('dialog-open');
  });
  dialog.querySelector('.image-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      if (filteringAnimation) filteringAnimation.progress(1);
      clearReveals();
    }
  });
})();
