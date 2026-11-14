// Contract board. Drives hand-built widgets with real key and pointer events and checks each pattern's contract.
// Works with a Playwright page (keyboard.press, mouse.move/down/up/click, evaluate, reload and goto).
//
//   import { run } from "./contracts.mjs";
//   const board = await run(page, [
//     { pattern: "dialog", trigger: "#invite", dialog: "[role=dialog]", background: "#save", inside: "[role=dialog] h2" },
//     { pattern: "menu", trigger: "#actions", menu: "[role=menu]", item: "[role=menuitem]" },
//     { pattern: "combobox", input: "#assignee", option: "[role=option]", query: "a" },
//     { pattern: "tabs", tab: "[role=tab]" },
//     { pattern: "sortable", item: ".task" },
//   ], { url, slow: 0, onResult });
//
// Options: url (reloaded before every check), slow (ms after each key or pointer step), onResult(result, all).
// Returns [{ widget, rule, label, pass, detail }]. Rule ids are the ids in SKILL.md.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function run(page, widgets, opts = {}) {
  const slow = opts.slow ?? 0;
  const settle = opts.settle ?? 200;
  const out = [];

  const key = async (k) => { await page.keyboard.press(k); await sleep(slow + 40); };
  const type = async (s) => { for (const c of s) { await page.keyboard.press(c); await sleep(slow / 2 + 20); } };
  const reset = async () => { opts.url ? await page.goto(opts.url, { waitUntil: "load" }) : await page.reload({ waitUntil: "load" }); await sleep(settle); };
  const ev = (fn, arg) => page.evaluate(fn, arg);

  const visible = (sel) => ev((s) => {
    const el = document.querySelector(s);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && el.checkVisibility({ visibilityProperty: true });
  }, sel);
  const activeIn = (sel) => ev((s) => { const c = document.querySelector(s); return !!c && c.contains(document.activeElement) && document.activeElement !== c; }, sel);
  const activeIs = (sel) => ev((s) => document.activeElement === document.querySelector(s), sel);
  const where = () => ev(() => {
    const a = document.activeElement;
    if (!a || a === document.body) return "body";
    const t = (a.textContent || a.value || "").trim().slice(0, 24);
    return a.tagName.toLowerCase() + (a.id ? "#" + a.id : "") + (t ? ` "${t}"` : "");
  });
  const center = (sel, i = 0) => ev(({ s, i }) => {
    const el = document.querySelectorAll(s)[i];
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, { s: sel, i });
  const texts = (sel) => ev((s) => [...document.querySelectorAll(s)].map((e) => e.textContent.trim().replace(/\s+/g, " ").slice(0, 40)), sel);
  const count = (sel) => ev((s) => document.querySelectorAll(s).length, sel);
  const click = async (sel, i = 0) => { const c = await center(sel, i); if (!c) throw new Error("not found: " + sel); await page.mouse.move(c.x, c.y); await sleep(slow / 2); await page.mouse.click(c.x, c.y); await sleep(slow + 60); };
  const focus = async (sel, i = 0) => { await ev(({ s, i }) => document.querySelectorAll(s)[i]?.focus(), { s: sel, i }); await sleep(slow / 2 + 20); };

  const add = async (widget, rule, label, fn) => {
    let pass = false, detail = "";
    try { await reset(); const r = await fn(); pass = r === true || r?.pass === true; detail = pass ? "" : r?.detail ?? "failed"; }
    catch (e) { detail = "threw: " + e.message.split("\n")[0]; }
    const row = { widget, rule, label, pass, detail };
    out.push(row);
    opts.onResult?.(row, out);
  };
  const fail = (detail) => ({ pass: false, detail });

  for (const w of widgets) {
    const name = w.name ?? w.pattern;

    if (w.pattern === "dialog") {
      const open = async () => { await focus(w.trigger); await key("Enter"); await sleep(settle); };
      await add(name, "defaults-trap-and-return-focus", "Focus moves inside on open", async () => {
        await open();
        if (!(await visible(w.dialog))) return fail("Enter on the trigger did not open it");
        return (await activeIn(w.dialog)) || fail(`focus stayed on ${await where()}`);
      });
      await add(name, "defaults-trap-and-return-focus", "Tab and Shift+Tab stay inside", async () => {
        await open();
        const n = await count(`${w.dialog} :is(a[href], button, input, select, textarea, [tabindex]):not([tabindex="-1"])`);
        for (let i = 1; i <= n + 2; i++) { await key("Tab"); if (!(await activeIn(w.dialog))) return fail(`Tab ${i} reached ${await where()}`); }
        for (let i = 1; i <= 3; i++) { await key("Shift+Tab"); if (!(await activeIn(w.dialog))) return fail(`Shift+Tab ${i} reached ${await where()}`); }
        return true;
      });
      await add(name, "keyboard-escape-closes", "Escape closes it", async () => {
        await open(); await key("Escape");
        return !(await visible(w.dialog)) || fail("still open after Escape");
      });
      await add(name, "defaults-trap-and-return-focus", "Focus returns to the trigger", async () => {
        await open(); await key("Escape");
        if (await visible(w.dialog)) return fail("Escape did not close it");
        return (await activeIs(w.trigger)) || fail(`focus is on ${await where()}`);
      });
      await add(name, "contract-dialog-background-inert", "A press on the page behind lands on the backdrop", async () => {
        await open();
        const c = await center(w.background);
        if (!c) return fail("background control not found");
        const hit = await ev(({ x, y, s }) => { const e = document.elementFromPoint(x, y), b = document.querySelector(s); return !!e && (e === b || b.contains(e)); }, { ...c, s: w.background });
        return !hit || fail("the press reaches the control behind the dialog");
      });
      await add(name, "contract-dialog-outside-press", "A drag that ends on the backdrop keeps it open", async () => {
        await open();
        const c = await center(w.inside);
        if (!c) return fail("inside target not found");
        await page.mouse.move(c.x, c.y); await page.mouse.down(); await sleep(slow / 2 + 30);
        await page.mouse.move(c.x, c.y + 40, { steps: 3 }); await page.mouse.move(6, 6, { steps: 8 }); await sleep(slow / 2);
        await page.mouse.up(); await sleep(settle);
        return (await visible(w.dialog)) || fail("closed when the press started inside and ended outside");
      });
    }

    if (w.pattern === "menu") {
      const first = `${w.menu} ${w.item}`;
      const items = () => count(first);
      const focused = () => ev(({ s }) => [...document.querySelectorAll(s)].indexOf(document.activeElement), { s: first });
      const startOpen = async () => { await click(w.trigger); await sleep(settle); if (!(await visible(w.menu))) throw new Error("trigger click did not open the menu"); await focus(first, 0); };
      await add(name, "contract-menu-open-keys", "Enter and ArrowDown open it onto the first item, ArrowUp onto the last", async () => {
        for (const [k, want] of [["Enter", 0], ["ArrowDown", 0], ["ArrowUp", -1]]) {
          await reset(); await focus(w.trigger); await key(k); await sleep(settle);
          if (!(await visible(w.menu))) return fail(`${k} did not open it`);
          const n = await items(), at = await focused();
          if (at !== (want === -1 ? n - 1 : 0)) return fail(`${k} opened it with focus on ${await where()}`);
        }
        return true;
      });
      await add(name, "contract-menu-roving-focus", "Arrows, Home and End move and wrap, one Tab stop", async () => {
        await startOpen();
        const n = await items();
        const steps = [["ArrowDown", 1], ["ArrowUp", 0], ["ArrowUp", n - 1], ["ArrowDown", 0], ["End", n - 1], ["Home", 0]];
        for (const [k, want] of steps) { await key(k); const at = await focused(); if (at !== want) return fail(`${k} moved focus to item ${at + 1}, not ${want + 1}`); }
        const stops = await ev(({ s }) => [...document.querySelectorAll(s)].filter((e) => e.tabIndex >= 0).length, { s: first });
        return stops <= 1 || fail(`${stops} items are Tab stops`);
      });
      await add(name, "contract-menu-typeahead", "Typing a name moves to the item that starts with it", async () => {
        await startOpen();
        const names = await texts(first), target = Math.min(2, names.length - 1), prefix = names[target].slice(0, 2).toLowerCase();
        const want = names.findIndex((t) => t.toLowerCase().startsWith(prefix));
        await type(prefix);
        const at = await focused();
        return at === want || fail(`typing "${prefix}" left focus on item ${at + 1}, not ${want + 1}`);
      });
      await add(name, "keyboard-escape-closes", "Escape closes it", async () => {
        await startOpen(); await key("Escape");
        return !(await visible(w.menu)) || fail("still open after Escape");
      });
      await add(name, "contract-menu-close-returns-focus", "Closing returns focus to the trigger", async () => {
        await startOpen(); await key("Escape");
        if (await visible(w.menu)) return fail("Escape did not close it");
        return (await activeIs(w.trigger)) || fail(`focus is on ${await where()}`);
      });
      await add(name, "contract-menu-outside-press", "A press outside closes it", async () => {
        await startOpen();
        const y = await ev(() => innerHeight - 8); await page.mouse.move(8, y); await page.mouse.click(8, y); await sleep(settle);
        return !(await visible(w.menu)) || fail("still open after a press outside");
      });
      await add(name, "contract-menu-enter-activates", "Enter on an item runs it and closes the menu", async () => {
        await startOpen(); await key("Enter"); await sleep(settle);
        return !(await visible(w.menu)) || fail(`Enter on item 1 did nothing, focus on ${await where()}`);
      });
    }

    if (w.pattern === "combobox") {
      const q = w.query ?? "a";
      const listSel = w.option;
      const typeIn = async () => { await focus(w.input); await type(q); await sleep(settle); };
      const attr = (a) => ev(({ s, a }) => document.querySelector(s)?.getAttribute(a), { s: w.input, a });
      await add(name, "contract-combobox-roles", "Role, expanded state and controlled listbox", async () => {
        if ((await attr("role")) !== "combobox") return fail(`role is ${await attr("role")}`);
        if ((await attr("aria-expanded")) !== "false") return fail(`aria-expanded is ${await attr("aria-expanded")} while closed`);
        await typeIn();
        if ((await attr("aria-expanded")) !== "true") return fail(`aria-expanded is ${await attr("aria-expanded")} while open`);
        const ok = await ev(({ s }) => { const id = document.querySelector(s).getAttribute("aria-controls"); const l = id && document.getElementById(id); return !!l && l.getAttribute("role") === "listbox"; }, { s: w.input });
        return ok || fail("aria-controls does not point at a listbox");
      });
      await add(name, "contract-combobox-active-descendant", "ArrowDown moves the active option, focus stays in the input", async () => {
        await typeIn(); await key("ArrowDown");
        if (!(await activeIs(w.input))) return fail(`focus left the input for ${await where()}`);
        const ok = await ev(({ s, o }) => { const id = document.querySelector(s).getAttribute("aria-activedescendant"); const e = id && document.getElementById(id); return !!e && e.matches(o); }, { s: w.input, o: listSel });
        return ok || fail("aria-activedescendant does not name an option");
      });
      await add(name, "contract-combobox-enter-selects", "Enter picks the active option and closes the list", async () => {
        await typeIn(); await key("ArrowDown");
        const want = await ev(({ s, o }) => { const id = document.querySelector(s).getAttribute("aria-activedescendant"); const e = (id && document.getElementById(id)) || document.querySelector(o); return e ? e.textContent.trim() : ""; }, { s: w.input, o: listSel });
        await key("Enter"); await sleep(settle);
        const val = await ev((s) => document.querySelector(s).value, w.input);
        if (!want || !val.includes(want)) return fail(`value is "${val}", expected "${want}"`);
        return !(await visible(listSel)) || fail("list still open after Enter");
      });
      await add(name, "contract-combobox-pointer-select", "Clicking an option picks it", async () => {
        await typeIn();
        const want = (await texts(listSel))[1];
        if (!(await visible(listSel))) return fail("list not open");
        await click(listSel, 1); await sleep(settle);
        const val = await ev((s) => document.querySelector(s).value, w.input);
        return (want && val.includes(want)) || fail(`value is "${val}" after clicking "${want}"`);
      });
      await add(name, "contract-combobox-escape-order", "First Escape closes the list, second clears the text", async () => {
        await typeIn(); await key("Escape");
        const kept = await ev((s) => document.querySelector(s).value, w.input);
        if (await visible(listSel)) return fail("list open after Escape");
        if (!kept) return fail("the first Escape cleared the text");
        await key("Escape");
        const left = await ev((s) => document.querySelector(s).value, w.input);
        return left === "" || fail(`second Escape left "${left}"`);
      });
    }

    if (w.pattern === "tabs") {
      const idx = (sel) => ev((s) => [...document.querySelectorAll(s)].indexOf(document.activeElement), sel);
      const sel = (a) => ev(({ s, a }) => [...document.querySelectorAll(s)].map((e) => e.getAttribute(a)), { s: w.tab, a });
      await add(name, "contract-tabs-one-stop", "One Tab stop, Tab leaves the list", async () => {
        const stops = await ev((s) => [...document.querySelectorAll(s)].filter((e) => e.tabIndex >= 0).length, w.tab);
        if (stops !== 1) return fail(`${stops} tabs are Tab stops`);
        await ev((s) => [...document.querySelectorAll(s)].find((e) => e.tabIndex >= 0).focus(), w.tab); await key("Tab");
        return (await idx(w.tab)) === -1 || fail("Tab moved to the next tab");
      });
      await add(name, "contract-tabs-arrows", "Arrows wrap, Home and End jump, selection follows focus", async () => {
        const n = await count(w.tab);
        await focus(w.tab, 0);
        const steps = [["ArrowRight", 1], ["ArrowLeft", 0], ["ArrowLeft", n - 1], ["ArrowRight", 0], ["End", n - 1], ["Home", 0]];
        for (const [k, want] of steps) {
          await key(k); const at = await idx(w.tab);
          if (at !== want) return fail(`${k} moved focus to tab ${at + 1}, not ${want + 1}`);
          const s = await sel("aria-selected");
          if (s[want] !== "true") return fail(`tab ${want + 1} has focus but aria-selected is ${s[want]}`);
        }
        return true;
      });
      await add(name, "contract-tabs-panel-link", "Each click shows its own panel and hides the rest", async () => {
        const n = await count(w.tab);
        for (let i = 0; i < n; i++) {
          await click(w.tab, i);
          const r = await ev(({ s, i }) => {
            const tabs = [...document.querySelectorAll(s)], shown = [];
            for (const [j, t] of tabs.entries()) {
              const id = t.getAttribute("aria-controls"), p = id && document.getElementById(id);
              if (!p || p.getAttribute("role") !== "tabpanel") return `tab ${j + 1} has no tabpanel through aria-controls`;
              const rc = p.getBoundingClientRect(), v = rc.width > 0 && rc.height > 0 && p.checkVisibility({ visibilityProperty: true });
              if (v) shown.push(j);
            }
            return shown.length === 1 && shown[0] === i && tabs[i].getAttribute("aria-selected") === "true" ? "" : `after clicking tab ${i + 1}, panels shown: ${shown.map((x) => x + 1).join(",") || "none"}`;
          }, { s: w.tab, i });
          if (r) return fail(r);
        }
        return true;
      });
    }

    if (w.pattern === "sortable") {
      const order = () => texts(w.item);
      const lift = async () => { await focus(w.item, 0); await key("Space"); await key("ArrowDown"); };
      await add(name, "contract-sortable-keyboard-reorder", "Space lifts, ArrowDown moves, Space drops", async () => {
        const before = await order();
        await lift(); await key("Space"); await sleep(settle);
        const after = await order();
        return (after[1] === before[0] && after[0] === before[1]) || fail(`order is ${after.join(", ")}`);
      });
      await add(name, "contract-sortable-escape-cancels", "Escape puts the item back", async () => {
        const before = await order();
        await lift();
        const moved = await order();
        if (moved[0] === before[0]) return fail("the lift and ArrowDown moved nothing");
        await key("Escape"); await sleep(settle);
        const after = await order();
        return after.join() === before.join() || fail(`order is ${after.join(", ")} after Escape`);
      });
      await add(name, "contract-sortable-pointer-drag", "A pointer drag reorders and drops on release", async () => {
        const before = await order(), a = await center(w.item, 0), b = await center(w.item, 2);
        await page.mouse.move(a.x, a.y); await page.mouse.down(); await sleep(slow / 2 + 40);
        await page.mouse.move(b.x, b.y + 6, { steps: 14 }); await sleep(slow / 2 + 40);
        await page.mouse.up(); await sleep(settle);
        const after = await order();
        return (after[2] === before[0]) || fail(`order is ${after.join(", ")}`);
      });
      await add(name, "contract-sortable-announce", "Lift, move and drop are announced in a live region", async () => {
        await focus(w.item, 0);
        const seen = await ev(() => { window.__live = []; const o = new MutationObserver(() => window.__live.push([...document.querySelectorAll("[aria-live]")].map((e) => e.textContent.trim()).join(" | "))); document.querySelectorAll("[aria-live]").forEach((e) => o.observe(e, { childList: true, characterData: true, subtree: true })); return document.querySelectorAll("[aria-live]").length; });
        if (!seen) return fail("no aria-live region on the page");
        await key("Space"); await key("ArrowDown"); await key("Space"); await sleep(settle);
        const msgs = [...new Set(await ev(() => window.__live.filter(Boolean)))];
        return msgs.length >= 3 || fail(`${msgs.length} announcements, expected lift, move and drop`);
      });
    }
  }
  return out;
}

export const summary = (rows) => ({ pass: rows.filter((r) => r.pass).length, total: rows.length });
