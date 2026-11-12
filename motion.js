/* Antigravity Ticketing — motion layer. Vanilla JS, no dependencies.
   Skipped entirely for visitors who prefer reduced motion: the page stays complete and static. */
(() => {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const root = document.documentElement;
  root.classList.add("motion");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ── Reveal on scroll ───────────────────────────────────── */
  // [selector, variant, stagger columns (0 = no stagger)]
  const reveals = [
    [".strip p", "up", 0],
    [".strip li", "scale", 6],
    [".head > *", "head", 3],
    [".flow > .card:nth-child(1)", "left", 0],
    [".flow > .card:nth-child(2)", "right", 0],
    [".bento .card", "scale", 2],
    [".assure li", "up", 4],
    [".sizer", "scale", 0],
    [".plan", "up", 3],
    [".mods .card", "up", 2],
    [".faq__intro > *", "up", 4],
    [".qa", "up", 6],
    [".closing h2, .closing p, .closing .hero__cta", "up", 3],
    [".t3d", "scene", 3],
    [".foot__grid > *", "up", 4],
    [".foot__base", "up", 0],
  ];
  const claimed = new Set();
  reveals.forEach(([sel, variant, cols]) => {
    const counts = new Map();
    $$(sel).forEach((el) => {
      if (claimed.has(el)) return;
      claimed.add(el);
      el.dataset.reveal = variant;
      if (cols) {
        const n = counts.get(el.parentElement) || 0;
        counts.set(el.parentElement, n + 1);
        el.style.setProperty("--i", n % cols);
      }
    });
  });

  // Index inside art groups, used for staggered inner animation.
  [".builder__row", ".gates__row", ".mail__row, .mail__card", ".bars i", ".wall div", ".board li", ".quest li"].forEach((sel) => {
    const counts = new Map();
    $$(sel).forEach((el) => {
      const n = counts.get(el.parentElement) || 0;
      counts.set(el.parentElement, n + 1);
      el.style.setProperty("--k", n);
    });
  });

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    $$("[data-reveal]").forEach((el) => io.observe(el));
  } else {
    $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  }

  /* ── Card tilt (mouse only) ─────────────────────────────── */
  if (finePointer) {
    [".bento .card", ".mods .card", ".plan"].forEach((sel) =>
      $$(sel).forEach((el) => (el.dataset.tilt = el.classList.contains("plan") ? "4" : "3"))
    );
    $$("[data-tilt]").forEach((el) => {
      const max = Number(el.dataset.tilt) || 3;
      el.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add("is-tilting");
        el.style.setProperty("--rx", `${(-y * max * 2).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${(x * max * 2).toFixed(2)}deg`);
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-tilting");
        el.style.removeProperty("--rx");
        el.style.removeProperty("--ry");
      });
    });
  }

  /* ── One frame loop: scroll depth, parallax, pointer ────── */
  const hero = $(".hero");
  const stage = $(".hero__stage");
  const closing = $(".closing");

  const parallax = [
    [$(".hero .clouds--back"), -0.1],
    [$(".hero .clouds--front"), 0.14],
    [$(".pricing .clouds"), 0.1],
    [$(".closing .clouds"), 0.1],
  ]
    .filter(([el]) => el)
    .map(([el, speed]) => ({ el, speed, host: el.parentElement }));

  const ptr = { hx: 0, hy: 0, thx: 0, thy: 0, cx: 0, cy: 0, tcx: 0, tcy: 0 };
  let raf = 0;
  let lastY = -1;

  const frame = () => {
    raf = 0;
    const y = window.scrollY;
    const vh = window.innerHeight;
    let more = false;

    if (y !== lastY) {
      lastY = y;
      if (hero) hero.style.setProperty("--p", clamp(y / 480, 0, 1).toFixed(3));
      parallax.forEach(({ el, speed, host }) => {
        const r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });
    }

    const ease = 0.085;
    ptr.hx += (ptr.thx - ptr.hx) * ease;
    ptr.hy += (ptr.thy - ptr.hy) * ease;
    ptr.cx += (ptr.tcx - ptr.cx) * ease;
    ptr.cy += (ptr.tcy - ptr.cy) * ease;
    if (stage) {
      stage.style.setProperty("--mx", ptr.hx.toFixed(3));
      stage.style.setProperty("--my", ptr.hy.toFixed(3));
    }
    if (closing) {
      closing.style.setProperty("--cx", ptr.cx.toFixed(3));
      closing.style.setProperty("--cy", ptr.cy.toFixed(3));
    }
    if (
      Math.abs(ptr.thx - ptr.hx) > 0.002 ||
      Math.abs(ptr.thy - ptr.hy) > 0.002 ||
      Math.abs(ptr.tcx - ptr.cx) > 0.002 ||
      Math.abs(ptr.tcy - ptr.cy) > 0.002
    ) {
      more = true;
    }
    if (more) raf = requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  if (finePointer) {
    window.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType !== "mouse") return;
        ptr.thx = (e.clientX / window.innerWidth) * 2 - 1;
        ptr.thy = (e.clientY / window.innerHeight) * 2 - 1;
        if (closing) {
          const r = closing.getBoundingClientRect();
          if (r.bottom > 0 && r.top < window.innerHeight) {
            ptr.tcx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
            ptr.tcy = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
          }
        }
        kick();
      },
      { passive: true }
    );
  }
  kick();

  /* ── Lucky draw wheel: levels out while spinning ────────── */
  const wheel = $(".wheel");
  const spin = $("#spin");
  if (wheel && spin) {
    let t;
    spin.addEventListener("click", () => {
      wheel.classList.add("is-spinning");
      clearTimeout(t);
      t = setTimeout(() => wheel.classList.remove("is-spinning"), 4700);
    });
  }

  /* ── Photo wall: pending photos get approved in turn ────── */
  const tiles = $$(".wall div");
  if (tiles.length) {
    let n = 0;
    const flip = () => {
      if (document.hidden) return;
      const r = tiles[0].parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const tile = tiles[n++ % tiles.length];
      const chip = $(".chip", tile);
      if (!chip) return;
      const ok = chip.classList.contains("chip--ok");
      chip.classList.toggle("chip--ok", !ok);
      chip.classList.toggle("chip--warn", ok);
      chip.textContent = ok ? "Menunggu" : "Tampil";
      tile.classList.add("pop");
      setTimeout(() => tile.classList.remove("pop"), 900);
    };
    setInterval(flip, 2600);
  }
})();
