(function () {
  "use strict";

  var cfg = window.BotForgeConfig || {};
  if (!cfg.apiKey) {
    console.warn("[BotForge] No apiKey provided.");
    return;
  }

  var apiUrl = cfg.apiUrl || "/api/chat";
  var configUrl = cfg.configUrl || apiUrl.replace(/\/chat$/, "/widget/config");
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

  fetch(configUrl + "?apiKey=" + encodeURIComponent(cfg.apiKey))
    .then(function (r) { return r.ok ? r.json() : null; })
    .catch(function () { return null; })
    .then(init);

  function init(remoteCfg) {
    remoteCfg = remoteCfg || {};

    var primaryColor = remoteCfg.primaryColor || "#6366f1";
    var botName = remoteCfg.botName || "Assistant";
    var welcomeMsg = remoteCfg.welcomeMessage || "Hi! How can I help you today?";
    var placeholder = remoteCfg.placeholder || "Type a message...";
    var position = remoteCfg.position || "bottom-right";
    var showBranding = remoteCfg.showBranding !== false;
    var widgetWidth = remoteCfg.widgetWidth || 380;
    var widgetHeight = remoteCfg.widgetHeight || 560;
    var iconPath = remoteCfg.iconPath || "M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z";

    var container = document.createElement("div");
    container.setAttribute("data-botforge", "true");
    document.body.appendChild(container);
    container.style.cssText =
      "--bf-primary:" + primaryColor + ";--bf-text:#1e293b;--bf-bg:#f8f9fb;";

    var isBottom = position.indexOf("bottom") === 0;
    var isRight = position.indexOf("right") >= 0;
    var edgeV = isBottom ? "bottom:24px;" : "top:24px;";
    var edgeH = isRight ? "right:24px;" : "left:24px;";

    var fabIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' +
      iconPath +
      '"/></svg>';
    var closeIcon =
      '<svg viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

    var fab = document.createElement("button");
    fab.className = "bf-fab";
    fab.setAttribute("aria-label", "Open chat");
    fab.style.cssText = edgeV + edgeH;
    fab.innerHTML = fabIcon;
    container.appendChild(fab);

    var win = document.createElement("div");
    win.className = "bf-window bf-hidden";
    win.style.cssText =
      (isBottom ? "bottom:96px;" : "top:96px;") +
      (isRight ? "right:24px;" : "left:24px;") +
      "width:" + widgetWidth + "px;height:" + widgetHeight + "px;max-height:calc(100vh - 120px);";
    container.appendChild(win);

    var header = document.createElement("div");
    header.className = "bf-header";
    header.innerHTML =
      '<div class="bf-header-avatar">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="' +
      iconPath +
      '"/></svg>' +
      "</div>" +
      '<div><div class="bf-header-name">' + botName + "</div>" +
      '<div class="bf-header-status">Online</div></div>' +
      '<button class="bf-close" aria-label="Close">&#x2715;</button>';
    win.appendChild(header);

    var msgs = document.createElement("div");
    msgs.className = "bf-messages";
    win.appendChild(msgs);

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

    if (showBranding) {
      var brand = document.createElement("div");
      brand.className = "bf-branding";
      brand.innerHTML = 'Powered by <a href="https://botforge.dev" target="_blank">BotForge</a>';
      win.appendChild(brand);
    }

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
        fab.innerHTML = closeIcon;
        if (msgs.children.length === 0) addMessage("bot", welcomeMsg);
        setTimeout(function () { input.focus(); }, 50);
      } else {
        win.classList.add("bf-hidden");
        fab.innerHTML = fabIcon;
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
  }
})();
