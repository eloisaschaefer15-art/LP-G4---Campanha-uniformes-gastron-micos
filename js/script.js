/* =====================================================================
   G4 Uniformes · LP Fim de Ano: Bares e Restaurantes 2026
   JS puro, sem bibliotecas. Ver README.md para trocar número, data e textos.
   ===================================================================== */

/* ---------- 1. CONFIG ---------- */
const CONFIG = {
  whatsappNumber: "554584133498", // WhatsApp G4 Uniformes Vendas: +55 45 8413-3498 (só dígitos, com 55 + DDD)
  deadline: "2026-10-31T23:59:59-03:00", // fim da prioridade de produção (horário de Brasília)
  afterDeadline: "message", // depois do prazo: "message" (troca o texto da barra) ou "hide" (esconde a barra)
  baseMessage: "Olá! Vim pela campanha de uniformes gastronômicos da G4 e quero um orçamento para a minha equipe.",
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
  // Compartilhado entre o ícone G4 (posição-base) e o laço de rolagem (animação em cima da base)
  const MARKS = new Map();
  let requestMotion = null;
  function writeMark(section, k, py) {
    const m = MARKS.get(section);
    if (!m) return;
    const s = m.s * k;
    section.style.setProperty("--mk-size", (100 * s).toFixed(1) + "px");
    section.style.setProperty("--mk-x", (m.cx - (m.cx - m.x) * k).toFixed(1) + "px");
    section.style.setProperty("--mk-y", (m.cy - (m.cy - m.y) * k + py).toFixed(1) + "px");
  }

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
    if (channel) {
      // A origem entra antes da pontuação final: "…minha equipe (via Instagram)."
      const via = " (via " + CONFIG.channels[channel] + ")";
      const m = message.match(/^(.*?)([.!?]*)$/s);
      message = m[1] + via + m[2];
    }
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
    // divide só em espaços comuns: o &nbsp; de "a G4" mantém as duas palavras juntas
    const text = el.textContent.trim();
    const esc = (w) => w.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const words = text.split(/[ \t\n\r]+/);
    el.setAttribute("aria-label", text);
    el.innerHTML = words.map((w) => '<span class="line-mask" aria-hidden="true"><span class="line-inner">' + esc(w) + "</span></span>").join(" ");
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

    const video = hero.querySelector("video");
    const failed = new Set(); // slides cujo asset não carregou (ex.: vídeo ainda não enviado)
    let index = -1;
    let timer = null;
    let posterOn = true;

    function stop() { clearInterval(timer); timer = null; if (video) video.pause(); }

    // Mostra o poster (versão fixa) e para o carrossel quando não sobra nenhum slide válido.
    function fallbackToPoster() {
      stop();
      slides.forEach((s) => s.classList.remove("is-active"));
      poster.classList.add("is-active");
      posterOn = true;
    }

    function hidePoster() {
      if (!posterOn) return;
      posterOn = false;
      poster.classList.remove("is-active");
    }

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
      // O poster só sai quando o slide ativo já tem imagem/vídeo pronto (evita piscar placeholder)
      const media = slides[i].querySelector("img, video");
      const ready = media && (media.tagName === "VIDEO" ? media.readyState >= 2 : media.complete && media.naturalWidth > 0);
      if (ready) hidePoster();
    }

    // Próximo slide válido, pulando os que falharam
    function next() {
      for (let step = 1; step <= slides.length; step++) {
        const i = (index + step) % slides.length;
        if (!failed.has(slides[i])) { show(i); return; }
      }
      fallbackToPoster();
    }

    // Carrega os assets dos slides (listeners antes do src, para não perder o evento)
    slides.forEach((slide) => {
      const media = slide.querySelector("[data-src]");
      if (!media) return;
      media.addEventListener(media.tagName === "VIDEO" ? "loadeddata" : "load", () => {
        if (slides[index] === slide) hidePoster();
      });
      media.addEventListener("error", () => {
        failed.add(slide);
        slide.classList.remove("is-active");
        if (slides[index] === slide) next();
      });
      media.src = media.dataset.src;
      media.removeAttribute("data-src");
    });

    // Vídeo é o primeiro slide; se ele não existir, o carrossel começa pela primeira foto.
    show(0);
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
    // Com reduced-motion o letreiro vira grade estática: nada de cópias.
    if (prefersReduced()) return;

    const track = marquee.querySelector(".marquee__track");
    const originals = Array.from(track.children);
    const inner = document.createElement("div");
    inner.className = "marquee__inner";
    marquee.insertBefore(inner, track);
    inner.appendChild(track);

    const SPEED = 40; // px por segundo

    // Cópias decorativas: escondidas de leitores de tela e sem alt duplicado
    const decorative = (node) => {
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("data-marquee-copy", "");
      node.querySelectorAll("img").forEach((img) => { img.alt = ""; });
      return node;
    };

    let builtFor = 0;
    function build() {
      const minWidth = marquee.clientWidth;
      if (!minWidth || minWidth === builtFor) return;
      builtFor = minWidth;
      inner.querySelectorAll("[data-marquee-copy]").forEach((n) => n.remove());

      // 1) Repete os nomes dentro da volta até ela ser pelo menos tão larga quanto a tela.
      //    Sem isso, com poucos clientes sobrava um vão em branco antes do loop recomeçar.
      for (let guard = 0; track.getBoundingClientRect().width < minWidth && guard < 20; guard++) {
        originals.forEach((li) => track.appendChild(decorative(li.cloneNode(true))));
      }
      // 2) Segunda volta idêntica: a animação anda -50% e emenda sem salto.
      inner.appendChild(decorative(track.cloneNode(true)));

      inner.style.setProperty("--marquee-dur", (track.getBoundingClientRect().width / SPEED).toFixed(1) + "s");
    }

    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { builtFor = 0; build(); });
    // A largura da volta muda quando um logo SVG falha e vira nome em texto (ou quando o SVG chega).
    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        const w = track.getBoundingClientRect().width;
        if (w < marquee.clientWidth) { builtFor = 0; build(); }
        else inner.style.setProperty("--marquee-dur", (w / SPEED).toFixed(1) + "s");
      }).observe(track);
    }
    let resizeTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    });
  }

  /* ---------- 9b. Ícone G4 abraçando o conteúdo ----------
     Como no material de social media (feed e story): o símbolo é ampliado até o vazado do G
     envolver o bloco de conteúdo. HOLLOW é a área do vazado, em unidades do símbolo (0–100),
     medida no card "Semana do Cliente" (do título ao botão). Recalcula a cada largura de tela. */
  function initMark() {
    const HOLLOW = { x0: 44.0, y0: 50.6, x1: 71.8, y1: 76.6 };
    const targets = [
      // fit: 1 = o conteúdo cabe inteiro no vazado; < 1 = símbolo menor, as faixas encostam nas bordas
      // do conteúdo (como no card, em que a diagonal passa pelo canto dos blocos de oferta).
      // Se um bloco ficar largo e baixo demais, ajuste a diagramação (como na seção 7) antes de mexer no fit.
      { section: document.querySelector(".final"), content: () => Array.from(document.querySelectorAll(".final__inner > *")), fit: () => 1 },
      { section: document.querySelector(".diffs"), content: () => [document.querySelector(".diffs__list")], fit: () => 1 },
    ].filter((t) => t.section);
    if (!targets.length) return;

    // Posição de layout (ignora o deslocamento das animações de entrada)
    function layoutRect(el, ancestor) {
      let x = 0, y = 0, node = el;
      while (node && node !== ancestor) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
      return { x0: x, y0: y, x1: x + el.offsetWidth, y1: y + el.offsetHeight };
    }

    function place() {
      targets.forEach(({ section, content, fit }) => {
        const rects = content().filter((el) => el && el.offsetWidth && el.offsetHeight).map((el) => layoutRect(el, section));
        if (!rects.length) return;
        const box = {
          x0: Math.min(...rects.map((r) => r.x0)), y0: Math.min(...rects.map((r) => r.y0)),
          x1: Math.max(...rects.map((r) => r.x1)), y1: Math.max(...rects.map((r) => r.y1)),
        };
        // escala: o conteúdo inteiro cabe no vazado
        const s = fit() * Math.max((box.x1 - box.x0) / (HOLLOW.x1 - HOLLOW.x0), (box.y1 - box.y0) / (HOLLOW.y1 - HOLLOW.y0));
        // centro do vazado sobre o centro do conteúdo
        const x = (box.x0 + box.x1) / 2 - ((HOLLOW.x0 + HOLLOW.x1) / 2) * s;
        const y = (box.y0 + box.y1) / 2 - ((HOLLOW.y0 + HOLLOW.y1) / 2) * s;
        MARKS.set(section, { s, x, y, cx: (box.x0 + box.x1) / 2, cy: (box.y0 + box.y1) / 2 });
        writeMark(section, 1, 0);
      });
      if (requestMotion) requestMotion(); // reaplica a animação por cima da nova base
    }

    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener("load", place);
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(() => place());
      targets.forEach(({ section }) => ro.observe(section));
    } else {
      window.addEventListener("resize", place);
    }
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
        // 0 quando o topo do título está a 90% da tela, 1 quando está a 55%
        // (termina antes de o leitor chegar ao fim da frase; antes ficava apagado até 35%)
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.35));
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

  /* ---------- 10b. Rolagem interativa (página toda) ----------
     Um único requestAnimationFrame, só transform/opacity/clip-path. Com reduced-motion fica só a barra.
     - Barra de progresso da leitura embaixo do menu
     - Hero: a foto em tela cheia encolhe até virar card arredondado; foto mais lenta; texto sobe e esmaece
     - Prazo "30 dias": o número conta e a linha HOJE → 31/10 → DEZEMBRO se desenha com a rolagem
     - Produtos (desktop): colunas andam em velocidades diferentes
     - Ícone G4 (Diferenciais e seção 7): entra maior e se encaixa até abraçar o conteúdo no centro da tela
     - Fotos dos produtos deslizam dentro da caixa
     - Letreiro de clientes acelera com a rolagem e inverte ao subir */
  function initScrollMotion() {
    const root = document.documentElement;
    const hero = document.querySelector(".hero");
    const heroContent = document.querySelector(".hero__content");
    const spec = document.querySelector(".urgency__spec");
    const count = document.querySelector("[data-scroll-count]");
    const products = document.querySelector(".products");
    const photos = Array.from(document.querySelectorAll(".card__media img"));
    const motion = !prefersReduced();
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    let ticking = false;

    if (motion) root.classList.add("motion");

    function update() {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const vw = root.clientWidth;

      // progresso da leitura
      const max = root.scrollHeight - vh;
      root.style.setProperty("--sp", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
      if (!motion) return;

      // hero: encolhe até card arredondado, alinhado às margens do conteúdo
      if (hero) {
        const h = hero.offsetHeight;
        const p = clamp(y / (h * 0.85), 0, 1);
        const e = easeOut(p);
        const edge = heroContent ? heroContent.getBoundingClientRect().left + parseFloat(getComputedStyle(heroContent).paddingLeft) : 20;
        hero.style.setProperty("--hi", (e * edge).toFixed(1) + "px");
        hero.style.setProperty("--hb", (e * edge).toFixed(1) + "px");
        hero.style.setProperty("--hr", (e * 24).toFixed(1) + "px");
        hero.style.setProperty("--hero-py", (p * h * 0.3).toFixed(1) + "px");
        hero.style.setProperty("--hero-cy", (-p * 90).toFixed(1) + "px");
        hero.style.setProperty("--hero-o", clamp(1 - p * 1.2, 0, 1).toFixed(3));
      }

      // prazo "30 dias": conta e desenha a linha com a rolagem
      if (spec) {
        const r = spec.getBoundingClientRect();
        const p = clamp((vh * 0.9 - r.top) / (vh * 0.55), 0, 1);
        spec.style.setProperty("--tl", easeOut(p).toFixed(3));
        if (count) count.textContent = Math.round(30 * easeOut(p));
      }

      // produtos: colunas em velocidades diferentes (só desktop)
      if (products) {
        const r = products.getBoundingClientRect();
        const cards = products.querySelectorAll(".products__panel:not([hidden]) .card");
        if (vw >= 1024 && r.bottom > 0 && r.top < vh) {
          const off = clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1);
          cards.forEach((c, i) => c.style.setProperty("--cy", ((i % 2 ? 1 : -1) * off * 36).toFixed(1) + "px"));
        } else if (vw < 1024) {
          cards.forEach((c) => c.style.removeProperty("--cy"));
        }
      }

      // ícone G4: entra 30% maior e se encaixa (escala 1) quando a seção chega ao centro
      MARKS.forEach((m, sec) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const off = r.top + r.height / 2 - vh / 2;
        const fit = clamp(1 - Math.abs(off) / (vh * 0.75), 0, 1);
        writeMark(sec, 1 + 0.3 * (1 - easeOut(fit)), -off * 0.08);
      });

      // fotos dos produtos deslizam dentro da caixa
      photos.forEach((img) => {
        const box = img.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        const off = clamp((box.top + box.height / 2 - vh / 2) / vh, -1, 1);
        img.style.setProperty("--py", (-off * box.height * 0.035).toFixed(1) + "px");
      });
    }

    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }
    requestMotion = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    // letreiro: acelera com a velocidade da rolagem e inverte ao subir; volta ao normal sozinho
    const marqueeInner = document.querySelector(".marquee__inner");
    if (motion && marqueeInner && marqueeInner.getAnimations) {
      let lastY = window.scrollY, lastT = performance.now(), target = 1, rate = 1, running = false;
      const loop = () => {
        target += (1 - target) * 0.06;            // a "empurrada" da rolagem vai se dissipando
        rate += (target - rate) * 0.15;           // suaviza a mudança de velocidade
        const anim = marqueeInner.getAnimations()[0];
        if (anim) anim.playbackRate = rate;
        if (Math.abs(rate - 1) > 0.01 || Math.abs(target - 1) > 0.01) requestAnimationFrame(loop);
        else { if (anim) anim.playbackRate = 1; running = false; }
      };
      window.addEventListener("scroll", () => {
        const now = performance.now(), yy = window.scrollY;
        const v = (yy - lastY) / Math.max(1, now - lastT); // px por ms (negativo = subindo)
        lastY = yy; lastT = now;
        target = clamp(1 + v * 6, -5, 7);
        if (!running) { running = true; requestAnimationFrame(loop); }
      }, { passive: true });
    }
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
  initMark();
  initReveal();
  initHero();
  initTabs();
  initScrollLinked();
  initFloat();
  initScrollMotion();
})();
