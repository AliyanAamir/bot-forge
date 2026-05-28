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

  // CSS is injected into the shadow root — host page styles cannot bleed in.
  // CSS custom properties set on the host element still pierce the boundary,
  // so --bf-primary etc. are inherited correctly from the host div.
  var STYLES = "\
* {\
  box-sizing: border-box;\
  margin: 0;\
  padding: 0;\
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;\
}\
.bf-fab {\
  position: fixed;\
  z-index: 2147483647;\
  width: 56px;\
  height: 56px;\
  border-radius: 50%;\
  background: var(--bf-primary, #6366f1);\
  border: none;\
  cursor: pointer;\
  box-shadow: 0 4px 20px rgba(0,0,0,.2);\
  display: flex;\
  align-items: center;\
  justify-content: center;\
  transition: transform .2s, box-shadow .2s;\
}\
.bf-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(0,0,0,.25); }\
.bf-fab svg { width: 26px; height: 26px; }\
.bf-window {\
  position: fixed;\
  z-index: 2147483646;\
  background: #fff;\
  border-radius: 16px;\
  box-shadow: 0 8px 40px rgba(0,0,0,.18);\
  display: flex;\
  flex-direction: column;\
  overflow: hidden;\
  transition: opacity .25s, transform .25s;\
}\
.bf-window.bf-hidden { opacity: 0; pointer-events: none; transform: translateY(12px) scale(.97); }\
.bf-header {\
  background: var(--bf-primary, #6366f1);\
  color: #fff;\
  padding: 14px 16px;\
  display: flex;\
  align-items: center;\
  gap: 10px;\
}\
.bf-header-avatar {\
  width: 32px; height: 32px; border-radius: 50%;\
  background: rgba(255,255,255,.25);\
  display: flex; align-items: center; justify-content: center;\
  font-weight: 700; font-size: 14px;\
}\
.bf-header-name { font-weight: 600; font-size: 15px; }\
.bf-header-status { font-size: 11px; opacity: .8; }\
.bf-close {\
  margin-left: auto; background: none; border: none; cursor: pointer;\
  color: #fff; opacity: .7; font-size: 20px; line-height: 1; padding: 2px 4px;\
}\
.bf-close:hover { opacity: 1; }\
.bf-messages {\
  flex: 1;\
  overflow-y: auto;\
  padding: 16px;\
  display: flex;\
  flex-direction: column;\
  gap: 10px;\
  background: var(--bf-bg, #f8f9fb);\
}\
.bf-msg {\
  max-width: 82%;\
  padding: 10px 14px;\
  border-radius: 14px;\
  font-size: 14px;\
  line-height: 1.5;\
}\
.bf-msg.bf-bot {\
  background: #fff;\
  color: var(--bf-text, #1e293b);\
  border-bottom-left-radius: 4px;\
  align-self: flex-start;\
  box-shadow: 0 1px 3px rgba(0,0,0,.08);\
}\
.bf-msg.bf-user {\
  background: var(--bf-primary, #6366f1);\
  color: #fff;\
  border-bottom-right-radius: 4px;\
  align-self: flex-end;\
}\
.bf-typing {\
  display: flex; gap: 4px; align-items: center; padding: 12px 14px;\
  background: #fff; border-radius: 14px; border-bottom-left-radius: 4px;\
  align-self: flex-start; box-shadow: 0 1px 3px rgba(0,0,0,.08);\
}\
.bf-typing span {\
  width: 7px; height: 7px; border-radius: 50%;\
  background: var(--bf-primary, #6366f1); opacity: .4;\
  animation: bf-bounce .9s ease-in-out infinite;\
}\
.bf-typing span:nth-child(2) { animation-delay: .15s; }\
.bf-typing span:nth-child(3) { animation-delay: .3s; }\
@keyframes bf-bounce {\
  0%,80%,100% { transform: translateY(0); opacity: .4; }\
  40% { transform: translateY(-6px); opacity: 1; }\
}\
.bf-input-row {\
  display: flex; gap: 8px; padding: 12px 14px;\
  background: #fff; border-top: 1px solid #e8eaf0;\
}\
.bf-input {\
  flex: 1; border: 1px solid #d1d5db; border-radius: 10px;\
  padding: 9px 13px; font-size: 14px; outline: none;\
  resize: none; max-height: 120px; line-height: 1.4;\
  color: #1e293b;\
  background: #fff;\
  -webkit-text-fill-color: #1e293b;\
}\
.bf-input:focus { border-color: var(--bf-primary, #6366f1); }\
.bf-send {\
  background: var(--bf-primary, #6366f1); border: none; border-radius: 10px;\
  color: #fff; cursor: pointer; width: 38px; height: 38px;\
  display: flex; align-items: center; justify-content: center;\
  flex-shrink: 0; align-self: flex-end;\
  transition: opacity .15s;\
}\
.bf-send:hover { opacity: .85; }\
.bf-send:disabled { opacity: .45; cursor: default; }\
.bf-send svg { width: 18px; height: 18px; fill: #fff; }\
.bf-branding {\
  text-align: center; font-size: 11px; color: #9ca3af;\
  padding: 6px; background: #fff; border-top: 1px solid #f0f0f0;\
}\
.bf-branding a { color: inherit; text-decoration: none; }\
.bf-branding a:hover { text-decoration: underline; }\
";

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

    // Host element stays in the light DOM so position:fixed children resolve
    // against the viewport. CSS vars set here pierce the shadow boundary.
    var host = document.createElement("div");
    host.style.cssText =
      "--bf-primary:" + primaryColor + ";--bf-text:#1e293b;--bf-bg:#f8f9fb;";
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: "open" });

    var styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    shadow.appendChild(styleEl);

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
    shadow.appendChild(fab);

    var win = document.createElement("div");
    win.className = "bf-window bf-hidden";
    win.style.cssText =
      (isBottom ? "bottom:96px;" : "top:96px;") +
      (isRight ? "right:24px;" : "left:24px;") +
      "width:" + widgetWidth + "px;height:" + widgetHeight + "px;max-height:calc(100vh - 120px);";
    shadow.appendChild(win);

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
          body: JSON.stringify({
            apiKey: cfg.apiKey,
            message: text,
            sessionId: sessionId,
            visitorId: visitorId,
          }),
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
