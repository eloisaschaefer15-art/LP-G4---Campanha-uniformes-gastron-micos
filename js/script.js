/* =====================================================================
   G4 Uniformes · LP Fim de Ano: Bares e Restaurantes 2026
   JS puro, sem bibliotecas. Ver README.md para trocar número, data e textos.
   ===================================================================== */

/* ---------- 1. CONFIG ---------- */
const CONFIG = {
  whatsappNumber: "55XXXXXXXXXXX", // TODO: número do WhatsApp Business da campanha (só dígitos, com 55 + DDD)
  deadline: "2026-10-15T23:59:59-03:00", // fim da prioridade de produção (horário de Brasília)
  afterDeadline: "message", // depois do prazo: "message" (troca o texto da barra) ou "hide" (esconde a barra)
  baseMessage: "Olá! Vim da campanha de uniformes para bares e restaurantes",
  channels: { // ?c=ig → "(via Instagram)" etc.
    ig: "Instagram",
    tt: "TikTok",
    li: "LinkedIn",
    ads: "Anúncio",
    qr: "Material impresso",
    abrasel: "Abrasel",
  },
  heroInterval: 6000, // ms entre slides do hero
};

(function () {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const prefersReduced = () => reducedMotion.matches;

  /* ---------- 2. Canal (?c=) + sessionStorage ---------- */
  function getChannel() {
    let code = null;
    try {
      code = new URLSearchParams(window.location.search).get("c");
    } catch (e) { /* URL inválida: ignora */ }

    if (code && Object.prototype.hasOwnProperty.call(CONFIG.channels, code)) {
      try { sessionStorage.setItem("g4_channel", code); } catch (e) { /* storage bloqueado */ }
      return code;
    }
    try {
      const saved = sessionStorage.getItem("g4_channel");
      if (saved && Object.prototype.hasOwnProperty.call(CONFIG.channels, saved)) return saved;
    } catch (e) { /* storage bloqueado */ }
    return null;
  }

  /* ---------- 3. Função única do WhatsApp ---------- */
  function buildWhatsAppUrl() {
    const channel = getChannel();
    let message = CONFIG.baseMessage;
    if (channel) message += " (via " + CONFIG.channels[channel] + ")";
    return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
  }

  function applyWhatsAppLinks() {
    const url = buildWhatsAppUrl();
    document.querySelectorAll("[data-wa]").forEach((a) => {
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  /* ---------- 4. Contador (barra + seção 7, um único setInterval) ---------- */
  function initCountdown() {
    const deadline = new Date(CONFIG.deadline).getTime();
    const countbar = document.getElementById("countbar");
    const finalSection = document.getElementById("cta-final");
    const pad = (n) => String(n).padStart(2, "0");
    let timer = null;

    function expire() {
      if (timer) clearInterval(timer);
      if (CONFIG.afterDeadline === "hide") {
        countbar.hidden = true;
      } else {
        countbar.querySelectorAll("[data-deadline-text], [data-countdown]").forEach((el) => { el.hidden = true; });
        countbar.querySelector("[data-after-text]").hidden = false;
      }
      if (finalSection) finalSection.classList.add("is-expired");
      updateHeaderHeight();
    }

    function tick() {
      // Diferença em ms entre agora e o prazo. Date.now() é UTC e o deadline tem offset -03:00,
      // então o cálculo é correto em qualquer fuso do visitante.
      const diff = deadline - Date.now();
      if (diff <= 0) { expire(); return; }

      const total = Math.floor(diff / 1000);
      const values = {
        d: Math.floor(total / 86400),
        h: Math.floor((total % 86400) / 3600),
        m: Math.floor((total % 3600) / 60),
        s: total % 60,
      };
      document.querySelectorAll("[data-cd]").forEach((el) => {
        el.textContent = pad(values[el.dataset.cd]);
      });
    }

    tick();
    if (Date.now() < deadline) timer = setInterval(tick, 1000);
  }

  /* ---------- 5. Menu: altura, item ativo, painel mobile ---------- */
  const topbar = document.getElementById("topbar");

  // A altura do menu vem do CSS (--nav-h / --nav-h-scrolled). Aqui só medimos a barra de
  // contagem, que pode quebrar linha ou sumir depois do prazo.
  function updateHeaderHeight() {
    const bar = document.getElementById("countbar");
    const h = bar && !bar.hidden ? bar.offsetHeight : 0;
    root.style.setProperty("--countbar-h", h + "px");
  }

  function initNav() {
    const toggle = topbar.querySelector(".nav__toggle");
    const panel = document.getElementById("menu-mobile");
    const navLinks = document.querySelectorAll("[data-nav]");

    // Encolhe ao rolar
    let scrolled = null;
    function onScroll() {
      const isScrolled = window.scrollY > 24;
      if (isScrolled !== scrolled) {
        scrolled = isScrolled;
        topbar.classList.toggle("is-scrolled", isScrolled);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    // Painel mobile
    function openMenu() {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      document.body.classList.add("menu-open");
      const first = panel.querySelector("a");
      if (first) first.focus();
    }
    function closeMenu(returnFocus) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      document.body.classList.remove("menu-open");
      if (returnFocus) toggle.focus();
    }
    toggle.addEventListener("click", () => {
      if (panel.hidden) openMenu(); else closeMenu(false);
    });
    panel.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) closeMenu(true);
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (mq) => {
      if (mq.matches && !panel.hidden) closeMenu(false);
    });

    // Item ativo conforme a seção visível
    const ids = ["inicio", "produtos", "diferenciais", "clientes", "como-funciona"];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const setActive = (id) => {
      navLinks.forEach((a) => {
        const on = a.getAttribute("href") === "#" + id;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- 6. Observer genérico de animações ---------- */
  function splitLines(el) {
    // Quebra o título em palavras, agrupa por linha visual e aplica máscara por linha.
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map((w) => '<span class="line-mask" aria-hidden="true"><span class="line-inner">' + w + "</span></span>").join(" ");
    let line = -1;
    let lastTop = null;
    el.querySelectorAll(".line-mask").forEach((mask) => {
      const top = mask.offsetTop;
      if (top !== lastTop) { line += 1; lastTop = top; }
      mask.firstChild.style.setProperty("--line", line);
    });
  }

  function countUp(el) {
    const target = parseInt(el.dataset.countTo, 10);
    if (isNaN(target)) return;
    if (prefersReduced()) { el.textContent = target; return; }
    const duration = 1200;
    const start = performance.now();
    el.textContent = "0";
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]:not([data-reveal='words'])");
    const counters = document.querySelectorAll("[data-count-to]");

    items.forEach((el) => {
      const delay = el.dataset.revealDelay;
      if (delay) el.style.setProperty("--delay", delay + "ms");
      if (el.dataset.reveal === "line" && !prefersReduced()) splitLines(el);
    });

    if (prefersReduced() || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return; // contadores ficam no valor final do HTML
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target); // anima uma vez só
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    items.forEach((el) => io.observe(el));

    const ioCount = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => ioCount.observe(el));
  }

  /* ---------- 7. Carrossel do hero ---------- */
  function isSlowConnection() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return false;
    return Boolean(c.saveData) || /(^|-)2g$|^3g$/.test(c.effectiveType || "");
  }

  function initHero() {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    // Conexão lenta ou reduced-motion: só o poster.
    if (prefersReduced() || isSlowConnection()) return;

    const poster = hero.querySelector(".hero__slide--poster");
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) return;

    // Carrega os assets dos slides
    slides.forEach((slide) => {
      const media = slide.querySelector("[data-src]");
      if (!media) return;
      media.src = media.dataset.src;
      media.removeAttribute("data-src");
    });

    const video = hero.querySelector("video");
    let index = -1;
    let timer = null;

    function show(i) {
      slides.forEach((s, n) => {
        const on = n === i;
        s.classList.toggle("is-active", on);
        // Reinicia o Ken Burns da foto que entra
        const img = s.querySelector("img");
        if (on && img) { img.style.animation = "none"; void img.offsetWidth; img.style.animation = ""; }
      });
      if (video) {
        if (slides[i].contains(video)) {
          video.currentTime = 0;
          const p = video.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          video.pause();
        }
      }
      index = i;
    }

    function next() { show((index + 1) % slides.length); }

    // Vídeo é o primeiro slide; o poster sai quando ele começa.
    show(0);
    setTimeout(() => poster.classList.remove("is-active"), 50);
    timer = setInterval(next, CONFIG.heroInterval);

    // Pausa quando o hero sai da tela ou a aba fica oculta
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!timer) timer = setInterval(next, CONFIG.heroInterval);
      } else {
        clearInterval(timer); timer = null;
        if (video) video.pause();
      }
    });
    io.observe(hero);
  }

  /* ---------- 8. Tabs de produtos ---------- */
  function initTabs() {
    const tablist = document.querySelector("[role='tablist']");
    if (!tablist) return;
    const tabs = Array.from(tablist.querySelectorAll("[role='tab']"));
    const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));

    function select(i, focus) {
      tabs.forEach((t, n) => {
        const on = n === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        panels[n].hidden = !on;
      });
      const panel = panels[i];
      panel.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
      const list = panel.querySelector(".cards");
      if (list) list.scrollLeft = 0;
      if (focus) tabs[i].focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(i, false));
      tab.addEventListener("keydown", (e) => {
        let to = null;
        if (e.key === "ArrowRight") to = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") to = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") to = 0;
        if (e.key === "End") to = tabs.length - 1;
        if (to !== null) { e.preventDefault(); select(to, true); }
      });
    });

    // Swipe no mobile: troca de aba quando o carrossel já está na borda.
    panels.forEach((panel, i) => {
      const list = panel.querySelector(".cards");
      let x0 = null, y0 = null, atStart = false, atEnd = false;
      panel.addEventListener("touchstart", (e) => {
        x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
        atStart = !list || list.scrollLeft <= 2;
        atEnd = !list || list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
      }, { passive: true });
      panel.addEventListener("touchend", (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        const dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0 && atEnd && i < tabs.length - 1) select(i + 1, false);
        if (dx > 0 && atStart && i > 0) select(i - 1, false);
      }, { passive: true });
    });
  }

  /* ---------- 9. Letreiro de logos ---------- */
  function initMarquee() {
    const marquee = document.querySelector("[data-marquee]");
    if (!marquee) return;
    const track = marquee.querySelector(".marquee__track");
    const inner = document.createElement("div");
    inner.className = "marquee__inner";
    marquee.insertBefore(inner, track);
    inner.appendChild(track);
    // Cópia para o loop infinito: escondida de leitores de tela e fora da ordem de tabulação
    const clone = track.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((img) => { img.alt = ""; });
    inner.appendChild(clone);
  }

  /* ---------- 10. Animações ligadas ao scroll (seção 2 e seção 6) ---------- */
  function initScrollLinked() {
    const title = document.querySelector("[data-reveal='words']");
    const steps = document.querySelector("[data-steps]");
    const stepItems = steps ? Array.from(steps.querySelectorAll(".step")) : [];

    if (title) {
      title.innerHTML = title.textContent.trim().split(/\s+/).map((w) => '<span class="word">' + w + "</span>").join(" ");
    }
    const words = title ? Array.from(title.querySelectorAll(".word")) : [];

    if (prefersReduced()) {
      if (steps) steps.style.setProperty("--p", 1);
      stepItems.forEach((s) => s.classList.add("is-on"));
      return;
    }

    const clamp = (v) => Math.max(0, Math.min(1, v));
    let ticking = false;

    function update() {
      ticking = false;
      const vh = window.innerHeight;

      // Seção 2: cada palavra vai de 0,15 a 1 conforme o título atravessa a viewport
      if (title) {
        const r = title.getBoundingClientRect();
        // 0 quando o topo do título está a 90% da tela, 1 quando está a 35%
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.55));
        const n = words.length;
        words.forEach((w, i) => {
          const local = clamp(p * n - i);
          w.style.setProperty("--o", (0.15 + 0.85 * local).toFixed(3));
        });
      }

      // Seção 6: linha preenchida conforme a seção atravessa a viewport
      if (steps) {
        const r = steps.getBoundingClientRect();
        const p = clamp((vh * 0.75 - r.top) / (r.height || 1));
        steps.style.setProperty("--p", p.toFixed(3));
        const last = stepItems.length - 1;
        stepItems.forEach((s, i) => {
          s.classList.toggle("is-on", p >= (last ? i / last : 0) - 0.001 && p > 0);
        });
      }
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  /* ---------- 11. Botão flutuante ---------- */
  function initFloat() {
    const btn = document.getElementById("float-cta");
    const hero = document.getElementById("inicio");
    const final = document.getElementById("cta-final");
    if (!btn || !hero || !final) return;
    let heroVisible = true;
    let finalVisible = false;

    function render() {
      const show = !heroVisible && !finalVisible;
      btn.classList.toggle("is-visible", show);
      btn.setAttribute("aria-hidden", String(!show));
      btn.tabIndex = show ? 0 : -1;
      // No mobile, o CSS esconde o botão do menu enquanto o flutuante está visível
      document.body.classList.toggle("float-on", show);
    }
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; render(); }).observe(hero);
    new IntersectionObserver(([e]) => { finalVisible = e.isIntersecting; render(); }).observe(final);
  }

  /* ---------- Início ----------
     (Placeholders de assets ausentes: tratados pelo listener de "error" no <head>.) */
  applyWhatsAppLinks();
  initCountdown();
  initNav();
  initMarquee();
  initReveal();
  initHero();
  initTabs();
  initScrollLinked();
  initFloat();
})();
