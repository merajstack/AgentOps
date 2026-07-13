/**
 * AgentOps Floating Chat Widget v1.0
 * 
 * Usage:
 *   <script src="https://agentops-auto.vercel.app/widget.js"
 *     data-type="business-inquiry"
 *     data-manager-email="manager@company.com">
 *   </script>
 *
 * Supported data attributes:
 *   data-type            "business-inquiry" | "lead-capture"
 *   data-manager-email   (required for business-inquiry)
 *   data-business-name   (required for lead-capture)
 *   data-business-email  (required for lead-capture)
 *   data-color           Hex color for the bubble (default: #6366f1)
 *   data-icon            Bot avatar URL (default: same-origin /icon.png)
 */
(function () {
  'use strict';

  // ── Read config from the <script> tag ──────────────────────────────
  var scriptEl = document.currentScript;
  if (!scriptEl) return;

  var cfg = {
    type:          scriptEl.getAttribute('data-type') || 'business-inquiry',
    managerEmail:  scriptEl.getAttribute('data-manager-email') || '',
    businessName:  scriptEl.getAttribute('data-business-name') || '',
    businessEmail: scriptEl.getAttribute('data-business-email') || '',
    color:         scriptEl.getAttribute('data-color') || '#6366f1',
    icon:          scriptEl.getAttribute('data-icon') || (location.origin + '/icon.png'),
  };

  // ── Flow definitions ───────────────────────────────────────────────
  var FLOWS = {
    'business-inquiry': {
      title: 'Business Enquiry 💼',
      webhook: 'https://workflow.ccbp.in/webhook/business-inquiry',
      steps: [
        {
          key: 'name',
          ask: function () { return "Hi! 👋 Welcome. What's your name?"; },
          validate: function (v) { return v.trim().length >= 2; },
          error: "That doesn't look right — please try again. Name must be at least 2 characters."
        },
        {
          key: 'email',
          ask: function (d) { return 'Nice to meet you, ' + d.name + "! What's your email address?"; },
          validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
          error: "That doesn't look right — please try again. Please enter a valid email."
        },
        {
          key: 'query',
          ask: function () { return 'Great! Please describe your enquiry, invoice request, or proposal details.'; },
          validate: function (v) { return v.trim().length >= 10; },
          error: "That doesn't look right — please try again. Please provide at least 10 characters."
        }
      ],
      payload: function (d) {
        return { name: d.name, email: d.email, query: d.query, adminEmail: cfg.managerEmail };
      },
      submitting: function (d) { return 'Thanks ' + d.name + '! Submitting your request now… ⏳'; },
      success: function (d) { return '✅ Your request has been submitted successfully! We\'ll get back to you at ' + d.email + ' shortly.'; },
      fail: '❌ Something went wrong. Please try again.'
    },
    'lead-capture': {
      title: 'Contact Us 📊',
      webhook: 'https://workflow.ccbp.in/webhook/website-lead',
      steps: [
        {
          key: 'name',
          ask: function () { return "Hi! 👋 Welcome. What's your full name?"; },
          validate: function (v) { return v.trim().length >= 2; },
          error: 'Name must be at least 2 characters. Please try again.'
        },
        {
          key: 'mobile',
          ask: function (d) { return 'Thanks ' + d.name + "! What's your mobile number?"; },
          validate: function (v) { return v.trim().length >= 7; },
          error: 'Please enter a valid mobile number.'
        },
        {
          key: 'email',
          ask: function () { return "What's your email address?"; },
          validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
          error: "That doesn't look like a valid email. Please try again."
        },
        {
          key: 'requirement_description',
          ask: function () { return 'Please describe your requirement in detail.'; },
          validate: function (v) { return v.trim().length >= 10; },
          error: 'Please provide at least 10 characters for your requirement.'
        }
      ],
      payload: function (d) {
        return {
          name: d.name,
          mobile: d.mobile,
          email: d.email,
          requirement_description: d.requirement_description,
          owner_mobile: cfg.businessEmail,
          business_name: cfg.businessName
        };
      },
      submitting: function (d) { return 'Thanks ' + d.name + '! Submitting your details now… ⏳'; },
      success: function (d) { return '✅ Thank you ' + d.name + '! Your details have been submitted. We\'ll reach out to you soon.'; },
      fail: '❌ Something went wrong. Please try again.'
    }
  };

  var flow = FLOWS[cfg.type] || FLOWS['business-inquiry'];

  // ── Inject scoped CSS ──────────────────────────────────────────────
  var STYLE_ID = 'agentops-widget-styles';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '\
/* AgentOps Widget — scoped styles */\
#agentops-w-bubble{position:fixed;bottom:24px;right:24px;z-index:99999;width:56px;height:56px;border-radius:50%;background:' + cfg.color + ';color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.25);transition:transform .2s,box-shadow .2s;}\
#agentops-w-bubble:hover{transform:scale(1.08);box-shadow:0 6px 20px rgba(0,0,0,.3);}\
#agentops-w-bubble svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:transform .3s;}\
#agentops-w-bubble.ao-open svg{transform:rotate(90deg) scale(.85);}\
\
#agentops-w-window{position:fixed;bottom:92px;right:24px;z-index:99999;width:370px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);border-radius:16px;background:#fff;box-shadow:0 12px 48px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(16px) scale(.96);pointer-events:none;transition:opacity .25s ease,transform .25s ease;}\
#agentops-w-window.ao-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}\
\
#agentops-w-header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:linear-gradient(135deg,' + cfg.color + ',' + adjustColor(cfg.color, -30) + ');color:#fff;flex-shrink:0;}\
#agentops-w-header span{font-weight:600;font-size:15px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}\
#agentops-w-close{background:none;border:none;color:rgba(255,255,255,.8);cursor:pointer;width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;font-size:18px;}\
#agentops-w-close:hover{background:rgba(255,255,255,.15);color:#fff;}\
\
#agentops-w-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f8fafc;}\
#agentops-w-msgs::-webkit-scrollbar{width:4px;}#agentops-w-msgs::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}\
\
.ao-msg{display:flex;gap:8px;max-width:88%;animation:ao-fadeUp .3s ease;}\
.ao-msg.ao-bot{align-self:flex-start;}\
.ao-msg.ao-user{align-self:flex-end;flex-direction:row-reverse;}\
.ao-avatar{width:28px;height:28px;border-radius:50%;flex-shrink:0;object-fit:cover;margin-top:2px;background:#e2e8f0;}\
.ao-text{padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;word-break:break-word;}\
.ao-bot .ao-text{background:#fff;color:#1e293b;border:1px solid #e2e8f0;border-bottom-left-radius:4px;}\
.ao-user .ao-text{background:' + cfg.color + ';color:#fff;border-bottom-right-radius:4px;}\
\
.ao-typing{display:flex;gap:4px;padding:10px 14px;}\
.ao-typing span{width:7px;height:7px;background:' + cfg.color + ';border-radius:50%;opacity:.5;animation:ao-bounce .6s infinite alternate;}\
.ao-typing span:nth-child(2){animation-delay:.15s;}\
.ao-typing span:nth-child(3){animation-delay:.3s;}\
\
#agentops-w-inputbar{display:flex;align-items:center;gap:8px;padding:12px 14px;border-top:1px solid #e2e8f0;background:#fff;flex-shrink:0;}\
#agentops-w-input{flex:1;border:1px solid #e2e8f0;border-radius:10px;padding:10px 14px;font-size:14px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;outline:none;transition:border-color .15s;resize:none;max-height:80px;line-height:1.4;}\
#agentops-w-input:focus{border-color:' + cfg.color + ';}\
#agentops-w-input::placeholder{color:#94a3b8;}\
#agentops-w-send{width:36px;height:36px;border-radius:10px;border:none;background:' + cfg.color + ';color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s,transform .15s;flex-shrink:0;}\
#agentops-w-send:hover{transform:scale(1.06);}\
#agentops-w-send:disabled{opacity:.4;cursor:default;transform:none;}\
#agentops-w-send svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}\
\
.ao-retry-btn{display:inline-block;margin-top:8px;padding:6px 16px;border-radius:8px;border:none;background:' + cfg.color + ';color:#fff;font-size:13px;cursor:pointer;font-family:inherit;transition:opacity .15s;}\
.ao-retry-btn:hover{opacity:.85;}\
\
@keyframes ao-fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}\
@keyframes ao-bounce{to{opacity:1;transform:translateY(-4px);}}\
\
@media(max-width:480px){\
  #agentops-w-window{width:calc(100vw - 16px);height:calc(100vh - 100px);right:8px;bottom:84px;border-radius:14px;}\
  #agentops-w-bubble{bottom:16px;right:16px;width:50px;height:50px;}\
}\
';
    document.head.appendChild(style);
  }

  // ── Utility: darken / lighten hex color ────────────────────────────
  function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    var r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    var g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    var b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // ── Build DOM ──────────────────────────────────────────────────────
  // Bubble button
  var bubble = document.createElement('button');
  bubble.id = 'agentops-w-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  // Chat window
  var win = document.createElement('div');
  win.id = 'agentops-w-window';
  win.innerHTML = '\
<div id="agentops-w-header">\
  <span>' + escapeHtml(flow.title) + '</span>\
  <button id="agentops-w-close" aria-label="Close chat">&times;</button>\
</div>\
<div id="agentops-w-msgs"></div>\
<div id="agentops-w-inputbar">\
  <textarea id="agentops-w-input" placeholder="Type a message…" rows="1"></textarea>\
  <button id="agentops-w-send" aria-label="Send" disabled>\
    <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>\
  </button>\
</div>';

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  var msgsEl   = document.getElementById('agentops-w-msgs');
  var inputEl  = document.getElementById('agentops-w-input');
  var sendBtn  = document.getElementById('agentops-w-send');
  var closeBtn = document.getElementById('agentops-w-close');

  // ── State ──────────────────────────────────────────────────────────
  var isOpen      = false;
  var stepIndex   = 0;
  var collected   = {};
  var isSubmitted = false;
  var lastPayload = null;

  // ── Helpers ────────────────────────────────────────────────────────
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function addMessage(text, type) {
    var row = document.createElement('div');
    row.className = 'ao-msg ' + (type === 'bot' ? 'ao-bot' : 'ao-user');

    if (type === 'bot') {
      var avatar = document.createElement('img');
      avatar.className = 'ao-avatar';
      avatar.src = cfg.icon;
      avatar.alt = 'Bot';
      avatar.onerror = function () { this.style.display = 'none'; };
      row.appendChild(avatar);
    }

    var bubble = document.createElement('div');
    bubble.className = 'ao-text';
    bubble.textContent = text;
    row.appendChild(bubble);

    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function showTyping() {
    var row = document.createElement('div');
    row.className = 'ao-msg ao-bot';
    row.id = 'agentops-w-typing';

    var avatar = document.createElement('img');
    avatar.className = 'ao-avatar';
    avatar.src = cfg.icon;
    avatar.alt = 'Bot';
    avatar.onerror = function () { this.style.display = 'none'; };
    row.appendChild(avatar);

    var dots = document.createElement('div');
    dots.className = 'ao-typing';
    dots.innerHTML = '<span></span><span></span><span></span>';
    row.appendChild(dots);

    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function hideTyping() {
    var el = document.getElementById('agentops-w-typing');
    if (el) el.remove();
  }

  function botSay(text, cb) {
    showTyping();
    setTimeout(function () {
      hideTyping();
      addMessage(text, 'bot');
      if (cb) cb();
    }, 600);
  }

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
    if (enabled) inputEl.focus();
  }

  function askCurrentStep() {
    var step = flow.steps[stepIndex];
    var msg = typeof step.ask === 'function' ? step.ask(collected) : step.ask;
    botSay(msg, function () { setInputEnabled(true); });
  }

  function resetChat() {
    stepIndex = 0;
    collected = {};
    isSubmitted = false;
    lastPayload = null;
    msgsEl.innerHTML = '';
    inputEl.value = '';
    setInputEnabled(false);
    // Start conversation
    askCurrentStep();
  }

  // ── Webhook POST ───────────────────────────────────────────────────
  function submitToWebhook() {
    var payload = flow.payload(collected);
    lastPayload = payload;

    setInputEnabled(false);
    botSay(flow.submitting(collected), function () {
      showTyping();
      fetch(flow.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          hideTyping();
          if (res.ok || res.status === 200) {
            addMessage(flow.success(collected), 'bot');
            isSubmitted = true;
          } else {
            throw new Error('HTTP ' + res.status);
          }
        })
        .catch(function () {
          hideTyping();
          addMessage(flow.fail, 'bot');
          // Add retry button
          var retryRow = document.createElement('div');
          retryRow.className = 'ao-msg ao-bot';
          retryRow.style.paddingLeft = '36px';
          var retryBtn = document.createElement('button');
          retryBtn.className = 'ao-retry-btn';
          retryBtn.textContent = '🔄 Retry';
          retryBtn.onclick = function () {
            retryRow.remove();
            submitToWebhook();
          };
          retryRow.appendChild(retryBtn);
          msgsEl.appendChild(retryRow);
          msgsEl.scrollTop = msgsEl.scrollHeight;
        });
    });
  }

  // ── Handle user input ──────────────────────────────────────────────
  function handleSend() {
    var text = inputEl.value.trim();
    if (!text || isSubmitted) return;

    addMessage(text, 'user');
    inputEl.value = '';
    inputEl.style.height = 'auto';
    setInputEnabled(false);

    var step = flow.steps[stepIndex];

    if (!step.validate(text)) {
      botSay(step.error, function () { setInputEnabled(true); });
      return;
    }

    // Store the value
    collected[step.key] = text.trim();
    stepIndex++;

    if (stepIndex < flow.steps.length) {
      // Ask next question
      askCurrentStep();
    } else {
      // All collected — submit
      submitToWebhook();
    }
  }

  // ── Event listeners ────────────────────────────────────────────────
  bubble.addEventListener('click', function () {
    isOpen = !isOpen;
    bubble.classList.toggle('ao-open', isOpen);
    win.classList.toggle('ao-visible', isOpen);

    if (isOpen) {
      // Fresh conversation each time window opens
      if (msgsEl.children.length === 0) {
        resetChat();
      } else {
        inputEl.focus();
      }
    }
  });

  closeBtn.addEventListener('click', function () {
    isOpen = false;
    bubble.classList.remove('ao-open');
    win.classList.remove('ao-visible');
    // Reset the chat so next open starts fresh
    resetChat();
  });

  sendBtn.addEventListener('click', handleSend);

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    sendBtn.disabled = !this.value.trim() || isSubmitted;
  });
})();
