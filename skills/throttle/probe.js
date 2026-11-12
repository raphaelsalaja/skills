// Throttle probe. Run it through the browser's evaluate call before the page loads
// (an init script) or right after, then perform the steps and read the result.
//   window.__throttle.start()   begin recording
//   window.__throttle.stop()    return the findings
(() => {
  if (window.__throttle) return;
  const opts = Object.assign({ feedbackMs: 100, shiftBudget: 0.1, bigShift: 0.02, duplicateWindowMs: 2000 }, window.__throttleOptions);
  const st = { on: false, t0: 0, shifts: [], requests: [], presses: [], fontLoads: [], errors: [] };
  const now = () => Math.round(performance.now() - st.t0);
  const sel = (n) => {
    if (!n || n.nodeType !== 1) return n && n.parentElement ? sel(n.parentElement) : "";
    const id = n.id ? "#" + n.id : "";
    const cls = typeof n.className === "string" && n.className.trim() ? "." + n.className.trim().split(/\s+/)[0] : "";
    return n.tagName.toLowerCase() + id + cls;
  };

  // Layout shifts, with the nodes that moved.
  try {
    new PerformanceObserver((list) => {
      if (!st.on) return;
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        st.shifts.push({ t: Math.round(e.startTime - st.t0), value: +e.value.toFixed(4), nodes: (e.sources || []).map((s) => sel(s.node)).slice(0, 4) });
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {}

  // Requests: fetch and XMLHttpRequest, with method, url, body and outcome.
  const log = (r) => { if (st.on) st.requests.push(r); return r; };
  const f0 = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    const method = ((init && init.method) || (input && input.method) || "GET").toUpperCase();
    const r = log({ t: now(), method, url: new URL(url, location.href).pathname, body: init && typeof init.body === "string" ? init.body : "", ms: null, status: null, failed: false });
    const s = performance.now();
    return f0.apply(this, arguments).then((res) => { r.ms = Math.round(performance.now() - s); r.status = res.status; return res; }, (err) => { r.ms = Math.round(performance.now() - s); r.failed = true; throw err; });
  };
  const open = XMLHttpRequest.prototype.open, send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__t = { method: String(m).toUpperCase(), url: new URL(u, location.href).pathname }; return open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function (b) {
    const r = log({ t: now(), method: this.__t.method, url: this.__t.url, body: typeof b === "string" ? b : "", ms: null, status: null, failed: false });
    const s = performance.now();
    this.addEventListener("loadend", () => { r.ms = Math.round(performance.now() - s); r.status = this.status; r.failed = this.status === 0; });
    return send.apply(this, arguments);
  };

  // Press feedback: time from a click or submit to the first visible change near the control.
  let press = null;
  const watcher = new MutationObserver((muts) => {
    if (!press || press.feedbackMs !== null) return;
    const { scope, el } = press;
    for (const m of muts) {
      const t = m.target.nodeType === 1 ? m.target : m.target.parentElement;
      if (!t) continue;
      if (el.contains(t) || scope.contains(t) || (t.closest && t.closest("[aria-live], [role=status], [role=alert]"))) { press.feedbackMs = Math.round(performance.now() - press.start); return; }
    }
  });
  watcher.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  const onPress = (e) => {
    if (!st.on) return;
    const el = e.target.closest && e.target.closest("button, [type=submit], a, [role=button]");
    if (!el) return;
    press = { control: sel(el), label: (el.textContent || "").trim().slice(0, 30), start: performance.now(), feedbackMs: null, el, scope: el.closest("form") || el, at: now(), requests: 0 };
    st.presses.push(press);
  };
  document.addEventListener("click", onPress, true);

  // Fonts: each face, its display value and when it finished.
  const faces = () => {
    const out = [];
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const r of rules) if (r instanceof CSSFontFaceRule) out.push({ family: r.style.getPropertyValue("font-family").replace(/["']/g, "").trim(), display: r.style.getPropertyValue("font-display") || "auto", adjust: !!(r.style.getPropertyValue("size-adjust") || r.style.getPropertyValue("ascent-override")) });
    }
    return out;
  };
  document.fonts && document.fonts.addEventListener("loadingdone", (e) => { if (st.on) st.fontLoads.push({ t: now(), families: e.fontfaces.map((f) => f.family.replace(/["']/g, "")) }); });

  // Messages that name a failure and have no retry control near them.
  const deadEnds = () => {
    const out = [];
    const failure = /(something went wrong|failed|couldn.t|could not|error|offline|unable|try again)/i;
    const retry = /(retry|try again|reload|refresh|resend|reconnect)/i;
    const hasRetry = (n) => !!n && [...n.querySelectorAll("button, a[href], [role=button], input[type=button], input[type=submit]")].some((c) => retry.test(c.textContent + " " + (c.getAttribute("aria-label") || "") + " " + (c.value || "")));
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      const text = n.textContent.trim(); if (!text || !failure.test(text)) continue;
      const el = n.parentElement; if (!el || !el.offsetParent || /^(script|style|noscript)$/i.test(el.tagName)) continue;
      const up = el.parentElement && !/^(main|body|html)$/i.test(el.parentElement.tagName) ? el.parentElement : null;
      if (![el, el.previousElementSibling, el.nextElementSibling, up].some(hasRetry)) out.push({ el: sel(el), text: text.slice(0, 60) });
    }
    return out;
  };

  window.__throttle = {
    start() { Object.assign(st, { on: true, t0: performance.now(), shifts: [], requests: [], presses: [], fontLoads: [], errors: [] }); press = null; return "recording"; },
    stop() {
      st.on = false;
      const total = +st.shifts.reduce((a, s) => a + s.value, 0).toFixed(4);
      const duplicates = [];
      const bySig = {};
      for (const r of st.requests) if (r.method !== "GET") (bySig[r.method + " " + r.url + " " + r.body] = bySig[r.method + " " + r.url + " " + r.body] || []).push(r);
      for (const [sig, rs] of Object.entries(bySig)) if (rs.length > 1 && rs[rs.length - 1].t - rs[0].t <= opts.duplicateWindowMs) duplicates.push({ request: sig.split(" ").slice(0, 2).join(" "), count: rs.length, atMs: rs.map((r) => r.t) });
      return {
        shiftTotal: total, shiftBudget: opts.shiftBudget, shifts: st.shifts.map((s) => Object.assign({ big: s.value > opts.bigShift }, s)), bigShift: opts.bigShift,
        presses: st.presses.map(({ control, label, at, feedbackMs }) => ({ control, label, at, feedbackMs, slow: feedbackMs === null || feedbackMs > opts.feedbackMs })),
        requests: st.requests.map(({ t, method, url, ms, status, failed }) => ({ t, method, url, ms, status, failed })),
        duplicates, fontFaces: faces(), fontLoads: st.fontLoads,
        deadEnds: deadEnds(),
      };
    },
  };
})();
