// Run in the page before the interaction (init script, DevTools console or page.evaluate).
// Tracks the rect of each named element once a frame, so a hard cut and a carry read differently.
//   window.__segue.start({ cover: [".row .cover", ".hero"], tab: ["#indicator"] })
//   ...click, wait for the motion to settle...
//   window.__segue.stop()   -> { cover: { frames, travel, maxStep, share, jumpAtMark, verdict }, ... }
// A selector list is read in order and the first visible match is the element. A selector written
// "vt:name" reads the ::view-transition-group(name) box instead, for View Transitions.
// fadeFrames counts frames drawn part-way through a fade, which is how a reduced-motion cross-fade reads.
// window.__segue.mark() records the instant of an interruption, such as the reverse click.
// window.__segue.seek(0.5) pauses every running animation at that fraction, for the frame strip.
// seek(1) finishes them, so their end handlers run. Wait one frame before a screenshot.
(() => {
  const state = { targets: {}, samples: {}, marks: [], frame: 0, raf: 0 };

  const matrixBox = (style) => {
    const m = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
    return { left: m.e, top: m.f, width: parseFloat(style.width) * m.a, height: parseFloat(style.height) * m.d };
  };

  const read = (list) => {
    for (const selector of list) {
      if (selector.startsWith("vt:")) {
        const style = getComputedStyle(document.documentElement, `::view-transition-group(${selector.slice(3)})`);
        if (style.width !== "auto" && style.width !== "") return matrixBox(style);
        continue;
      }
      for (const el of document.querySelectorAll(selector)) {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (rect.width && rect.height && style.visibility !== "hidden" && Number(style.opacity) > 0.01) {
          return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, opacity: Number(style.opacity) };
        }
      }
    }
    return null;
  };

  const tick = () => {
    state.frame += 1;
    for (const [name, list] of Object.entries(state.targets)) {
      const rect = read(list);
      if (rect) state.samples[name].push({ frame: state.frame, ...rect });
    }
    state.raf = requestAnimationFrame(tick);
  };

  const centre = (s) => [s.left + s.width / 2, s.top + s.height / 2];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const round = (v) => Math.round(v * 10) / 10;

  const summarise = (samples) => {
    const steps = [];
    for (let i = 1; i < samples.length; i += 1) {
      const a = samples[i - 1];
      const b = samples[i];
      // Position and size both count: the centre moves, and so do the edges.
      const move = Math.max(dist(centre(a), centre(b)), Math.abs(b.width - a.width), Math.abs(b.height - a.height));
      steps.push({ frame: b.frame, step: move });
    }
    const first = samples[0];
    // Travel is the furthest the element gets from where it started, so a trip there and back still counts.
    const travel = samples.reduce((m, s) => Math.max(m, dist(centre(first), centre(s)), Math.abs(s.width - first.width), Math.abs(s.height - first.height)), 0);
    const maxStep = steps.reduce((m, s) => Math.max(m, s.step), 0);
    const share = travel > 0 ? maxStep / travel : 0;
    const moving = steps.filter((s) => s.step > 0.5).length;
    let verdict = "static";
    if (travel > 16) verdict = share > 0.5 || moving < 3 ? "cut" : "carried";
    // Interruption: how far the element jumps in the four frames after a mark, against its biggest earlier step.
    const jumps = state.marks.map((mark) => {
      const jump = steps.filter((s) => s.frame > mark.frame && s.frame <= mark.frame + 4).reduce((m, s) => Math.max(m, s.step), 0);
      const before = steps.filter((s) => s.frame <= mark.frame).slice(-6).reduce((m, s) => Math.max(m, s.step), 0);
      return { jump: round(jump), earlier: round(before), snapped: jump > Math.max(8, before * 2) };
    }).filter(Boolean);
    const fadeFrames = samples.filter((s) => s.opacity > 0.02 && s.opacity < 0.98).length;
    return { frames: samples.length, moving, travel: round(travel), maxStep: round(maxStep), share: round(share * 100) / 100, fadeFrames, verdict, interrupts: jumps };
  };

  window.__segue = {
    start(targets) {
      cancelAnimationFrame(state.raf);
      state.targets = targets; state.marks = []; state.frame = 0;
      state.samples = Object.fromEntries(Object.keys(targets).map((k) => [k, []]));
      state.raf = requestAnimationFrame(tick);
    },
    mark() { state.marks.push({ frame: state.frame }); },
    stop() {
      cancelAnimationFrame(state.raf);
      return Object.fromEntries(Object.entries(state.samples).map(([k, v]) => [k, summarise(v)]));
    },
    seek(fraction) {
      const animations = document.getAnimations();
      for (const animation of animations) {
        const timing = animation.effect.getComputedTiming();
        if (fraction >= 1) { animation.finish(); continue; }
        animation.pause();
        animation.currentTime = fraction * timing.endTime;
      }
      return animations.length;
    },
  };
})();
