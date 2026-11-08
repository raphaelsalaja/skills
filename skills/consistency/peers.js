// Run in the page (DevTools console, Runtime.evaluate or page.evaluate).
// Returns { families, findings } for peers that left their family.
// Options: set window.__consistencyOptions before running.
//   root: selector, default the body
//   families: [{ name, selector, metrics }]
//     metrics may set height, width, paddingTop, paddingRight, paddingBottom,
//     paddingLeft, paddingX, paddingY, radius, fontSize, fontWeight, gap, icon.
//     radius and paddingX / paddingY may be a single number.
//   baseline: the families array returned from a related screen
//   edge: shared-edge miss, in px, that counts here. Default 4. Smaller misses stay with alignment.
// Call window.__consistency.highlight() to number the findings. clear() removes them.
((options = {}) => {
  const root = options.root ? document.querySelector(options.root) : document.body;
  const edge = options.edge ?? 4;
  const slack = 1;
  const findings = [];
  const round = (value) => Math.round(value * 10) / 10;
  const px = (value) => Number.parseFloat(value) || 0;

  const isVisible = (el) => {
    if (!el || el.nodeType !== 1 || !root.contains(el)) return false;
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (rect.width < 1 || rect.height < 1) return false;
    if (style.visibility === "hidden" || style.display === "none") return false;
    if (el.closest("[inert], [hidden]")) return false;
    return true;
  };

  const describe = (el) => {
    const parts = [];
    let node = el;
    while (node && node !== document.body && parts.length < 3) {
      let part = node.tagName.toLowerCase();
      const name = [...node.classList]
        .map((value) => value.split("__").pop())
        .find((value) => value.length > 1);
      if (node.id) part += `#${node.id}`;
      else if (name) part += `.${name}`;
      parts.unshift(part);
      node = node.parentElement;
    }
    const text = el.textContent.trim().replace(/\s+/g, " ").slice(0, 40);
    return text ? `${parts.join(" > ")} "${text}"` : parts.join(" > ");
  };

  const rectOf = (el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: round(rect.x + scrollX),
      y: round(rect.y + scrollY),
      width: round(rect.width),
      height: round(rect.height),
    };
  };

  const weightOf = (value) => ({ normal: "400", bold: "700" })[value] ?? String(value);

  const radiusOf = (style) =>
    [
      style.borderTopLeftRadius,
      style.borderTopRightRadius,
      style.borderBottomRightRadius,
      style.borderBottomLeftRadius,
    ].map((value) => round(px(value)));

  const metricsOf = (el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const icon = [...el.querySelectorAll("svg, img")].find(isVisible);
    const box = icon?.getBoundingClientRect();
    return {
      height: round(rect.height),
      width: round(rect.width),
      paddingTop: round(px(style.paddingTop)),
      paddingRight: round(px(style.paddingRight)),
      paddingBottom: round(px(style.paddingBottom)),
      paddingLeft: round(px(style.paddingLeft)),
      radius: radiusOf(style),
      fontSize: round(px(style.fontSize)),
      fontWeight: weightOf(style.fontWeight),
      gap: round(Math.max(px(style.rowGap), px(style.columnGap))),
      icon: box ? round(Math.max(box.width, box.height)) : null,
    };
  };

  const expand = (metrics) => {
    if (!metrics) return null;
    const next = { ...metrics };
    if ("paddingX" in next) {
      next.paddingLeft = next.paddingX;
      next.paddingRight = next.paddingX;
      delete next.paddingX;
    }
    if ("paddingY" in next) {
      next.paddingTop = next.paddingY;
      next.paddingBottom = next.paddingY;
      delete next.paddingY;
    }
    if (typeof next.radius === "number") next.radius = Array(4).fill(next.radius);
    if ("fontWeight" in next) next.fontWeight = weightOf(next.fontWeight);
    return next;
  };

  const labelOf = {
    height: "height",
    width: "width",
    paddingTop: "padding-top",
    paddingRight: "padding-right",
    paddingBottom: "padding-bottom",
    paddingLeft: "padding-left",
    radius: "radius",
    fontSize: "font-size",
    fontWeight: "font-weight",
    gap: "gap",
    icon: "icon box",
  };

  const format = (metric, value) => {
    if (value == null) return "none";
    if (metric === "fontWeight") return String(value);
    if (metric === "radius") {
      return value.every((item) => item === value[0]) ? `${value[0]}px` : value.map((item) => `${item}px`).join(" ");
    }
    return `${value}px`;
  };

  const same = (metric, actual, expected) => {
    if (actual == null || expected == null) return false;
    if (metric === "fontWeight") return String(actual) === String(expected);
    if (metric === "radius") return actual.every((value, index) => Math.abs(value - expected[index]) <= slack);
    return Math.abs(actual - expected) <= slack;
  };

  const differs = (metric, actual, expected) => actual != null && expected != null && !same(metric, actual, expected);

  const majority = (values) => {
    const counts = new Map();
    for (const value of values) {
      const key = JSON.stringify(value);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const [key] = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
    return JSON.parse(key);
  };

  const variantOf = (el) => {
    const named = el.getAttribute("data-variant") || el.getAttribute("data-appearance") || el.getAttribute("data-tone");
    if (named) return named;
    for (const name of el.classList) {
      const part = name.split(/[-_]/).find((bit) => /^(primary|secondary|ghost|quiet|danger|outline|accent)$/.test(bit));
      if (part) return part;
    }
    return "";
  };

  const componentOf = (el) => {
    for (const name of el.classList) {
      if (/^(is|has|hover|active|focus|focused|disabled|selected|open|closed)[-_]/.test(name)) continue;
      return name;
    }
    return el.tagName.toLowerCase();
  };

  const iconOnly = (el) => {
    const text = [...el.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent.trim())
      .join("");
    return text.length === 0 && !!el.querySelector("svg, img");
  };

  const autoFamilies = () => {
    const controls = [...root.querySelectorAll("button, [role=button], input, select, textarea")].filter(isVisible);
    const groups = new Map();
    for (const el of controls) {
      const kind = el.matches("input, select, textarea") ? "field" : iconOnly(el) ? "icon" : "text";
      const key = `${componentOf(el)}|${variantOf(el)}|${kind}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    }
    return [...groups.entries()]
      .filter(([, elements]) => elements.length >= 2)
      .map(([key, elements]) => {
        const [component, variant, kind] = key.split("|");
        return { name: [component, variant, kind].filter(Boolean).join(" "), elements, metrics: null };
      });
  };

  const families = options.families?.length
    ? options.families
        .map((family) => ({
          name: family.name,
          selector: family.selector,
          elements: [...root.querySelectorAll(family.selector)].filter(isVisible),
          metrics: expand(family.metrics),
        }))
        .filter((family) => family.elements.length >= 1)
    : autoFamilies();

  const autoMetricNames = (elements) => {
    const sample = elements.map(metricsOf);
    const names = [
      "height",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "radius",
      "fontSize",
      "fontWeight",
      "gap",
    ];
    const widths = sample.map((item) => item.width);
    if (Math.max(...widths) - Math.min(...widths) <= slack) names.push("width");
    if (sample.every((item) => item.icon != null)) names.push("icon");
    return names;
  };

  const reports = [];
  const add = (rule, el, detail, measured, rects) => {
    findings.push({
      rule,
      where: describe(el),
      detail,
      measured,
      rect: rectOf(el),
      rects: rects ?? [rectOf(el)],
      grade: "DOM-confirmed",
      element: el,
    });
  };

  for (const family of families) {
    const variants = [...new Set(family.elements.map(variantOf))];
    if (family.elements.length >= 2 && variants.length > 1) {
      add(
        "consistency-variant-is-not-a-peer",
        family.elements[0],
        `${family.name} mixes variants ${variants.map((variant) => variant || "default").join(" and ")}`,
        { family: family.name, variants },
        family.elements.map(rectOf),
      );
      continue;
    }
    if (family.elements.length < 2 && !family.metrics) continue;

    const sample = family.elements.map(metricsOf);
    const names = family.metrics ? Object.keys(family.metrics) : autoMetricNames(family.elements);
    const resolved = {};
    const spread = {};
    for (const metric of names) {
      const values = sample.map((item) => item[metric]);
      const present = values.filter((value) => value != null);
      if (!present.length) continue;
      const local = majority(present);
      const token = family.metrics && metric in family.metrics ? family.metrics[metric] : null;
      const expected = token ?? local;
      resolved[metric] = local;
      spread[metric] = present.every((value) => same(metric, value, local));
      const outliers = family.elements.filter((el, index) => differs(metric, values[index], expected));
      if (!outliers.length) continue;
      const unique = new Set(values.map((value) => JSON.stringify(value)));
      if (unique.size < 2) {
        const prior = options.baseline?.find((item) => item.name === family.name);
        const caught =
          prior?.metrics && metric in prior.metrics && differs(metric, local, prior.metrics[metric]);
        if (token && differs(metric, local, token) && !caught) {
          add(
            "consistency-peer-metric",
            family.elements[0],
            `${family.name}: all ${family.elements.length} use ${labelOf[metric]} ${format(metric, local)} instead of ${format(metric, token)}`,
            { family: family.name, metric, expected: token, values },
            family.elements.map(rectOf),
          );
        }
        continue;
      }
      const seen = [...new Set(outliers.map((el) => format(metric, values[family.elements.indexOf(el)])))];
      add(
        "consistency-peer-metric",
        outliers[0],
        `${family.name}: ${outliers.length} of ${family.elements.length} use ${labelOf[metric]} ${seen.join(" and ")} instead of ${format(metric, expected)}`,
        { family: family.name, metric, expected, values },
        outliers.map(rectOf),
      );
    }
    reports.push({
      name: family.name,
      selector: family.selector ?? null,
      count: family.elements.length,
      metrics: resolved,
      spread,
    });
  }

  if (options.baseline?.length) {
    for (const report of reports) {
      const prior = options.baseline.find((item) => item.name === report.name);
      if (!prior?.metrics) continue;
      const host = families.find((family) => family.name === report.name)?.elements[0];
      if (!host) continue;
      for (const metric of Object.keys(report.metrics)) {
        if (!report.spread?.[metric]) continue;
        if (!(metric in prior.metrics)) continue;
        if (!differs(metric, report.metrics[metric], prior.metrics[metric])) continue;
        add(
          "consistency-across-screens",
          host,
          `${report.name} ${labelOf[metric]} is ${format(metric, report.metrics[metric])} here and ${format(metric, prior.metrics[metric])} on the related screen`,
          { family: report.name, metric, here: report.metrics[metric], baseline: prior.metrics[metric] },
        );
      }
    }
  }

  const textStart = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let left = null;
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      if (!isVisible(walker.currentNode.parentElement)) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      const box = range.getClientRects()[0];
      if (!box || box.width < 1) continue;
      left = left == null ? box.left : Math.min(left, box.left);
    }
    return left;
  };

  for (const pane of [...root.querySelectorAll("section, aside, [role=region]")].filter(isVisible)) {
    const header = [...pane.children].find((el) => /head/i.test(el.className) || el.tagName === "HEADER");
    const body = [...pane.children].find((el) => el !== header && isVisible(el));
    if (!header || !body || !isVisible(header)) continue;
    const headerText = textStart(header);
    const bodyText = textStart(body);
    if (headerText == null || bodyText == null) continue;
    const delta = round(headerText - bodyText);
    if (Math.abs(delta) > edge) {
      add(
        "consistency-pane-edge",
        header,
        `Header text starts ${Math.abs(delta)}px ${delta > 0 ? "right" : "left"} of the body text`,
        { offset: delta, header: round(headerText), body: round(bodyText) },
      );
    }
  }

  for (const parent of root.querySelectorAll("*")) {
    const groups = new Map();
    for (const kid of [...parent.children].filter(isVisible)) {
      const key = `${kid.tagName}.${componentOf(kid)}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(kid);
    }
    for (const group of groups.values()) {
      if (group.length < 3) continue;
      const actions = group.map(
        (row) => [...row.querySelectorAll("button, [role=button]")].filter(isVisible).at(-1) ?? null,
      );
      if (actions.some((button) => !button) || actions.some((button, index) => button === group[index])) continue;
      const sideOf = (row, button) => {
        const rowBox = row.getBoundingClientRect();
        const buttonBox = button.getBoundingClientRect();
        return buttonBox.left - rowBox.left <= rowBox.right - buttonBox.right ? "left" : "right";
      };
      const sides = group.map((row, index) => sideOf(row, actions[index]));
      const vote = majority(sides);
      group.forEach((row, index) => {
        if (sides[index] === vote) return;
        add(
          "consistency-misplaced-slot",
          actions[index],
          `Action sits on the ${sides[index]} while the other rows keep it on the ${vote}`,
          { side: sides[index], peers: vote, count: group.length },
        );
      });
    }
  }

  const edged = new Set(findings.filter((finding) => finding.rule === "consistency-pane-edge").map((finding) => finding.element));
  const kept = findings.filter(
    (finding) =>
      !(
        finding.rule === "consistency-peer-metric" &&
        String(finding.measured.metric).startsWith("padding") &&
        edged.has(finding.element)
      ),
  );

  const paint = () => {
    document.querySelectorAll("[data-consistency-overlay]").forEach((node) => node.remove());
    kept.forEach((finding, index) => {
      for (const rect of finding.rects) {
        const mark = document.createElement("div");
        mark.dataset.consistencyOverlay = "";
        Object.assign(mark.style, {
          position: "absolute",
          left: `${rect.x}px`,
          top: `${rect.y}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          outline: "2px solid #ff2d55",
          outlineOffset: "1px",
          zIndex: 2147483646,
          pointerEvents: "none",
          boxSizing: "border-box",
        });
        const label = document.createElement("span");
        label.textContent = String(index + 1);
        Object.assign(label.style, {
          position: "absolute",
          top: "-18px",
          left: "-1px",
          minWidth: "16px",
          padding: "0 4px",
          background: "#ff2d55",
          color: "#fff",
          font: "600 11px/16px system-ui, sans-serif",
          textAlign: "center",
        });
        mark.append(label);
        document.body.append(mark);
      }
    });
  };

  window.__consistency = {
    findings: kept,
    families: reports,
    highlight: paint,
    clear() {
      document.querySelectorAll("[data-consistency-overlay]").forEach((node) => node.remove());
    },
  };

  return {
    families: reports,
    findings: kept.map(({ element, ...finding }, index) => ({ id: index + 1, ...finding })),
  };
})(window.__consistencyOptions);
