/* Antigravity Ticketing — page behavior. Vanilla JS, no dependencies. */
(() => {
  "use strict";

  /* ── Config ─────────────────────────────────────────────── */
  const WA_NUMBER = "6281298765432"; // +62 812-9876-5432
  const CMS_URL = "cms.html"; // CMS Organizer page; swap for the hosted admin URL when it goes live
  const fmt = new Intl.NumberFormat("id-ID");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wa = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ── Fokus: cincin biru hanya untuk keyboard, bukan klik mouse/sentuh ── */
  const root = document.documentElement;
  window.addEventListener("pointerdown", () => root.classList.add("using-pointer"), true);
  window.addEventListener("keydown", (e) => { if (e.key === "Tab") root.classList.remove("using-pointer"); }, true);

  /* ── CMS link ───────────────────────────────────────────── */
  $$("[data-cms]").forEach((a) => (a.href = CMS_URL));

  /* ── Nav: scrolled state, mobile menu, current section ──── */
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    nav.toggleAttribute("data-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.hasAttribute("data-open")));
  $$("#nav-panel a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.hasAttribute("data-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  const links = $$(".nav__links a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a) => a.removeAttribute("aria-current"));
          const hit = links.find((a) => a.getAttribute("href") === `#${en.target.id}`);
          if (hit) hit.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ── Demo QR (decorative, not scannable) ────────────────── */
  const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };
  const rng = (seed) => () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const N = 25;
  const drawQR = (svg, text) => {
    const rand = rng(hash(text));
    const cells = Array.from({ length: N }, () => Array(N).fill(false));
    const reserved = Array.from({ length: N }, () => Array(N).fill(false));
    const finder = (ox, oy) => {
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          const px = ox + x;
          const py = oy + y;
          if (px < 0 || py < 0 || px >= N || py >= N) continue;
          reserved[py][px] = true;
          const ring = x >= 0 && x <= 6 && y >= 0 && y <= 6;
          const outer = ring && (x === 0 || x === 6 || y === 0 || y === 6);
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          cells[py][px] = outer || inner;
        }
      }
    };
    finder(0, 0);
    finder(N - 7, 0);
    finder(0, N - 7);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (!reserved[y][x]) cells[y][x] = rand() > 0.52;
      }
    }
    let d = "";
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) if (cells[y][x]) d += `M${x} ${y}h1v1h-1z`;
    }
    svg.setAttribute("shape-rendering", "crispEdges");
    svg.innerHTML = `<path d="${d}" fill="currentColor"/>`;
  };
  $$("[data-qr]").forEach((svg) => drawQR(svg, svg.dataset.qr));

  /* ── Step 1: registration → ticket ──────────────────────── */
  const form = $("#reg-form");
  const nameInput = $("#reg-name");
  const nameErr = $("#reg-name-err");
  const mini = {
    box: $("#mini-ticket"),
    name: $("#mt-name"),
    cat: $("#mt-cat"),
    code: $("#mt-code"),
    status: $("#mt-status"),
    qr: $("#mt-qr"),
  };
  const catLabel = { REG: "Regular", VIP: "VIP", VVIP: "VVIP" };

  // The ticket currently shown, plus a queue of registered tickets waiting to be scanned.
  let current = { name: "Budi Hartanto", cat: "VIP", code: "TCK-VIP-BUD-2026", used: false };
  const queue = [];
  const usedTickets = [];

  const makeCode = (name, cat) => {
    const letters = name.normalize("NFD").replace(/[^A-Za-z]/g, "").toUpperCase();
    return `TCK-${cat}-${(letters.slice(0, 3) || "XXX").padEnd(3, "X")}-2026`;
  };

  const showTicket = (t) => {
    mini.name.textContent = t.name;
    mini.cat.textContent = catLabel[t.cat];
    mini.code.textContent = t.code;
    drawQR(mini.qr, t.code);
    setStatus(t.used);
  };
  const setStatus = (used) => {
    mini.status.textContent = used ? "SUDAH CHECK-IN" : "TERDAFTAR";
    mini.status.className = used ? "chip chip--ok" : "chip";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim().replace(/\s+/g, " ");
    if (name.length < 3) {
      nameInput.setAttribute("aria-invalid", "true");
      nameErr.textContent = "Isi nama lengkap peserta (minimal 3 huruf).";
      nameInput.focus();
      return;
    }
    nameInput.removeAttribute("aria-invalid");
    nameErr.textContent = "";
    const cat = form.elements.cat.value;
    current = { name, cat, code: makeCode(name, cat), used: false };
    queue.push(current);
    showTicket(current);
    mini.box.classList.remove("is-new");
    void mini.box.offsetWidth; // restart the pop animation
    mini.box.classList.add("is-new");
    form.reset();
    nameInput.focus({ preventScroll: true });
    setVf("idle", `Tiket ${current.code} siap dipindai di Pintu 01`);
  });
  nameInput.addEventListener("input", () => {
    if (nameInput.hasAttribute("aria-invalid") && nameInput.value.trim().length >= 3) {
      nameInput.removeAttribute("aria-invalid");
      nameErr.textContent = "";
    }
  });

  /* ── Step 2: gate scanner ───────────────────────────────── */
  const vf = $("#viewfinder");
  const vfMsg = $("#vf-msg");
  const gateState = $("#gate-state");
  const historyEl = $("#history");
  const pool = [
    ["Maya Kusuma", "REG"],
    ["Rizky Pratama", "VIP"],
    ["Dewi Lestari", "REG"],
    ["Fajar Nugroho", "VVIP"],
    ["Nadia Putri", "REG"],
    ["Bagas Wibowo", "VIP"],
  ];
  let poolIdx = 0;
  let resetTimer;
  const lastUsed = { name: "Siti Rahmawati", cat: "REG", code: "TCK-REG-SIT-2026", at: "09:41" };

  const icon = (id) => `<svg class="icon"><use href="#${id}"/></svg>`;
  const hhmm = () =>
    new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }).replace(".", ":");

  function setVf(state, text, title) {
    clearTimeout(resetTimer);
    if (state === "idle") vf.classList.remove("has-qr");
    vf.classList.remove("is-scanning");
    vf.classList.toggle("is-ok", state === "ok");
    vf.classList.toggle("is-dup", state === "dup");
    const ic = state === "ok" ? "i-check" : state === "dup" ? "i-x" : "i-camera";
    vfMsg.innerHTML = `${icon(ic)}${title ? `<strong></strong>` : ""}<span></span>`;
    if (title) $("strong", vfMsg).textContent = title;
    $("span", vfMsg).textContent = text;
    gateState.textContent = state === "ok" ? "Masuk berhasil" : state === "dup" ? "Tiket ditolak" : "Siap memindai";
    gateState.className = state === "dup" ? "chip chip--warn" : "chip chip--ok";
    if (state !== "idle") {
      resetTimer = setTimeout(() => setVf("idle", "Arahkan kamera ke QR tiket"), reduceMotion ? 6000 : 3600);
    }
  }

  const initials = (n) =>
    n
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const addHistory = (name, ok, extra) => {
    if (!historyEl) return;
    const li = document.createElement("li");
    li.className = "is-new";
    li.innerHTML =
      `<span class="avatar"></span><div class="who"><b></b><span></span></div>` +
      `<span class="chip ${ok ? "chip--ok" : "chip--warn"}">${ok ? "Masuk" : "Ditolak"}</span>`;
    $(".avatar", li).textContent = initials(name);
    $(".who b", li).textContent = name;
    $(".who span", li).textContent = `Pintu 01 · ${hhmm()}${extra ? ` · ${extra}` : ""}`;
    historyEl.prepend(li);
    while (historyEl.children.length > 5) historyEl.lastElementChild.remove();
  };

  // Pindai dulu (QR muncul di bingkai, garis menyapu), baru tampilkan hasilnya.
  let scanning = false;
  function scanThen(code, apply) {
    if (scanning) return;
    scanning = true;
    clearTimeout(resetTimer);
    vf.classList.remove("is-ok", "is-dup");
    drawQR($("#vf-qr"), code);
    vf.classList.add("has-qr", "is-scanning");
    vfMsg.innerHTML = `${icon("i-camera")}<span>Memindai ${code}…</span>`;
    setTimeout(() => {
      scanning = false;
      apply();
    }, reduceMotion ? 150 : 1200);
  }

  $("#scan-valid").addEventListener("click", () => {
    let t = queue.find((q) => !q.used);
    if (!t) {
      const [name, cat] = pool[poolIdx++ % pool.length];
      t = { name, cat, code: makeCode(name, cat), used: false };
      queue.push(t);
    }
    scanThen(t.code, () => finishValid(t));
  });
  function finishValid(t) {
    t.used = true;
    t.at = hhmm();
    usedTickets.push(t);
    Object.assign(lastUsed, t);
    if (t.code === current.code) {
      current.used = true;
      setStatus(true);
    }
    setVf("ok", `${t.name} · ${catLabel[t.cat]}`, "Masuk berhasil");
    addHistory(t.name, true);
  }

  $("#scan-dup").addEventListener("click", () => {
    const t = usedTickets[usedTickets.length - 1] || lastUsed;
    scanThen(t.code, () => {
      setVf("dup", `${t.name} sudah dipindai pukul ${t.at || hhmm()}`, "Tiket sudah digunakan");
      addHistory(t.name, false, "tiket ganda");
    });
  });

  /* ── Pricing: capacity → recommended plan ───────────────── */
  const cap = $("#cap");
  const capOut = $("#cap-out");
  const capRec = $("#cap-rec");
  const plans = $$(".plan");
  const recChips = $$("[data-rec]");

  const planFor = (n) => (n <= 500 ? "starter" : n <= 2500 ? "professional" : "enterprise");
  const planName = { starter: "Starter", professional: "Professional", enterprise: "Enterprise" };

  const updateCap = () => {
    const n = Number(cap.value);
    const atMax = n >= Number(cap.max);
    const label = atMax ? "10.000+" : fmt.format(n);
    capOut.innerHTML = `${label} <small>peserta</small>`;
    cap.style.setProperty("--pct", `${((n - cap.min) / (cap.max - cap.min)) * 100}%`);
    const key = planFor(n);
    capRec.textContent = `Rekomendasi: Paket ${planName[key]}`;
    plans.forEach((p) => {
      const on = p.dataset.plan === key;
      p.classList.toggle("is-rec", on);
      const chip = $("[data-rec]", p);
      if (chip) chip.hidden = !on;
    });
    $$("[data-wa-plan]").forEach((a) => {
      const p = a.dataset.waPlan;
      a.href = wa(`Halo Antigravity, saya ingin mengajukan pendaftaran Paket ${p} untuk sekitar ${label} peserta.`);
    });
    cap.setAttribute("aria-valuetext", `${label} peserta, rekomendasi Paket ${planName[key]}`);
  };
  cap.addEventListener("input", updateCap);
  updateCap();

  $$("[data-wa-mod]").forEach((a) => {
    a.href = wa(`Halo Antigravity, saya tertarik dengan modul ${a.dataset.waMod}.`);
  });
  $$("[data-wa-general]").forEach((a) => {
    a.href = wa("Halo Antigravity, saya ingin berdiskusi tentang kebutuhan tiket untuk acara kami.");
  });

  /* ── Lucky draw wheel ───────────────────────────────────── */
  const rotor = $("#wheel-rotor");
  const SEG = 8;
  const colors = ["#1366f0", "#d6ecfd"];
  const polar = (a, r) => [100 + r * Math.sin(a), 100 - r * Math.cos(a)];
  let paths = "";
  for (let i = 0; i < SEG; i++) {
    const a0 = (i / SEG) * Math.PI * 2;
    const a1 = ((i + 1) / SEG) * Math.PI * 2;
    const [x0, y0] = polar(a0, 96);
    const [x1, y1] = polar(a1, 96);
    paths += `<path d="M100 100L${x0.toFixed(2)} ${y0.toFixed(2)}A96 96 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}Z" fill="${colors[i % 2]}"/>`;
  }
  rotor.innerHTML =
    `<circle cx="100" cy="100" r="98" fill="#fff"/>${paths}` +
    `<circle cx="100" cy="100" r="96" fill="none" stroke="#fff" stroke-width="4"/>` +
    `<circle cx="100" cy="100" r="16" fill="#fff"/><circle cx="100" cy="100" r="7" fill="#1366f0"/>`;

  const winners = [
    "Maya Kusuma · TCK-REG-MAY-2026",
    "Rizky Pratama · TCK-VIP-RIZ-2026",
    "Dewi Lestari · TCK-REG-DEW-2026",
    "Fajar Nugroho · TCK-VVIP-FAJ-2026",
    "Nadia Putri · TCK-REG-NAD-2026",
    "Bagas Wibowo · TCK-VIP-BAG-2026",
    "Citra Maharani · TCK-REG-CIT-2026",
    "Hendra Gunawan · TCK-VIP-HEN-2026",
  ];
  const spinBtn = $("#spin");
  const winnerEl = $("#winner");
  let rot = 0;
  let spinning = false;
  spinBtn.addEventListener("click", () => {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    winnerEl.classList.remove("is-set");
    winnerEl.textContent = "Mengundi…";
    const idx = Math.floor(Math.random() * SEG);
    const mid = (idx + 0.5) * (360 / SEG);
    const jitter = (Math.random() - 0.5) * (360 / SEG) * 0.6;
    rot += 360 * 5 + (360 - ((rot % 360) + mid)) + jitter;
    rotor.style.transform = `rotate(${rot}deg)`;
    const done = () => {
      spinning = false;
      spinBtn.disabled = false;
      const [nm, code] = winners[idx].split(" · ");
      winnerEl.classList.add("is-set");
      winnerEl.innerHTML = `Pemenang (peserta terverifikasi, contoh)<b></b>`;
      $("b", winnerEl).textContent = `${nm} · ${code}`;
    };
    let fired = false;
    const once = () => {
      if (fired) return;
      fired = true;
      done();
    };
    rotor.addEventListener("transitionend", once, { once: true });
    setTimeout(once, reduceMotion ? 600 : 4500);
  });

  /* ── Footer: subscribe (opens the visitor's email client) ─ */
  const subForm = $("#subscribe");
  const subEmail = $("#sub-email");
  const subMsg = $("#sub-msg");
  subForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = subEmail.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      subMsg.textContent = "Masukkan alamat email yang valid.";
      subEmail.setAttribute("aria-invalid", "true");
      subEmail.focus();
      return;
    }
    subEmail.removeAttribute("aria-invalid");
    subMsg.textContent = "Aplikasi email Anda akan terbuka untuk mengirim permintaan ini.";
    const subject = encodeURIComponent("Berlangganan pembaruan fitur & layanan Antigravity");
    const body = encodeURIComponent(`Mohon tambahkan email ${email} ke daftar pembaruan fitur dan layanan.`);
    window.location.href = `mailto:support@platform.id?subject=${subject}&body=${body}`;
    subForm.reset();
  });

  /* ── WIB clock ──────────────────────────────────────────── */
  const clock = $("#clock");
  if (clock) {
  const clockFmt = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const tick = () => {
    const now = new Date();
    clock.textContent = clockFmt.format(now).replace(/\./g, ":");
    clock.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 1000);
  }
})();
