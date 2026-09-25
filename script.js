/* ============================================================
   ahmed abdulbasset — motion
   one rAF loop drives the pointer orbit, the stack explosion, and the nav.
   the page is fully readable and navigable with js disabled.
   ============================================================ */
'use strict';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const lerp = (a, b, t) => a + (b - a) * t;

/* ============================================================
   1. scroll reveals
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
   2. scroll-spy
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
   3. the rAF loop — pointer orbit, stack, nav
   ============================================================ */
(() => {
  const nav = document.querySelector('[data-nav]');
  const stack = document.querySelector('[data-stack]');
  const rig = document.querySelector('[data-rig-exploded]');
  const slabs = rig ? [...rig.querySelectorAll('[data-slab]')] : [];
  const rows = [...document.querySelectorAll('[data-row]')];

  const GAP_CLOSED = 60;
  const GAP_OPEN = 150;   // beyond ~150 the exploded stack outgrows the scene box

  /* the scroll-driven explosion only belongs to the sticky (wide) layout;
     narrow screens lay the section out normally and keep the css gap */
  const wide = matchMedia('(min-width: 1041px)');

  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (finePointer && !reduced) {
    addEventListener('pointermove', (e) => {
      tx = (e.clientX / innerWidth) * 2 - 1;
      ty = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let lastY = scrollY;
  let navHidden = false;
  let navStuck = false;

  const frame = () => {
    const y = scrollY;

    if (!reduced) {
      cx = lerp(cx, tx, 0.05);
      cy = lerp(cy, ty, 0.05);
      root.style.setProperty('--mx', cx.toFixed(4));
      root.style.setProperty('--my', cy.toFixed(4));
    }

    if (stack && rig) {
      const rect = stack.getBoundingClientRect();
      const travel = rect.height - innerHeight;
      const p = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;

      if (!reduced && travel > 0 && wide.matches) {
        rig.style.setProperty('--gap', `${lerp(GAP_CLOSED, GAP_OPEN, p).toFixed(1)}px`);
        rig.style.setProperty('--turn', `${(p * 26).toFixed(2)}deg`);
      } else if (rig.style.getPropertyValue('--gap')) {
        rig.style.removeProperty('--gap');
        rig.style.removeProperty('--turn');
      }

      // four layers over the middle 80% of the scroll, one at a time
      if (!reduced) {
        const active = clamp(Math.floor(((p - 0.08) / 0.84) * 4), 0, 3);
        const visible = travel <= 0 || (rect.top < innerHeight && rect.bottom > 0);
        slabs.forEach((s, i) => s.classList.toggle('is-live', visible && i === active));
        rows.forEach((r, i) => r.classList.toggle('is-live', visible && i === active));
      }
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
