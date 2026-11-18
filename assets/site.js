(() => {
  "use strict";
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = String(new Date().getFullYear()); });
  const config = window.CHU_CONFIG || {};
  const page = document.body.dataset.page;
  if (page === "home") { configureVideo(config.videoUrl); configureLeadForm(); }
  if (page === "apply") configureApplicationForm();

  function configureVideo(raw) {
    if (!raw) return;
    let url;
    try { url = new URL(raw); } catch (_) { return; }
    if (url.protocol !== "https:") return;
    const mount = document.getElementById("videoMount");
    if (!mount) return;
    if (/\.mp4(?:$|[?#])/i.test(url.href)) {
      const player = document.createElement("video");
      player.controls = true; player.playsInline = true; player.preload = "metadata";
      player.setAttribute("aria-label", "Custom Home University introduction video");
      player.src = url.href; mount.replaceChildren(player); return;
    }
    let embed = "";
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be" || host === "www.youtu.be") {
      embed = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(url.pathname.substring(1));
    } else if (["youtube.com","www.youtube.com","m.youtube.com","www.youtube-nocookie.com","youtube-nocookie.com"].includes(host)) {
      const id = url.searchParams.get("v") || (url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : "");
      if (id) embed = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id);
    } else if (["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(host)) {
      const id = url.pathname.match(/(?:\/video)?\/(\d+)/)?.[1];
      if (id) embed = "https://player.vimeo.com/video/" + id;
    }
    if (!embed) return;
    const frame = document.createElement("iframe");
    frame.src = embed; frame.title = "Custom Home University introduction video";
    frame.loading = "lazy"; frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    mount.replaceChildren(frame);
  }

  function configureLeadForm() {
    const form = document.getElementById("leadForm");
    const input = document.getElementById("leadEmail");
    const phone = document.getElementById("leadPhone");
    phone.addEventListener("input", () => phone.setCustomValidity(""));
    const button = document.getElementById("leadSubmit");
    const status = document.getElementById("leadStatus");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      input.value = input.value.trim();
      validatePhone(phone);
      if (!form.reportValidity()) return;
      const email = input.value;
      const phoneNumber = phone.value;
      if (!(await submit(form, "lead", button, status))) return;
      try {
        sessionStorage.setItem("chu_application_email", email);
        sessionStorage.setItem("chu_application_phone", phoneNumber);
      } catch (_) {}
      window.location.assign("apply.html");
    });
  }
  function configureApplicationForm() {
    const form = document.getElementById("applicationForm");
    const input = document.getElementById("applicationEmail");
    const phone = document.getElementById("applicationPhone");
    phone.addEventListener("input", () => phone.setCustomValidity(""));
    const button = document.getElementById("applicationSubmit");
    const status = document.getElementById("applicationStatus");
    try {
      input.value = sessionStorage.getItem("chu_application_email") || "";
      phone.value = sessionStorage.getItem("chu_application_phone") || "";
    } catch (_) {}
    form.addEventListener("submit", async e => {
      e.preventDefault();
      input.value = input.value.trim();
      validatePhone(phone);
      if (!form.reportValidity()) return;
      if (!(await submit(form, "application", button, status))) return;
      try {
        sessionStorage.removeItem("chu_application_email");
        sessionStorage.removeItem("chu_application_phone");
      } catch (_) {}
      window.location.assign("thank-you.html");
    });
  }
  function validatePhone(input) {
    input.value = input.value.trim();
    const digits = input.value.replace(/\D/g, "");
    const valid = input.value === "" || (/^[+0-9() .-]+$/.test(input.value) && digits.length >= 10 && digits.length <= 15);
    input.setCustomValidity(valid ? "" : "Enter a valid cell phone number (10–15 digits).");
  }
  async function submit(form, type, button, status) {
    const endpoint = String(config.backendUrl || "").trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(endpoint)) {
      showStatus(status, "Applications are not open yet. Email notifications are still being connected.", "error");
      return false;
    }
    const nonce = makeNonce();
    const initial = button.innerHTML;
    button.disabled = true;
    button.textContent = type === "lead" ? "Continuing…" : "Submitting application…";
    showStatus(status, "Submitting…");
    const kind = document.createElement("input");
    kind.type = "hidden"; kind.name = "submission_type"; kind.value = type;
    const token = document.createElement("input");
    token.type = "hidden"; token.name = "response_id"; token.value = nonce;
    form.append(kind, token);
    const result = await new Promise(resolve => {
      let done = false, pollTimer, timer, activeScript;
      const previous = window.chuBackendStatus;
      function finish(outcome) {
        if (done) return;
        done = true;
        clearTimeout(timer); clearTimeout(pollTimer);
        window.removeEventListener("message", onMessage);
        if (activeScript) activeScript.remove();
        if (previous === undefined) delete window.chuBackendStatus;
        else window.chuBackendStatus = previous;
        resolve(outcome);
      }
      function onMessage(event) {
        const allowed = event.origin === "https://script.google.com" ||
          /^https:\/\/(?:[a-z0-9-]+\.)?googleusercontent\.com$/.test(event.origin);
        if (!allowed) return;
        const data = event.data;
        if (!data || data.type !== "chu-form-result" || data.response_id !== nonce) return;
        finish({ ok: data.ok === true, message: String(data.message || "") });
      }
      window.chuBackendStatus = data => {
        if (!data || data.response_id !== nonce || data.pending) return;
        finish({ ok: data.ok === true, message: String(data.message || "") });
      };
      function poll() {
        if (done) return;
        const url = new URL(endpoint);
        url.searchParams.set("mode", "status");
        url.searchParams.set("response_id", nonce);
        url.searchParams.set("_", String(Date.now()));
        const tag = document.createElement("script");
        tag.src = url.toString(); tag.async = true;
        const next = () => {
          tag.remove();
          if (activeScript === tag) activeScript = null;
          if (!done) pollTimer = setTimeout(poll, 2700);
        };
        tag.onload = next; tag.onerror = next;
        activeScript = tag; document.head.appendChild(tag);
      }
      window.addEventListener("message", onMessage);
      timer = setTimeout(() => finish({ok:false, message:"We couldn't confirm your submission. Please try again, or email us directly."}), 30000);
      try {
        form.action = endpoint; form.method = "POST"; form.target = "chuSubmissionFrame";
        form.enctype = "application/x-www-form-urlencoded";
        HTMLFormElement.prototype.submit.call(form);
        pollTimer = setTimeout(poll, 1600);
      } catch (_) {
        finish({ok:false, message:"We couldn't send your submission. Please try again."});
      }
    });
    kind.remove(); token.remove(); button.disabled = false; button.innerHTML = initial;
    if (!result.ok) {
      showStatus(status, result.message || "We couldn't process your request. Please try again.", "error");
      return false;
    }
    showStatus(status, "Received.", "success");
    return true;
  }
  function showStatus(el, message, kind = "") {
    el.textContent = message; el.dataset.kind = kind;
  }
  function makeNonce() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID().replace(/-/g, "");
    const b = new Uint8Array(16);
    window.crypto.getRandomValues(b);
    return Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
  }
})();