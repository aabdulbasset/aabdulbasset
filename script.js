/* ============================================================
   ahmed abdulbasset — motion engine
   one rAF loop drives everything: pointer orbit, scroll parallax,
   the stack explosion, and the marquee drift.
   the page is fully readable and navigable with js disabled.
   ============================================================ */
'use strict';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;

/* ============================================================
   1. split the headline into words that rise out of the floor
   ============================================================ */
(() => {
  const el = document.querySelector('[data-split]');
  if (!el || reduced) return;

  let i = 0;
  const wrap = (node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach((chunk) => {
      if (!chunk.trim()) { frag.append(chunk); return; }
      const mask = document.createElement('span');
      mask.className = 'word';
      const inner = document.createElement('span');
      inner.textContent = chunk;
      inner.style.setProperty('--wi', i++);
      mask.append(inner);
      frag.append(mask);
    });
    return frag;
  };

  // walk one level deep so <em> keeps its styling
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.replaceWith(wrap(node));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const inner = wrap(node.firstChild);
      node.textContent = '';
      node.append(inner);
    }
  });
})();

/* ============================================================
   2. scroll reveals
   ============================================================ */
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      entry.target.classList.add('in');
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  els.forEach((el) => io.observe(el));
})();

/* ============================================================
   3. count-up stats
   ============================================================ */
(() => {
  if (reduced) return;
  const nums = document.querySelectorAll('.stat__num');
  if (!nums.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);

      const el = entry.target;
      const m = el.textContent.trim().match(/^([\d.]+)(.*)$/);
      if (!m) return;
      const target = parseFloat(m[1]);
      const suffix = m[2];
      const decimals = (m[1].split('.')[1] || '').length;
      const t0 = performance.now();
      const dur = 1500;

      (function tick(t) {
        const p = clamp((t - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.6 });

  nums.forEach((n) => io.observe(n));
})();

/* ============================================================
   4. scroll-spy
   ============================================================ */
(() => {
  const links = [...document.querySelectorAll('.nav__links a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.remove('active'));
      byId.get(entry.target.id)?.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((s) => spy.observe(s));
})();

/* ============================================================
   5. pointer-driven tilt on cards and the stat block
   ============================================================ */
(() => {
  if (reduced || !finePointer) return;

  document.querySelectorAll('[data-tilt]').forEach((zone) => {
    const node = zone.querySelector('.card__link') || zone;
    const max = node === zone ? 7 : 10;

    zone.addEventListener('pointermove', (e) => {
      const r = zone.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      node.classList.add('tilting');
      node.style.transform =
        `rotateY(${px * max}deg) rotateX(${py * -max}deg) translateZ(8px)`;
    });

    zone.addEventListener('pointerleave', () => {
      node.classList.remove('tilting');
      node.style.transform = '';
    });
  });
})();

/* ============================================================
   6. the rAF loop — pointer orbit, parallax, stack, marquee, nav
   ============================================================ */
(() => {
  const nav = document.querySelector('[data-nav]');
  const bar = document.querySelector('[data-progress]');
  const parallaxers = [...document.querySelectorAll('[data-par]')].map((el) => ({
    el,
    rate: parseFloat(el.dataset.par) || 0.1,
    isGrid: el.classList.contains('space__grid'),
  }));

  const stack = document.querySelector('[data-stack]');
  const bigRig = document.querySelector('[data-rig-exploded]');
  const slabs = bigRig ? [...bigRig.querySelectorAll('[data-slab]')] : [];
  const rows = [...document.querySelectorAll('[data-row]')];

  const GAP_CLOSED = 60;
  const GAP_OPEN = 150;   // beyond ~150 the exploded stack outgrows the scene box

  /* the scroll-driven explosion only belongs to the sticky (wide) layout;
     narrow screens lay the section out normally and keep the css gap */
  const wide = matchMedia('(min-width: 1041px)');

  /* ---- marquee: fill the track, then drift ---- */
  const track = document.querySelector('[data-marquee]');
  let setWidth = 0;
  let marqueeX = 0;
  if (track) {
    const row = track.firstElementChild;
    while (track.scrollWidth < window.innerWidth * 2) {
      track.append(row.cloneNode(true));
    }
    setWidth = track.scrollWidth;
    track.append(...[...track.children].map((c) => c.cloneNode(true)));
  }

  /* ---- pointer, smoothed ---- */
  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (finePointer && !reduced) {
    addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  /* ---- scroll state ---- */
  let lastY = scrollY;
  let velocity = 0;
  let navHidden = false;
  let navStuck = false;

  const frame = () => {
    const y = scrollY;

    /* pointer orbit */
    if (!reduced) {
      cx = lerp(cx, tx, 0.075);
      cy = lerp(cy, ty, 0.075);
      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));
    }

    /* scroll progress */
    const max = document.body.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;

    /* backdrop parallax */
    if (!reduced) {
      parallaxers.forEach(({ el, rate, isGrid }) => {
        if (isGrid) el.style.backgroundPosition = `0px ${(y * rate).toFixed(1)}px`;
        else el.style.translate = `0 ${(-y * rate).toFixed(1)}px`;
      });
    }

    /* the stack explosion */
    if (stack && bigRig) {
      const rect = stack.getBoundingClientRect();
      const travel = rect.height - innerHeight;
      const p = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;

      if (!reduced && travel > 0 && wide.matches) {
        bigRig.style.setProperty('--gap', `${lerp(GAP_CLOSED, GAP_OPEN, p).toFixed(1)}px`);
        bigRig.style.setProperty('--turn', `${(p * 26).toFixed(2)}deg`);
      } else if (bigRig.style.getPropertyValue('--gap')) {
        bigRig.style.removeProperty('--gap');
        bigRig.style.removeProperty('--turn');
      }

      // four layers over the middle 80% of the scroll, one at a time
      if (!reduced) {
        const active = clamp(Math.floor(((p - 0.08) / 0.84) * 4), 0, 3);
        const visible = travel <= 0 || (rect.top < innerHeight && rect.bottom > 0);
        slabs.forEach((s, i) => s.classList.toggle('is-live', visible && i === active));
        rows.forEach((r, i) => r.classList.toggle('is-live', visible && i === active));
      }
    }

    /* marquee drift, nudged by scroll speed */
    if (track && setWidth && !reduced) {
      velocity = lerp(velocity, y - lastY, 0.12);
      marqueeX -= 0.45 + clamp(velocity, -40, 40) * 0.06;
      if (marqueeX <= -setWidth) marqueeX += setWidth;
      if (marqueeX > 0) marqueeX -= setWidth;
      track.style.translate = `${marqueeX.toFixed(1)}px`;
    }

    /* nav: hide going down, reveal going up */
    if (nav) {
      const wantHidden = y > lastY + 2 && y > 380;
      const wantShown = y < lastY - 2;
      if (wantHidden && !navHidden) { nav.classList.add('nav--hidden'); navHidden = true; }
      else if (wantShown && navHidden) { nav.classList.remove('nav--hidden'); navHidden = false; }

      const wantStuck = y > 40;
      if (wantStuck !== navStuck) { nav.classList.toggle('nav--stuck', wantStuck); navStuck = wantStuck; }
    }

    lastY = y;
    requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
})();
