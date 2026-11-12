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

  /* ---------- Contact form: enable fields the runtime leaves disabled ---------- */
  function enableForms() {
    var forms = document.querySelectorAll("form");
    for (var i = 0; i < forms.length; i++) {
      var fields = forms[i].querySelectorAll("input[disabled], textarea[disabled], select[disabled], button[disabled]");
      for (var j = 0; j < fields.length; j++) fields[j].removeAttribute("disabled");
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enableForms);
  } else {
    enableForms();
  }
  /* Re-run shortly after load in case the runtime re-renders the form. */
  setTimeout(enableForms, 1200);

  /* ---------- GET A QUOTE: fall back to /contact if no dialog opens ---------- */
  var ctas = document.querySelectorAll('a[href="#contact-dialog-form-modal-1"]');
  for (var k = 0; k < ctas.length; k++) {
    ctas[k].addEventListener("click", function () {
      setTimeout(function () {
        if (!document.querySelector('[role="dialog"]')) {
          window.location.href = "/contact";
        }
      }, 800);
    });
  }
})();
