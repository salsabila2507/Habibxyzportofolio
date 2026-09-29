/* ============================================================
   HABIB_XYZ — Demon Slayer portfolio interactions
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     1. FALLING PETALS (wisteria-sakura style)
     ========================================================== */
  var canvas = document.getElementById("petal-canvas");
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  var rafId = null;

  var COLORS = ["#c9a6f5", "#e3cdf9", "#f0a500", "#ffd45e", "#8ff0dc", "#ffffff"];
  var petals = [];

  function seed() {
    petals = [];
    var n = Math.max(18, Math.round(window.innerWidth / 70));
    for (var i = 0; i < n; i++) {
      petals.push(makePetal(Math.random() * H));
    }
  }

  function makePetal(startY) {
    return {
      x: Math.random() * W,
      y: startY === undefined ? -20 - Math.random() * H : startY,
      r: 3 + Math.random() * 5,
      sp: 0.35 + Math.random() * 0.9,
      drift: (Math.random() - 0.5) * 0.5,
      sway: 0.6 + Math.random() * 1.4,
      ph: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      a: 0.25 + Math.random() * 0.5,
      c: COLORS[(Math.random() * COLORS.length) | 0]
    };
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

  function petalPath(p) {
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.quadraticCurveTo(p.r * 0.95, -p.r * 0.35, 0, p.r);
    ctx.quadraticCurveTo(-p.r * 0.95, -p.r * 0.35, 0, -p.r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < petals.length; i++) {
      var p = petals[i];
      p.y += p.sp;
      p.x += p.drift + Math.sin(p.y * 0.012 + p.ph) * p.sway;
      p.rot += p.vr;

      if (p.y > H + 24) petals[i] = makePetal(-20 - Math.random() * 80);
      if (p.x < -30) p.x = W + 20;
      if (p.x > W + 30) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.a;
      ctx.fillStyle = p.c;
      ctx.shadowColor = p.c;
      ctx.shadowBlur = 6;
      petalPath(p);
      ctx.fill();
      ctx.restore();
    }

    rafId = window.requestAnimationFrame(draw);
  }

  resize();
  seed();
  if (!reduceMotion) draw();
  else ctx.clearRect(0, 0, W, H);

  /* ==========================================================
     2. SCROLL REVEAL
     ========================================================== */
  var revealTargets = document.querySelectorAll(
    ".card, .tech, .stat, .contact-card, .slayer-note, .kokyu-col, .quote, .section-title, .section-sub, .slayer-card, .blade"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  function show(el) {
    el.classList.add("is-visible");
    window.setTimeout(function () {
      if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
        el.classList.add("reveal-done");
      }
    }, 1500);
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        ro.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });

    revealTargets.forEach(function (el, i) {
      el.style.animationDelay = (i % 3) * 90 + "ms";
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
    var dur = 1600;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
      else el.textContent = fmt(target) + suffix;
    }
    window.requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (reduceMotion) {
          el.textContent =
            fmt(parseFloat(el.getAttribute("data-count"))) +
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
     4. PARALLAX — slash divider + moon react to scroll
     ========================================================== */
  if (!reduceMotion) {
    var divider = document.querySelector(".slash-divider");
    var moon = document.querySelector(".moon");
    var aura = document.querySelector(".aura");
    var ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        if (divider) divider.style.transform = "translateY(" + (y * 0.06) + "px)";
        if (moon) moon.style.marginTop = (y * 0.05) + "px";
        if (aura) aura.style.transform = "translateY(" + (y * 0.03) + "px)";
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ==========================================================
     5. TILT on the slayer card (pointer devices)
     ========================================================== */
  var card = document.querySelector(".slayer-card");
  if (card && !reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    var wrap = document.querySelector(".hero-visual");
    var idle = null;

    wrap.addEventListener("mousemove", function (e) {
      if (idle) { window.clearTimeout(idle); idle = null; }
      var r = wrap.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      card.style.animation = "none";
      card.style.transform =
        "perspective(1100px) rotateY(" + dx * 16 + "deg) rotateX(" + -dy * 16 + "deg) rotate(-1deg)";
    });

    wrap.addEventListener("mouseleave", function () {
      idle = window.setTimeout(function () {
        card.style.transform = "";
        card.style.animation = "";
      }, 60);
    });
  }

  /* ==========================================================
     6. TYPEWRITER
     ========================================================== */
  var tw = document.querySelector("[data-typewriter]");
  if (tw && !reduceMotion) {
    var words = tw.getAttribute("data-typewriter").split("|");
    var w = 0, c = 0, deleting = false;

    (function type() {
      var word = words[w];
      tw.textContent = word.slice(0, c);

      if (!deleting && c < word.length) {
        c++;
        window.setTimeout(type, 90);
      } else if (!deleting && c === word.length) {
        deleting = true;
        window.setTimeout(type, 1500);
      } else if (deleting && c > 0) {
        c--;
        window.setTimeout(type, 45);
      } else {
        deleting = false;
        w = (w + 1) % words.length;
        window.setTimeout(type, 320);
      }
    })();
  }

  /* ==========================================================
     7. ACTIVE NAV HIGHLIGHT
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
          a.style.color = a.getAttribute("href") === id ? "#fff" : "";
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { no.observe(s); });
  }

  /* ==========================================================
     8. RESIZE
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
     9. FOOTER YEAR
     ========================================================== */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
