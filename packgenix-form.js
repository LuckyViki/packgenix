/* Packgenix inquiry form interceptor.
 * The static export's forms submit to the AllinCMS backend, which no longer
 * exists. This script catches every inquiry form submit (contact page form
 * and the global Request-a-Quote modal, both rendered by React) and posts
 * the data to the /api/contact Pages Function instead.
 * It runs in the capture phase so React's own submit handler never fires.
 */
(function () {
  function isInquiryForm(form) {
    if (!form || form.tagName !== "FORM") return false;
    return !!form.querySelector('input[type="email"], input[name="email"]');
  }

  function showError(form, msg) {
    var old = form.querySelector("[data-packgenix-form-error]");
    if (old) old.remove();
    var div = document.createElement("div");
    div.setAttribute("data-packgenix-form-error", "1");
    div.textContent = msg;
    div.style.cssText =
      "margin:12px 0;padding:12px 16px;border-radius:6px;background:#FEF2F2;color:#B91C1C;font-size:14px;line-height:1.5;";
    form.appendChild(div);
  }

  function showThanks(form) {
    var div = document.createElement("div");
    div.style.cssText =
      "padding:32px 8px;text-align:center;color:#0F172A;";
    div.innerHTML =
      '<p style="font-size:20px;font-weight:600;margin:0 0 12px;">Thank you! Your inquiry has been sent.</p>' +
      '<p style="font-size:15px;line-height:1.6;color:#475569;margin:0;">Our team will get back to you shortly. ' +
      'If you need an urgent reply, email us directly at ' +
      '<a href="mailto:export@packgenix.com" style="color:#2563EB;">export@packgenix.com</a>.</p>';
    form.replaceWith(div);
  }

  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!isInquiryForm(form)) return;
      e.preventDefault();
      e.stopPropagation();

      var btn = form.querySelector('button[type="submit"], input[type="submit"]');
      var originalLabel = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        if (btn.tagName === "BUTTON") btn.textContent = "Sending…";
      }

      var fd = new FormData(form);
      var data = {};
      fd.forEach(function (v, k) {
        data[k] = v;
      });
      data.page = location.href;
      var title = document.querySelector("title");
      data.product = title ? title.textContent : "";

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().catch(function () {
            return {};
          }).then(function (out) {
            return { res: res, out: out };
          });
        })
        .then(function (r) {
          if (r.res.ok && r.out && r.out.ok) {
            showThanks(form);
          } else {
            showError(
              form,
              (r.out && r.out.error) ||
                "Submission failed. Please try again or email export@packgenix.com directly."
            );
            if (btn) {
              btn.disabled = false;
              if (btn.tagName === "BUTTON") btn.textContent = originalLabel;
            }
          }
        })
        .catch(function () {
          showError(
            form,
            "Network error. Please try again or email export@packgenix.com directly."
          );
          if (btn) {
            btn.disabled = false;
            if (btn.tagName === "BUTTON") btn.textContent = originalLabel;
          }
        });
    },
    true
  );
})();
