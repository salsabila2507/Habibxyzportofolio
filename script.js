/* ============================================================
   HABIB_XYZ — Web3 Growth Strategist · interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     1. DRIFTING PARTICLES (very subtle — depth, not decoration)
     ========================================================== */
  var canvas = document.getElementById("petal-canvas");
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1;

  var COLORS = ["#b9a3ff", "#c9a44c", "#ffffff", "#3fbf95"];
  var dots = [];

  function makeDot(y) {
    return {
      x: Math.random() * W,
      y: y === undefined ? -10 - Math.random() * H * 0.6 : y,
      r: 0.7 + Math.random() * 1.5,
      sp: 0.12 + Math.random() * 0.34,
      dx: (Math.random() - 0.5) * 0.22,
      ph: Math.random() * Math.PI * 2,
      a: 0.10 + Math.random() * 0.28,
      c: COLORS[(Math.random() * COLORS.length) | 0]
    };
  }

  function seed() {
    dots = [];
    var n = Math.max(14, Math.round(window.innerWidth / 110));
    for (var i = 0; i < n; i++) dots.push(makeDot(Math.random() * H));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.y -= d.sp;
      d.x += d.dx + Math.sin(d.y * 0.008 + d.ph) * 0.16;

      if (d.y < -12) dots[i] = makeDot(H + 12);
      if (d.x < -12) d.x = W + 10;
      if (d.x > W + 12) d.x = -10;

      ctx.globalAlpha = d.a;
      ctx.fillStyle = d.c;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    window.requestAnimationFrame(frame);
  }

  resize();
  seed();
  if (reduceMotion) ctx.clearRect(0, 0, W, H);
  else frame();

  /* ==========================================================
     2. SCROLL REVEAL
     ========================================================== */
  var revealTargets = document.querySelectorAll(
    ".work-card, .card, .svc, .stack-col, .pull, .contact-card, .sec-head, .portrait, .metrics"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  function show(el) {
    el.classList.add("is-visible");
    /* fail-safe: never leave content invisible if the entrance
       animation is dropped by the renderer */
    window.setTimeout(function () {
      if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
        el.classList.add("reveal-done");
      }
    }, 1400);
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        ro.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    revealTargets.forEach(function (el, i) {
      el.style.animationDelay = (i % 4) * 60 + "ms";
      ro.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible", "reveal-done");
    });
  }

  /* ==========================================================
     3. COUNTERS
     ========================================================== */
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    var dur = 1500;

    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
      else el.textContent = fmt(target) + suffix;
    }
    window.requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (reduceMotion) {
          el.textContent = fmt(parseFloat(el.getAttribute("data-count"))) +
            (el.getAttribute("data-suffix") || "");
        } else {
          countUp(el);
        }
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ==========================================================
     4. ACTIVE NAV
     ========================================================== */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) {
          var on = a.getAttribute("href") === id;
          a.style.color = on ? "var(--text)" : "";
          a.style.background = on ? "rgba(230,220,255,.06)" : "";
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { no.observe(s); });
  }

  /* ==========================================================
     5. RESIZE
     ========================================================== */
  var rt = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(rt);
    rt = window.setTimeout(function () {
      resize();
      seed();
    }, 160);
  });

  /* ==========================================================
     6. FOOTER YEAR
     ========================================================== */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
