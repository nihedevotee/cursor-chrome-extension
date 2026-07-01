(() => {
  let mouseX = 0, mouseY = 0;
  let caretX = null, caretY = null;
  let isTyping = false;
  let typingTimeout = null;

  const trailColors = [
    "#ede9fe", "#c4b5fd", "#a78bfa",
    "#8b5cf6", "#7c3aed", "#6d28d9", "#4c1d95",
  ];

  // Soft icy white snowflake palette
  const bloodColors = [
    "#ffffff", "#f0f9ff", "#e0f2fe", "#f8fafc",
  ];

  document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMoved = true;
  });

  document.addEventListener("selectionchange", () => {
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        range.collapse(true);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          caretX = rects[0].left;
          caretY = rects[0].top + rects[0].height / 2;
        }
      }
    } catch (_) {}
  });

  let hasMoved = false;
  let lastSpawn = 0;

  function spawnTrail() {
    if (hasMoved) {
      const now = Date.now();
      if (now - lastSpawn >= 60) {
        lastSpawn = now;
        createDrop(mouseX, mouseY);
      }
    }
    requestAnimationFrame(spawnTrail);
  }

  spawnTrail();

  // Continuous blood pour loop — runs while isTyping is true
  let lastBloodSpawn = 0;
  function bloodPourLoop() {
    if (isTyping && caretX !== null) {
      const now = Date.now();
      if (now - lastBloodSpawn >= 90) {
        lastBloodSpawn = now;
        createBloodDrip(caretX, caretY);
      }
    }
    requestAnimationFrame(bloodPourLoop);
  }
  bloodPourLoop();

  document.addEventListener("keydown", e => {
    if (["Shift","Control","Alt","Meta","CapsLock","Tab","Escape"].includes(e.key)) return;

    const el = document.activeElement;

    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      const mirror = document.createElement("div");
      mirror.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        font: ${style.font};
        padding: ${style.padding};
        border: ${style.border};
        box-sizing: ${style.boxSizing};
        width: ${rect.width}px;
        left: -9999px;
        top: -9999px;
      `;

      const textBefore = el.value.substring(0, el.selectionStart);
      mirror.textContent = textBefore;

      const cursor = document.createElement("span");
      cursor.textContent = "|";
      mirror.appendChild(cursor);
      document.body.appendChild(mirror);

      const offsetX = cursor.offsetLeft;
      const offsetY = cursor.offsetTop + cursor.offsetHeight / 2;

      document.body.removeChild(mirror);

      let x = rect.left + offsetX;
      let y = rect.top + offsetY;

      x = Math.min(Math.max(x, rect.left + 4), rect.right - 4);
      y = Math.min(Math.max(y, rect.top + 4), rect.bottom - 4);

      caretX = x;
      caretY = y;
    }
    // For contentEditable, caretX/caretY already updated via selectionchange

    isTyping = true;
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => { isTyping = false; }, 400);
  });

  function createBloodDrip(x, y) {
    const drop = document.createElement("div");
    const color = bloodColors[Math.floor(Math.random() * bloodColors.length)];
    const scatter = (Math.random() - 0.5) * 4;
    const size = 4 + Math.random() * 4; // round snowflake
    const fallDistance = 50 + Math.random() * 80;
    const sway = (Math.random() - 0.5) * 24; // gentle side drift
    const duration = 1400 + Math.random() * 900; // slow, drifting fall
    const startYOffset = 12; // start a bit below the caret so it doesn't cover the text

    drop.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      left: ${x + scatter}px;
      top: ${y + startYOffset}px;
      z-index: 2147483647;
      opacity: 0.85;
      filter: blur(0.3px);
      box-shadow: 0 0 4px ${color}, 0 0 8px rgba(255,255,255,0.5);
      transition: transform ${duration}ms ease-in,
                  opacity ${duration}ms ease-in;
      will-change: transform, opacity;
    `;

    document.body.appendChild(drop);

    requestAnimationFrame(() => {
      drop.style.transform = `translate(${sway}px, ${fallDistance}px) rotate(${(Math.random() - 0.5) * 180}deg)`;
      drop.style.opacity = "0";
    });

    setTimeout(() => drop.remove(), duration + 50);
  }

  function createDrop(x, y) {
    const drop = document.createElement("div");
    const color = trailColors[Math.floor(Math.random() * trailColors.length)];
    const scatter = (Math.random() - 0.5) * 6;
    const size = 5 + Math.random() * 5;
    const fallDistance = 80 + Math.random() * (window.innerHeight - y);
    const duration = 1200 + Math.random() * 800;

    drop.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      left: ${x + scatter - size / 2}px;
      top: ${y}px;
      z-index: 2147483647;
      opacity: 0.85;
      box-shadow: 0 0 ${size + 4}px ${color};
      transition: transform ${duration}ms cubic-bezier(0.2, 0.8, 0.4, 1),
                  opacity ${duration}ms ease-in;
      will-change: transform, opacity;
    `;

    document.body.appendChild(drop);

    requestAnimationFrame(() => {
      drop.style.transform = `translateY(${fallDistance}px) translateX(${(Math.random() - 0.5) * 10}px)`;
      drop.style.opacity = "0";
    });

    setTimeout(() => drop.remove(), duration + 50);
  }
})();
