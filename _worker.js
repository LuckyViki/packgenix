/**
 * Packgenix Pages Worker (Advanced mode, _worker.js).
 * Handles every request: the inquiry form API + the /home redirect,
 * everything else falls through to the static assets.
 *
 * POST /api/contact — JSON or form-encoded inquiry, sends to
 * export@packgenix.com via Resend (needs the RESEND_API_KEY secret and
 * the packgenix.com domain verified in Resend).
 * POST /contact — no-JS fallback for the contact page form, returns a
 * thank-you HTML page.
 * /home or /home/ — 301 to / (Pages _redirects is not applied in
 * Advanced mode, so the rule lives here).
 */

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "Content-Type": "application/json" },
  });
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function readInquiry(request) {
  const data = {};
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    Object.assign(data, await request.json());
  } else {
    const fd = await request.formData();
    fd.forEach((v, k) => {
      data[k] = v;
    });
  }
  return {
    name: String(data.name || "").trim().slice(0, 100),
    email: String(data.email || "").trim().slice(0, 200),
    phone: String(data.phone || "").trim().slice(0, 50),
    message: String(data.message || "").trim().slice(0, 5000),
    page: String(data.page || "").slice(0, 300),
    product: String(data.product || "").slice(0, 300),
  };
}

function validate(inq) {
  if (!inq.name || !inq.email || !inq.message) {
    return "Name, email and message are required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inq.email)) {
    return "Please enter a valid email address.";
  }
  return null;
}

async function sendInquiry(env, inq) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, status: 503, error: "Email service is not configured yet." };
  }
  const subject = "New inquiry from " + inq.name + " — Packgenix website";
  const textLines = [
    "New inquiry from the Packgenix website.",
    "",
    "Name: " + inq.name,
    "Email: " + inq.email,
    "Phone: " + (inq.phone || "-"),
    "Page: " + (inq.page || "-"),
    "Product / page title: " + (inq.product || "-"),
    "",
    "Message:",
    inq.message,
  ];
  const html =
    "<h2>New inquiry from the Packgenix website</h2>" +
    "<p><strong>Name:</strong> " + esc(inq.name) + "<br>" +
    "<strong>Email:</strong> " + esc(inq.email) + "<br>" +
    "<strong>Phone:</strong> " + esc(inq.phone || "-") + "<br>" +
    "<strong>Page:</strong> " + esc(inq.page || "-") + "<br>" +
    "<strong>Product / page title:</strong> " + esc(inq.product || "-") + "</p>" +
    "<p><strong>Message:</strong></p><p>" + esc(inq.message).replace(/\n/g, "<br>") + "</p>";

  let res;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Packgenix Website <website@packgenix.com>",
        to: ["export@packgenix.com"],
        reply_to: inq.email,
        subject: subject,
        text: textLines.join("\n"),
        html: html,
      }),
    });
  } catch (e) {
    return { ok: false, status: 502, error: "Could not reach the email service. Please try again or email export@packgenix.com directly." };
  }
  if (!res.ok) {
    return { ok: false, status: 502, error: "Email send failed. Please try again or email export@packgenix.com directly." };
  }
  return { ok: true, status: 200 };
}

function thanksPage() {
  return new Response(
    "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Thank You | Packgenix</title>" +
    "<style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#FFF;color:#475569;}" +
    ".wrap{max-width:720px;margin:0 auto;padding:96px 24px;text-align:center;}" +
    "h1{color:#0F172A;font-size:32px;margin:0 0 16px;}p{font-size:16px;line-height:1.6;margin:0 0 32px;}" +
    "a.btn{display:inline-block;background:#2563EB;color:#FFF;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:16px;margin:0 8px;}" +
    "a.link{color:#2563EB;}</style></head><body><div class=\"wrap\">" +
    "<h1>Thank You! Your inquiry has been sent.</h1>" +
    "<p>Our team will get back to you shortly. If you need an urgent reply, email us directly at " +
    "<a class=\"link\" href=\"mailto:export@packgenix.com\">export@packgenix.com</a>.</p>" +
    "<a class=\"btn\" href=\"/\">Back to Homepage</a>" +
    "<a class=\"btn\" href=\"/products/\">Browse Products</a>" +
    "</div></body></html>",
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function errorPage(message) {
  return new Response(
    "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
    "<title>Submission Failed | Packgenix</title>" +
    "<style>body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#FFF;color:#475569;}" +
    ".wrap{max-width:720px;margin:0 auto;padding:96px 24px;text-align:center;}" +
    "h1{color:#0F172A;font-size:28px;margin:0 0 16px;}p{font-size:16px;line-height:1.6;margin:0 0 32px;}" +
    "a.btn{display:inline-block;background:#2563EB;color:#FFF;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:16px;margin:0 8px;}" +
    "a.link{color:#2563EB;}</style></head><body><div class=\"wrap\">" +
    "<h1>Submission Failed</h1><p>" + esc(message) + "</p>" +
    "<p>Please try again, or email us directly at " +
    "<a class=\"link\" href=\"mailto:export@packgenix.com\">export@packgenix.com</a>.</p>" +
    "<a class=\"btn\" href=\"/contact/\">Back to Contact</a>" +
    "</div></body></html>",
    { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // /home -> / (Pages _redirects is not applied in Advanced mode)
    if (path === "/home" || path === "/home/") {
      return Response.redirect(url.origin + "/", 301);
    }

    if (path === "/api/contact") {
      if (request.method !== "POST") {
        return json({ ok: false, error: "Method not allowed." }, 405);
      }
      let inq;
      try {
        inq = await readInquiry(request);
      } catch (e) {
        return json({ ok: false, error: "Invalid request body." }, 400);
      }
      const err = validate(inq);
      if (err) return json({ ok: false, error: err }, 400);
      const result = await sendInquiry(env, inq);
      if (!result.ok) return json({ ok: false, error: result.error }, result.status);
      return json({ ok: true });
    }

    // No-JS fallback: the contact page form posts here as plain form data.
    if ((path === "/contact" || path === "/contact/") && request.method === "POST") {
      let inq;
      try {
        inq = await readInquiry(request);
      } catch (e) {
        return errorPage("Invalid request. Please try again.");
      }
      const err = validate(inq);
      if (err) return errorPage(err);
      const result = await sendInquiry(env, inq);
      if (!result.ok) return errorPage(result.error);
      return thanksPage();
    }

    return env.ASSETS.fetch(request);
  },
};
