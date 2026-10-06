/* Port1 case pages: site-visit photo deck, charts that draw when they scroll in, click-to-load Figma prototypes. */
(() => {
  const safe = (n, f) => { try { f(); } catch (e) { console.warn('[case] ' + n, e); } };

  /* site visit: a deck of photos that advances on its own (pauses on hover / off screen) */
  safe('site-slider', () => document.querySelectorAll('[data-site-slider]').forEach(box => {
    const slides = [...box.querySelectorAll('.ss-slide')], bars = [...box.querySelectorAll('.ss-bar')], caps = [...box.querySelectorAll('.ss-caps li')];
    const stage = box.querySelector('.site-stage'), N = slides.length, DUR = 4600;
    if (N < 2) return;
    box.style.setProperty('--ss-dur', DUR + 'ms');
    slides.forEach(s => { const im = s.querySelector('img'); if (im) im.loading = 'eager'; });
    let cur = 0, timer = 0, left = DUR, t0 = 0, hover = false, seen = false;
    const paused = () => hover || !seen || document.hidden;
    const show = k => {
      cur = (k + N) % N;
      slides.forEach((s, i) => { const d = (i - cur + N) % N; s.style.setProperty('--i', d); s.classList.toggle('on', d === 0); s.setAttribute('aria-hidden', d ? 'true' : 'false'); });
      bars.forEach((b, i) => { b.classList.toggle('on', i === cur); b.classList.toggle('done', i < cur); const f = b.querySelector('i'); f.style.animation = 'none'; void b.offsetWidth; f.style.animation = ''; });
      caps.forEach((c, i) => c.classList.toggle('on', i === cur));
      left = DUR; arm();
    };
    const arm = () => { clearTimeout(timer); box.classList.toggle('paused', paused()); if (!paused()) { t0 = performance.now(); timer = setTimeout(() => show(cur + 1), left); } };
    const hold = () => { if (timer) { clearTimeout(timer); timer = 0; left = Math.max(300, left - (performance.now() - t0)); } box.classList.add('paused'); };
    stage.addEventListener('click', () => show(cur + 1));
    bars.forEach((b, i) => b.addEventListener('click', () => show(i)));
    caps.forEach((c, i) => c.addEventListener('click', () => show(i)));
    box.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; hold(); } });
    box.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; arm(); } });
    let x0 = null;
    stage.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
    stage.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); });
    document.addEventListener('visibilitychange', () => document.hidden ? hold() : arm());
    if ('IntersectionObserver' in window) new IntersectionObserver(([en]) => { seen = en.isIntersecting; seen ? arm() : hold(); }, { threshold: .35 }).observe(box);
    else seen = true;
    show(0);
  }));

  /* flowcharts, the design-thinking loop, the sitemap and stickers pop in once they're on screen */
  safe('inview', () => {
    const els = document.querySelectorAll('.fc-svg, [data-inview], .pop-in'); if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(ens => ens.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .2 });
    els.forEach(e => io.observe(e));
  });

  /* Figma prototypes: the embed is heavy, so it loads only when asked */
  safe('prototype', () => document.querySelectorAll('[data-proto]').forEach(box => {
    const btn = box.querySelector('.proto-load'), stage = box.querySelector('.proto-stage'); if (!btn || !stage) return;
    btn.addEventListener('click', () => {
      if (box.classList.contains('is-live')) return;
      const f = document.createElement('iframe');
      f.title = box.dataset.title || 'Interactive prototype'; f.allow = 'fullscreen; clipboard-write'; f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.addEventListener('load', () => box.classList.add('is-loaded'), { once: true });
      f.src = box.dataset.src; stage.append(f); box.classList.add('is-live');
    });
  }));
})();
