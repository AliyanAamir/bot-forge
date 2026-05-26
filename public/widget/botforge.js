(function () {
  "use strict";

  var cfg = window.BotForgeConfig || {};
  if (!cfg.apiKey) {
    console.warn("[BotForge] No apiKey provided.");
    return;
  }

  var apiUrl = cfg.apiUrl || "/api/chat";
  var sessionId = null;
  var visitorId = (function () {
    try {
      var k = "bf_vid";
      var v = localStorage.getItem(k);
      if (!v) {
        v = "v_" + Math.random().toString(36).slice(2) + Date.now();
        localStorage.setItem(k, v);
      }
      return v;
    } catch (e) {
      return "anonymous";
    }
  })();

  /* ---- Build DOM ---- */
  var container = document.createElement("div");
  container.setAttribute("data-botforge", "true");
  document.body.appendChild(container);

  /* Read config injected by server via meta tag (optional server-side delivery) */
  function meta(name, fallback) {
    var el = document.querySelector('meta[name="bf-' + name + '"]');
    return el ? el.getAttribute("content") || fallback : fallback;
  }

  var primaryColor = meta("primary-color", "#6366f1");
  var botName = meta("bot-name", "Assistant");
  var welcomeMsg = meta("welcome-message", "Hi! How can I help you today?");
  var placeholder = meta("placeholder", "Type a message...");
  var position = meta("position", "bottom-right");
  var showBranding = meta("show-branding", "true") !== "false";
  var widgetWidth = parseInt(meta("widget-width", "380"), 10);
  var widgetHeight = parseInt(meta("widget-height", "560"), 10);

  /* CSS vars */
  container.style.cssText =
    "--bf-primary:" + primaryColor + ";--bf-text:#1e293b;--bf-bg:#f8f9fb;";

  /* Position helpers */
  var isBottom = position.startsWith("bottom");
  var isRight = position.endsWith("right");
  var edgeV = isBottom ? "bottom:24px;" : "top:24px;";
  var edgeH = isRight ? "right:24px;" : "left:24px;";

  /* FAB */
  var fab = document.createElement("button");
  fab.className = "bf-fab";
  fab.setAttribute("aria-label", "Open chat");
  fab.style.cssText = edgeV + edgeH;
  fab.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';
  container.appendChild(fab);

  /* Window */
  var win = document.createElement("div");
  win.className = "bf-window bf-hidden";
  win.style.cssText =
    (isBottom ? "bottom:96px;" : "top:96px;") +
    (isRight ? "right:24px;" : "left:24px;") +
    "width:" + widgetWidth + "px;height:" + widgetHeight + "px;max-height:calc(100vh - 120px);";
  container.appendChild(win);

  /* Header */
  var header = document.createElement("div");
  header.className = "bf-header";
  header.innerHTML =
    '<div class="bf-header-avatar">' + botName[0].toUpperCase() + "</div>" +
    '<div><div class="bf-header-name">' + botName + "</div>" +
    '<div class="bf-header-status">Online</div></div>' +
    '<button class="bf-close" aria-label="Close">&#x2715;</button>';
  win.appendChild(header);

  /* Messages */
  var msgs = document.createElement("div");
  msgs.className = "bf-messages";
  win.appendChild(msgs);

  /* Input row */
  var inputRow = document.createElement("div");
  inputRow.className = "bf-input-row";

  var input = document.createElement("textarea");
  input.className = "bf-input";
  input.setAttribute("placeholder", placeholder);
  input.setAttribute("rows", "1");
  inputRow.appendChild(input);

  var sendBtn = document.createElement("button");
  sendBtn.className = "bf-send";
  sendBtn.setAttribute("aria-label", "Send");
  sendBtn.innerHTML =
    '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  inputRow.appendChild(sendBtn);
  win.appendChild(inputRow);

  /* Branding */
  if (showBranding) {
    var brand = document.createElement("div");
    brand.className = "bf-branding";
    brand.innerHTML = 'Powered by <a href="https://botforge.dev" target="_blank">BotForge</a>';
    win.appendChild(brand);
  }

  /* ---- Logic ---- */
  var isOpen = false;
  var isLoading = false;

  function addMessage(role, text) {
    var m = document.createElement("div");
    m.className = "bf-msg " + (role === "user" ? "bf-user" : "bf-bot");
    m.textContent = text;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
    return m;
  }

  function showTyping() {
    var t = document.createElement("div");
    t.className = "bf-typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
    return t;
  }

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      win.classList.remove("bf-hidden");
      fab.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
      if (msgs.children.length === 0) addMessage("bot", welcomeMsg);
      setTimeout(function () { input.focus(); }, 50);
    } else {
      win.classList.add("bf-hidden");
      fab.innerHTML =
        '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>';
    }
  }

  async function sendMessage() {
    var text = input.value.trim();
    if (!text || isLoading) return;

    input.value = "";
    input.style.height = "auto";
    isLoading = true;
    sendBtn.disabled = true;
    addMessage("user", text);

    var typing = showTyping();

    try {
      var res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cfg.apiKey, message: text, sessionId: sessionId, visitorId: visitorId }),
      });

      var data = await res.json();
      typing.remove();

      if (res.ok) {
        sessionId = data.sessionId || sessionId;
        addMessage("bot", data.reply || "Sorry, I couldn't process that.");
      } else {
        addMessage("bot", "Error: " + (data.error || "Something went wrong."));
      }
    } catch (err) {
      typing.remove();
      addMessage("bot", "Network error. Please try again.");
    }

    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }

  /* Auto-resize textarea */
  input.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  fab.addEventListener("click", toggle);
  header.querySelector(".bf-close").addEventListener("click", toggle);
  sendBtn.addEventListener("click", sendMessage);
})();
