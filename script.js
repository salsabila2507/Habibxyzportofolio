/* ============================================================
   HABIB_XYZ — Web3 Growth Strategist · interactions
   Theme: 21st.dev cosmic-night
   ============================================================ */
(function () {
  "use strict";

  var mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = mqMotion.matches;
  var finePointer = window.matchMedia("(pointer:fine)").matches;

  /* ==========================================================
     1. CURSOR SPOTLIGHT
     ========================================================== */
  if (finePointer && !reduce) {
    document.body.classList.add("has-pointer");
    var light = document.querySelector(".spotlight");
    var lightX = 0, lightY = 0, curX = 0, curY = 0, lightRaf = null;

    function lightLoop() {
      curX += (lightX - curX) * 0.12;
      curY += (lightY - curY) * 0.12;
      light.style.transform = "translate3d(" + curX + "px," + curY + "px,0)";
      lightRaf = requestAnimationFrame(lightLoop);
    }

    window.addEventListener("pointermove", function (e) {
      lightX = e.clientX;
      lightY = e.clientY;
      if (!lightRaf) lightLoop();
    }, { passive: true });
  }

  /* ==========================================================
     2. CARD SPOTLIGHT (radial follows cursor inside card)
     ========================================================== */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-spotlight]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
  }

  /* ==========================================================
     3. MAGNETIC BUTTONS
     ========================================================== */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var raf = null;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = "translate(" + dx * 7 + "px," + dy * 5 + "px)";
        });
      }, { passive: true });
      el.addEventListener("pointerleave", function () {
        if (raf) cancelAnimationFrame(raf);
        el.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(function () { el.style.transition = ""; }, 500);
      });
    });
  }

  /* ==========================================================
     4. SCROLL PROGRESS + STICKY NAV
     ========================================================== */
  var bar = document.querySelector("[data-progress]");
  var topbar = document.querySelector(".topbar");
  var scrollRaf = null;

  function onScrollFrame() {
    scrollRaf = null;
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + "%";
    if (topbar) topbar.classList.toggle("is-stuck", y > 8);

    /* portrait parallax */
    var portrait = document.querySelector(".portrait");
    if (portrait && y < window.innerHeight) {
      portrait.style.transform = "translateY(" + (y * 0.045) + "px)";
    }
  }

  window.addEventListener("scroll", function () {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(onScrollFrame);
  }, { passive: true });
  onScrollFrame();

  /* ==========================================================
     5. PORTRAIT TILT
     ========================================================== */
  var portraitEl = document.querySelector("[data-tilt]");
  if (portraitEl && finePointer && !reduce) {
    portraitEl.addEventListener("pointermove", function (e) {
      var r = portraitEl.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      portraitEl.style.transform =
        "translateY(" + (window.scrollY * 0.045) + "px) rotateY(" + dx * 7 + "deg) rotateX(" + -dy * 7 + "deg)";
    }, { passive: true });
    portraitEl.addEventListener("pointerleave", function () {
      portraitEl.style.transform = "translateY(" + (window.scrollY * 0.045) + "px)";
    });
  }

  /* ==========================================================
     6. REVEAL
     ========================================================== */
  var revealTargets = document.querySelectorAll(".reveal");
  revealTargets.forEach(function (el) {
    var d = el.getAttribute("data-d");
    if (d) el.style.setProperty("--rd", d * 80 + "ms");
  });

  function show(el) {
    el.classList.add("is-visible");
    setTimeout(function () {
      if (parseFloat(getComputedStyle(el).opacity) < 0.9) el.classList.add("reveal-done");
    }, 1400);
  }

  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        ro.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { ro.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible", "reveal-done"); });
  }

  /* ==========================================================
     7. COUNTERS + BARS
     ========================================================== */
  function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

  function runStat(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) {
      el.textContent = fmt(target) + suffix;
      return;
    }
    var start = null, dur = 1500;
    (function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target) + suffix;
    })(performance.now());
  }

  var stats = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runStat(entry.target);
        so.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    stats.forEach(function (s) { so.observe(s); });
  }

  var bars = document.querySelectorAll("[data-fill]");
  if ("IntersectionObserver" in window) {
    var bo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var v = entry.target.getAttribute("data-fill");
        if (reduce) { entry.target.style.width = v + "%"; }
        else { setTimeout(function () { entry.target.style.width = v + "%"; }, 150); }
        bo.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    bars.forEach(function (b) { bo.observe(b); });
  }

  /* ==========================================================
     8. NAV PILL + ACTIVE LINK
     ========================================================== */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var pill = document.querySelector("[data-pill]");

  function movePill(link) {
    if (!pill || !link) return;
    pill.style.opacity = "1";
    pill.style.width = link.offsetWidth + "px";
    pill.style.transform = "translateY(-50%) translateX(" + (link.offsetLeft) + "px)";
  }

  navLinks.forEach(function (a) {
    a.addEventListener("pointerenter", function () { movePill(a); }, { passive: true });
  });
  var nav = document.querySelector(".nav");
  if (nav) nav.addEventListener("pointerleave", function () {
    var cur = document.querySelector(".nav a.is-active");
    if (cur) movePill(cur); else pill.style.opacity = "0";
  });

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
          a.classList.toggle("is-active", on);
          if (on) movePill(a);
        });
      });
    }, { rootMargin: "-42% 0px -52% 0px" });
    sections.forEach(function (s) { no.observe(s); });
  }

  /* ==========================================================
     9. TYPEWRITER
     ========================================================== */
  var typer = document.querySelector("[data-typer]");
  if (typer) {
    var words = typer.getAttribute("data-typer").split("|");
    if (reduce) {
      typer.textContent = words[0];
    } else {
      var w = 0, c = 0, deleting = false;
      (function type() {
        var word = words[w];
        typer.textContent = word.slice(0, c);
        if (!deleting && c < word.length) {
          c++;
          setTimeout(type, 78);
        } else if (!deleting && c === word.length) {
          deleting = true;
          setTimeout(type, 1700);
        } else if (deleting && c > 0) {
          c--;
          setTimeout(type, 40);
        } else {
          deleting = false;
          w = (w + 1) % words.length;
          setTimeout(type, 340);
        }
      })();
    }
  }

  /* ==========================================================
     10. MARQUEE — duplicate content for a seamless loop
     ========================================================== */
  var track = document.querySelector("[data-marquee]");
  if (track) track.innerHTML = track.innerHTML + track.innerHTML;

  /* ==========================================================
     11. FOOTER YEAR
     ========================================================== */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
