(function () {
  "use strict";

  /* ---------- Random accent color (per page load) ---------- */
  (function setRandomAccent() {
    var root = document.documentElement;
    var h = Math.floor(Math.random() * 360);
    root.style.setProperty("--accent", "hsl(" + h + ", 72%, 56%)");
    root.style.setProperty("--accent-soft", "hsla(" + h + ", 72%, 56%, 0.12)");
    root.style.setProperty("--accent-glow", "hsla(" + h + ", 72%, 56%, 0.45)");
  })();

  /* ---------- Modal ---------- */
  var backdrop = document.getElementById("modal");
  var modalTitle = document.getElementById("modal-title");
  var modalBody = document.getElementById("modal-body");
  var lastFocused = null;
  var currentKey = null;

  var templates = {
    about: "tpl-about",
    cv: "tpl-cv",
    projects: "tpl-projects",
    contact: "tpl-contact",
    privacy: "tpl-privacy",
    work: "tpl-work"
  };

  var titles = {
    about: "About",
    cv: "Curriculum Vitae",
    projects: "Projects & Publications",
    contact: "Contact",
    privacy: "Privacy & Cookies",
    work: "Work with me"
  };

  function showSkeleton() {
    modalBody.innerHTML = "";
    ["lg", "", "sm", "", "", "sm", "", ""].forEach(function (s) {
      var b = document.createElement("div");
      b.className = "skeleton-block" + (s ? " " + s : "");
      modalBody.appendChild(b);
    });
  }

  function fillFromTemplate(id) {
    var tpl = document.getElementById(id);
    if (!tpl) return;
    modalBody.innerHTML = "";
    modalBody.appendChild(tpl.content.cloneNode(true));
    initCvToggle();
  }

  function openModal(key) {
    if (!templates[key]) return;
    currentKey = key;
    lastFocused = document.activeElement;
    modalTitle.textContent = titles[key] || "";
    backdrop.className = "modal-backdrop modal-" + key;
    showSkeleton();
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var closeBtn = backdrop.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();

    setTimeout(function () {
      fillFromTemplate(templates[key]);
    }, 400);
  }

  function closeModal() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentKey = null;
    if (lastFocused) lastFocused.focus();
    setTimeout(function () {
      if (!backdrop.classList.contains("open")) modalBody.innerHTML = "";
    }, 260);
  }

  function initCvToggle() {
    var toggle = modalBody.querySelector("[data-lang-toggle]");
    if (!toggle) return;
    var en = modalBody.querySelector("[data-lang-content=en]");
    var it = modalBody.querySelector("[data-lang-content=it]");
    var btns = toggle.querySelectorAll("button");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var lang = btn.getAttribute("data-lang");
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        if (en) en.hidden = lang !== "en";
        if (it) it.hidden = lang !== "it";
      });
    });
  }

  if (backdrop) {
    document.addEventListener("click", function (e) {
      var el = e.target.closest("[data-modal]");
      if (!el) return;
      e.preventDefault();
      openModal(el.getAttribute("data-modal"));
    });
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop || e.target.classList.contains("modal-close") ||
          e.target.closest(".modal-close")) {
        closeModal();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && backdrop.classList.contains("open")) closeModal();
    });
  }

  /* ---------- Typewriter ---------- */
  function typewriter(el, speed) {
    if (!el) return;
    var text = el.dataset.tw || el.textContent;
    text = text.replace(/\s+/g, " ").trim();
    el.dataset.tw = text;
    el.textContent = "";
    var cur = document.createElement("span");
    cur.className = "tw-cursor";
    el.appendChild(cur);
    var i = 0;
    (function step() {
      if (i < text.length) {
        cur.insertAdjacentText("beforebegin", text.charAt(i));
        i++;
        setTimeout(step, speed);
      } else {
        setTimeout(function () { cur.remove(); }, 700);
      }
    })();
  }

  /* ---------- Full-screen random tile mosaic (BSP) ---------- */
  function layoutTiles() {
    var grid = document.querySelector(".tile-grid");
    if (!grid) return;
    var tiles = Array.prototype.slice.call(grid.querySelectorAll(".tile"));
    if (tiles.length < 2) return;

    var cols = Math.min(14, Math.max(5, Math.round(window.innerWidth / 150)));
    var rows = Math.min(9, Math.max(4, Math.round((window.innerHeight - 30) / 150)));
    grid.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + rows + ", 1fr)";

    function canSplit(l) { return l.w >= 2 || l.h >= 2; }
    function aspect(w, h) { return Math.max(w, h) / Math.min(w, h); }
    function split(l) {
      // choose the orientation whose children are the most square
      var ratio = 0.3 + Math.random() * 0.4; // varied 0.3..0.7 -> dramatic sizes
      var canV = l.w >= 2, canH = l.h >= 2, best = null, bestMax = Infinity;
      if (canV) {
        var w1 = Math.round(l.w * ratio);
        if (w1 < 1) w1 = 1; if (w1 > l.w - 1) w1 = l.w - 1;
        var va = Math.max(aspect(w1, l.h), aspect(l.w - w1, l.h));
        if (va < bestMax) { bestMax = va; best = [{ x: l.x, y: l.y, w: w1, h: l.h }, { x: l.x + w1, y: l.y, w: l.w - w1, h: l.h }]; }
      }
      if (canH) {
        var h1 = Math.round(l.h * ratio);
        if (h1 < 1) h1 = 1; if (h1 > l.h - 1) h1 = l.h - 1;
        var ha = Math.max(aspect(l.w, h1), aspect(l.w, l.h - h1));
        if (ha < bestMax) { best = [{ x: l.x, y: l.y, w: l.w, h: h1 }, { x: l.x, y: l.y + h1, w: l.w, h: l.h - h1 }]; }
      }
      return best;
    }
    function pickLeaf(leaves) {
      var splittable = leaves.filter(canSplit);
      if (!splittable.length) return null;
      // Usually split the largest (keeps filling the screen), but often pick a
      // random leaf instead -> dramatic variety (big feature tiles + small ones).
      if (Math.random() < 0.55) {
        var best = null, ba = -1;
        splittable.forEach(function (l) {
          var a = l.w * l.h;
          if (a > ba) { ba = a; best = l; }
        });
        return best;
      }
      return splittable[Math.floor(Math.random() * splittable.length)];
    }

    // Profile tile: fixed full-height column pinned to the left edge (2/3 of prior width).
    var baseW = cols >= 10 ? 3 : 2;
    var leftW = Math.max(2, Math.round(baseW * 2 / 3));
    if (leftW > cols - 2) leftW = Math.max(2, cols - 2); // keep room for the rest
    var profileLeaf = { x: 0, y: 0, w: leftW, h: rows };

    // Balanced BSP over the remaining right-hand area into exactly
    // (tiles.length - 1) leaves, then assign to the other tiles.
    var leaves = [{ x: leftW, y: 0, w: cols - leftW, h: rows }];
    var guard = 0;
    while (leaves.length < tiles.length - 1 && guard < 400) {
      var t = pickLeaf(leaves);
      if (!t) break;
      var parts = split(t);
      if (!parts) break;
      leaves.splice(leaves.indexOf(t), 1);
      leaves.push(parts[0], parts[1]);
      guard++;
    }
    if (leaves.length !== tiles.length - 1) return; // safety: keep CSS fallback

    var restLeaves = leaves;

    for (var i = restLeaves.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = restLeaves[i]; restLeaves[i] = restLeaves[j]; restLeaves[j] = tmp;
    }
    tiles.forEach(function (tile, idx) {
      var leaf = idx === 0 ? profileLeaf : restLeaves[idx - 1];
      tile.style.gridColumn = (leaf.x + 1) + " / " + (leaf.x + leaf.w + 1);
      tile.style.gridRow = (leaf.y + 1) + " / " + (leaf.y + leaf.h + 1);
    });
  }

  /* ---------- Boot sequence ---------- */
  var bootLines = [
    "carletti.work BIOS v1.0",
    "MOUNTING /assets ... [OK]",
    "LOADING PROFILE [M. Carletti] ... [OK]",
    "ESTABLISHING UPLINK ... [OK]",
    "SYSTEM READY"
  ];

  function typeInto(el, text, speed, cb) {
    var i = 0;
    var cur = document.createElement("span");
    cur.className = "tw-cursor";
    el.appendChild(cur);
    (function step() {
      if (i < text.length) {
        cur.insertAdjacentText("beforebegin", text.charAt(i));
        i++;
        setTimeout(step, speed);
      } else {
        cur.remove();
        if (cb) cb();
      }
    })();
  }

  function runBoot(done) {
    var boot = document.getElementById("boot");
    var log = document.getElementById("boot-log");
    var fill = document.getElementById("boot-fill");
    var status = document.getElementById("boot-status");
    if (!boot || !log) { document.body.classList.add("booted"); done(); return; }

    var i = 0;
    function next() {
      if (i >= bootLines.length) {
        if (status) status.textContent = "READY";
        setTimeout(function () {
          boot.classList.add("done");
          document.body.classList.add("booted");
          done();
        }, 200);
        return;
      }
      var raw = bootLines[i];
      var lineEl = document.createElement("div");
      lineEl.className = "boot-line";
      log.appendChild(lineEl);
      if (status) status.textContent = "LOADING " + (i + 1) + "/" + bootLines.length;
      typeInto(lineEl, raw, 6, function () {
        lineEl.innerHTML = raw.replace(/\[OK\]/g, '<span class="ok">[OK]</span>');
        i++;
        if (fill) fill.style.width = Math.round((i / bootLines.length) * 100) + "%";
        setTimeout(next, 40);
      });
    }
    next();
  }

  /* ---------- Init ---------- */
  function afterBoot() {
    var hero = document.querySelector(".tile-profile .tile-desc");
    if (hero) typewriter(hero, 12);
    if (!backdrop) {
      var aboutP = document.querySelector("main p");
      if (aboutP) typewriter(aboutP, 12);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { layoutTiles(); runBoot(afterBoot); });
  } else {
    layoutTiles(); runBoot(afterBoot);
  }

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutTiles, 150);
  });
})();
