document.addEventListener("mousemove", e => {
  const dot = document.createElement("div");
  dot.style.cssText = `position:fixed;width:8px;height:8px;background:#a78bfa;border-radius:50%;pointer-events:none;left:${e.clientX}px;top:${e.clientY}px;z-index:99999;transition:opacity 0.5s`;
  document.body.appendChild(dot);
  setTimeout(() => {
    dot.style.opacity = 0;
    setTimeout(() => dot.remove(), 500);
  }, 100);
});