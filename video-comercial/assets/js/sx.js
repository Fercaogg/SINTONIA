/* SINTONÍA · shared motion helpers (deterministic, no clock, no randomness). */
(function () {
  var NS = "http://www.w3.org/2000/svg";

  function wpath(c, a, wl, sh, x0, x1, step) {
    var d = "";
    for (var x = x0; x <= x1; x += step) {
      var y = c + a * Math.sin((2 * Math.PI * (x - sh)) / wl);
      d += (x === x0 ? "M" : "L") + x + " " + y.toFixed(1) + " ";
    }
    return d;
  }

  /* Reading holds: [point in the original 45 s cut, beats of hold added there].
     Moves keep their speed; only the still reading time grows. Every hold is a whole
     number of 0.5 s beats, so the 120 BPM grid stays intact. Total: 45 s → 60 s. */
  var HOLDS = [
    [6.5, 1.0], [9.0, 1.0], [11.0, 1.0], [12.5, 2.0], // datos
    [16.5, 1.0],                                      // reveal
    [21.5, 0.5], [24.5, 1.0], [27.5, 1.5],            // cómo funciona
    [30.5, 1.0], [34.5, 2.0],                         // confianza
    [36.5, 0.5], [39.5, 0.5],                         // perfiles
    [44.5, 2.0],                                      // cierre
  ];
  function M(t) {
    var s = t;
    for (var i = 0; i < HOLDS.length; i++) if (t >= HOLDS[i][0]) s += HOLDS[i][1];
    return s;
  }

  window.SX = {
    BEAT: 0.5,
    M: M, // original cut time → final time

    /* Scene clock: T0/D/g from the scene's window in the original cut. */
    scene: function (start, end) {
      var T0 = M(start);
      return { T0: T0, D: M(end) - T0, g: function (t) { return M(t) - T0; } };
    },
    wpath: wpath,

    /* Fill an <g> with n thin sine lines wide enough to be translated by `travel` px. */
    waves: function (g, o) {
      for (var i = 0; i < o.n; i++) {
        var p = document.createElementNS(NS, "path");
        p.setAttribute("d", wpath(o.y0 + i * o.gap, o.amp, o.wl, i * (o.shift || 60), -o.wl, 1920 + (o.travel || 0) + o.wl, 16));
        g.appendChild(p);
      }
    },

    /* Two parallax layers of waves drifting right→left for `dur` seconds. */
    driftLayers: function (tl, far, near, dur) {
      tl.fromTo(far, { x: 0 }, { x: -dur * 30, duration: dur, ease: "none" }, 0);
      tl.fromTo(near, { x: 0 }, { x: -dur * 66, duration: dur, ease: "none" }, 0);
      var cyc = 1.5, rep = Math.max(0, Math.floor(dur / cyc) - 1);
      tl.fromTo(near, { y: -10 }, { y: 10, duration: cyc, ease: "sine.inOut", yoyo: true, repeat: rep }, 0);
    },

    /* Split text into masked units. mode "w" = words, "c" = letters. Returns the animated spans. */
    split: function (el, mode) {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map(function (w) {
          if (mode === "c")
            return '<span class="sx-w">' + Array.from(w).map(function (c) { return '<span class="sx-k">' + c + "</span>"; }).join("") + "</span>";
          return '<span class="sx-w"><span class="sx-k">' + w + "</span></span>";
        })
        .join(" ");
      return el.querySelectorAll(".sx-k");
    },

    /* Bottom-up clip-path mask reveal: the window stays fixed while the glyphs rise into it. */
    maskIn: function (tl, targets, at, o) {
      o = o || {};
      tl.fromTo(
        targets,
        { yPercent: 100, clipPath: "inset(0% 0% 100% 0%)" },
        { yPercent: 0, clipPath: "inset(0% 0% 0% 0%)", duration: o.d || 0.55, ease: o.ease || "power3.out", stagger: o.s === undefined ? 0.05 : o.s },
        at
      );
    },
    maskOut: function (tl, targets, at, o) {
      o = o || {};
      tl.to(targets, { yPercent: -100, clipPath: "inset(100% 0% 0% 0%)", duration: o.d || 0.25, ease: "power3.in", stagger: o.s === undefined ? 0.015 : o.s }, at);
    },

    /* Stroke drawing with a normalised path length. */
    draw: function (tl, targets, at, d, ease) {
      var list = gsap.utils.toArray(targets);
      Array.prototype.forEach.call(list, function (p) { p.setAttribute("pathLength", "1"); });
      tl.fromTo(list, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: ease || "power3.out", stagger: 0.06 }, at);
    },

    /* Count-up with Spanish decimal comma. */
    count: function (tl, el, from, to, at, d, dec, suffix, ease) {
      var o = { v: from };
      var fmt = function (v) { return v.toFixed(dec || 0).replace(".", ",") + (suffix || ""); };
      el.textContent = fmt(from);
      tl.fromTo(o, { v: from }, { v: to, duration: d, ease: ease || "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } }, at);
    },

    /* Virtual camera: slow push-in 1.00 → 1.05 with a lateral drift across the whole scene. */
    cam: function (tl, el, dur, dir) {
      dir = dir || 1;
      tl.fromTo(el, { scale: 1, x: -18 * dir }, { scale: 1.05, x: 18 * dir, duration: dur, ease: "none" }, 0);
    },

    /* Source line: fades in 0.3 s after its datum lands. */
    src: function (tl, el, dataAt) {
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, dataAt + 0.3);
    },

    /* Light sweep across a card (a gradient band inside it). */
    shine: function (tl, band, at) {
      tl.fromTo(band, { xPercent: -160 }, { xPercent: 260, duration: 0.7, ease: "power2.inOut" }, at);
    },
  };
})();
