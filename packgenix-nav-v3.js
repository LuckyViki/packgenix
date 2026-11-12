/* packgenix-nav.js — plain-JS navigation and form fallback for the Packgenix
   static site. The AllinCMS runtime (Base UI) does not hydrate on the static
   host, so its dropdowns, mobile sheet and contact dialog never open. This
   script replaces those three interactions with dependency-free code, and
   enables the contact form fields that the runtime leaves disabled.
   Loaded with `defer` on every page (see patch_forms.py). */
(function () {
  "use strict";

  var NAV = [
    { label: "All Products", href: "/products/", bold: true },
    { label: "Premade Pouch Packaging Machines", href: "/products/premade-pouch-packaging-machines" },
    { label: "VFFS Packaging Machines", href: "/products/vffs-packaging-machines" },
    { label: "Sachet Packaging Machines", href: "/products/sachet-packaging-machines" },
    { label: "Liquid & Blister Packaging Machines", href: "/products/liquid-blister-packaging-machines" },
    { label: "Film Wrapping Machines", href: "/products/film-wrapping-machines" },
    { label: "Labeling Machines", href: "/products/labeling-machines" }
  ];

  function el(tag, styles, text) {
    var n = document.createElement(tag);
    if (styles) {
      for (var k in styles) n.style[k] = styles[k];
    }
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- Desktop Products dropdown ---------- */
  var trigger = document.querySelector('button[data-slot="dropdown-menu-trigger"]');
  var menu = null;
  var menuOpen = false;

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    if (menu) menu.style.display = "none";
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    document.removeEventListener("click", onDocClick, true);
  }

  function onDocClick(e) {
    if (menu && (menu.contains(e.target) || (trigger && trigger.contains(e.target)))) return;
    closeMenu();
  }

  function openMenu() {
    if (!menu) {
      menu = el("div", {
        position: "fixed", zIndex: "100", display: "none",
        background: "#ffffff", border: "1px solid #e2e8f0",
        borderRadius: "12px", boxShadow: "0 12px 32px rgba(15,23,42,.16)",
        padding: "6px", minWidth: "290px", maxWidth: "92vw"
      });
      menu.setAttribute("role", "menu");
      NAV.forEach(function (item, i) {
        if (i === 1) {
          var div = el("div", { borderTop: "1px solid #f1f5f9", margin: "4px 2px" });
          menu.appendChild(div);
        }
        var a = el("a", {
          display: "block", padding: "10px 12px", borderRadius: "8px",
          color: "#0f172a", fontSize: "14px", lineHeight: "1.4",
          textDecoration: "none", fontWeight: item.bold ? "600" : "400",
          cursor: "pointer"
        }, item.label);
        a.href = item.href;
        a.setAttribute("role", "menuitem");
        a.addEventListener("mouseenter", function () { a.style.background = "#f1f5f9"; });
        a.addEventListener("mouseleave", function () { a.style.background = ""; });
        a.addEventListener("click", function () { closeMenu(); });
        menu.appendChild(a);
      });
      document.body.appendChild(menu);
    }
    var r = trigger.getBoundingClientRect();
    menu.style.visibility = "hidden";
    menu.style.display = "block";
    var w = menu.offsetWidth;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    menu.style.left = left + "px";
    menu.style.top = (r.bottom + 6) + "px";
    menu.style.visibility = "";
    menuOpen = true;
    trigger.setAttribute("aria-expanded", "true");
    document.addEventListener("click", onDocClick, true);
  }

  if (trigger) {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menuOpen) closeMenu();
      else openMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeMenu(); closeSheet(); }
    });
    window.addEventListener("resize", closeMenu);
  }

  /* ---------- Mobile menu (hamburger sheet replacement) ---------- */
  var burger = document.querySelector('button[data-slot="sheet-trigger"]');
  var sheetOverlay = null, sheetPanel = null, sheetOpen = false;

  function closeSheet() {
    if (!sheetOpen) return;
    sheetOpen = false;
    if (sheetOverlay) sheetOverlay.style.display = "none";
    if (sheetPanel) sheetPanel.style.display = "none";
    document.body.style.overflow = "";
    if (burger) burger.setAttribute("aria-expanded", "false");
  }

  function openSheet() {
    if (!sheetOverlay) {
      sheetOverlay = el("div", {
        position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
        background: "rgba(15,23,42,.5)", zIndex: "100", display: "none"
      });
      sheetOverlay.addEventListener("click", closeSheet);
      sheetPanel = el("div", {
        position: "fixed", top: "0", right: "0", bottom: "0",
        width: "min(340px, 88vw)", background: "#ffffff", zIndex: "101",
        display: "none", overflowY: "auto", padding: "20px",
        boxShadow: "-8px 0 32px rgba(15,23,42,.18)"
      });
      var head = el("div", {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: "12px", borderBottom: "1px solid #f1f5f9", marginBottom: "8px"
      });
      head.appendChild(el("span", { fontSize: "18px", fontWeight: "700", color: "#0f172a" }, "Menu"));
      var x = el("button", {
        width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #e2e8f0",
        background: "#ffffff", color: "#0f172a", fontSize: "18px", lineHeight: "1",
        cursor: "pointer"
      }, "\u00d7");
      x.setAttribute("aria-label", "Close menu");
      x.addEventListener("click", closeSheet);
      head.appendChild(x);
      sheetPanel.appendChild(head);

      function navLink(label, href, indent, bold) {
        var a = el("a", {
          display: "block", padding: "12px 8px", fontSize: indent ? "15px" : "16px",
          color: "#0f172a", textDecoration: "none", cursor: "pointer",
          paddingLeft: indent ? "24px" : "8px",
          fontWeight: bold ? "600" : "400",
          borderBottom: "1px solid #f1f5f9"
        }, label);
        a.href = href;
        a.addEventListener("click", closeSheet);
        sheetPanel.appendChild(a);
      }
      navLink("Home", "/");
      navLink("Products", "/products/", false, true);
      NAV.slice(1).forEach(function (item) { navLink(item.label, item.href, true); });
      navLink("News", "/posts?category=news");
      navLink("About Us", "/about");
      navLink("Contact", "/contact");
      var cta = el("a", {
        display: "block", textAlign: "center", marginTop: "20px",
        background: "#D5995D", color: "#ffffff", fontSize: "16px", fontWeight: "600",
        padding: "14px", borderRadius: "10px", textDecoration: "none", cursor: "pointer"
      }, "GET A QUOTE");
      cta.href = "/contact";
      cta.addEventListener("click", closeSheet);
      sheetPanel.appendChild(cta);

      document.body.appendChild(sheetOverlay);
      document.body.appendChild(sheetPanel);
    }
    sheetOverlay.style.display = "block";
    sheetPanel.style.display = "block";
    document.body.style.overflow = "hidden";
    sheetOpen = true;
    if (burger) burger.setAttribute("aria-expanded", "true");
  }

  if (burger) {
    burger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (sheetOpen) closeSheet();
      else openSheet();
    });
  }

  /* ---------- Contact form: enable fields the runtime leaves disabled ----------
     The AllinCMS form wraps its controls in a <fieldset disabled> that sits
     OUTSIDE the <form> element, so enabling only the inputs is not enough:
     a disabled fieldset keeps every descendant disabled. Remove disabled
     from the fieldset and from every control, page-wide (the only disabled
     controls on this site are the inquiry form's). Also clear the Base UI
     data-disabled styling hook so the submit button looks enabled. */
  function enableForms() {
    var fields = document.querySelectorAll("input[disabled], textarea[disabled], select[disabled], button[disabled], fieldset[disabled]");
    for (var j = 0; j < fields.length; j++) fields[j].removeAttribute("disabled");
    var dd = document.querySelectorAll("form [data-disabled], fieldset[data-disabled]");
    for (var k = 0; k < dd.length; k++) dd[k].removeAttribute("data-disabled");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enableForms);
  } else {
    enableForms();
  }
  /* Re-run shortly after load in case the runtime re-renders the form. */
  setTimeout(enableForms, 1200);

  /* ---------- GET A QUOTE modal (replaces the dead AllinCMS dialog) ----------
     Clicking any GET A QUOTE button opens our own dialog with the inquiry
     form (same fields as the Contact page). The form is a real <form>, so
     packgenix-form.js intercepts its submit and posts to /api/contact. */
  var modalOverlay = null, modalOpen = false;

  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false;
    if (modalOverlay) modalOverlay.style.display = "none";
    document.body.style.overflow = "";
    /* If the form was replaced by a thank-you message after a successful
       submit, drop the whole modal so the next open builds a fresh form. */
    if (modalOverlay && !document.getElementById("pg-quote-form")) {
      modalOverlay.remove();
      modalOverlay = null;
    }
  }

  function inputStyle() {
    return {
      width: "100%", boxSizing: "border-box", padding: "10px 12px",
      border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "15px",
      color: "#0f172a", background: "#ffffff", marginBottom: "14px", outline: "none"
    };
  }

  function buildModal() {
    modalOverlay = el("div", {
      position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
      background: "rgba(15,23,42,.55)", zIndex: "200", display: "none",
      alignItems: "center", justifyContent: "center", padding: "16px"
    });
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) closeModal();
    });
    var dialog = el("div", {
      background: "#ffffff", borderRadius: "16px", maxWidth: "480px", width: "100%",
      maxHeight: "90vh", overflowY: "auto", padding: "28px",
      boxShadow: "0 24px 64px rgba(15,23,42,.25)"
    });
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Send the details");
    var head = el("div", {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: "6px"
    });
    head.appendChild(el("span", { fontSize: "22px", fontWeight: "700", color: "#0f172a" }, "Send the details"));
    var x = el("button", {
      width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #e2e8f0",
      background: "#ffffff", color: "#0f172a", fontSize: "18px", lineHeight: "1",
      cursor: "pointer", flexShrink: "0"
    }, "\u00d7");
    x.setAttribute("aria-label", "Close");
    x.addEventListener("click", closeModal);
    head.appendChild(x);
    dialog.appendChild(head);
    dialog.appendChild(el("p", {
      fontSize: "14px", lineHeight: "1.6", color: "#475569", margin: "0 0 20px"
    }, "Tell us about your product and packaging needs, and we'll reply with a tailored quote."));
    var form = document.createElement("form");
    form.id = "pg-quote-form";
    form.method = "post";
    var fields = [
      { label: "Name *", name: "name", type: "text", ph: "Your name", tag: "input" },
      { label: "Email *", name: "email", type: "email", ph: "you@example.com", tag: "input" },
      { label: "Phone *", name: "phone", type: "text", ph: "+1 555 0000", tag: "input" },
      { label: "Message *", name: "message", type: "", ph: "Product, material, filling weight, package size, required speed\u2026", tag: "textarea" }
    ];
    fields.forEach(function (f) {
      var lab = el("label", {
        display: "block", fontSize: "13px", fontWeight: "600", color: "#0f172a",
        marginBottom: "6px"
      }, f.label);
      lab.setAttribute("for", "pg-" + f.name);
      form.appendChild(lab);
      var inp;
      if (f.tag === "textarea") {
        inp = el("textarea", inputStyle());
        inp.rows = 4;
      } else {
        inp = el("input", inputStyle());
        inp.type = f.type;
      }
      inp.id = "pg-" + f.name;
      inp.name = f.name;
      inp.placeholder = f.ph;
      inp.required = true;
      form.appendChild(inp);
    });
    var submit = el("button", {
      width: "100%", background: "#D5995D", color: "#ffffff", fontSize: "16px",
      fontWeight: "600", padding: "14px", borderRadius: "10px", border: "none",
      cursor: "pointer", marginTop: "4px"
    }, "Get a Free Quote");
    submit.type = "submit";
    form.appendChild(submit);
    dialog.appendChild(form);
    var foot = el("p", {
      fontSize: "12px", lineHeight: "1.6", color: "#94a3b8", margin: "14px 0 0", textAlign: "center"
    }, "Or email us directly: ");
    var mail = el("a", { color: "#2563eb", textDecoration: "none", cursor: "pointer" }, "export@packgenix.com");
    mail.href = "mailto:export@packgenix.com";
    foot.appendChild(mail);
    dialog.appendChild(foot);
    modalOverlay.appendChild(dialog);
    document.body.appendChild(modalOverlay);
  }

  function openModal() {
    if (!modalOverlay) buildModal();
    modalOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    modalOpen = true;
  }

  var ctas = document.querySelectorAll('a[href="#contact-dialog-form-modal-1"]');
  for (var k = 0; k < ctas.length; k++) {
    ctas[k].addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
})();
