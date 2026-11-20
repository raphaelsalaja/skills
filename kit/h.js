const $ = (id) => document.getElementById(id);

function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  node.append(...children.filter((child) => child != null));
  return node;
}

function letterKey(event, scope) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || !/^[a-z]$/i.test(event.key)) return "";
  return event.composedPath().includes(scope) ? event.key.toLowerCase() : "";
}
