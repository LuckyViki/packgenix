/* packgenix-faq.js — FAQ accordion fallback for the static export.
 *
 * On the AllinCMS preview React renders and expands the FAQ answers, but
 * in the static export the answers exist only in the RSC flight data, so
 * the accordion buttons do nothing. The answers are injected into the
 * rendered HTML as <div class="pg-faq-answer"> siblings (see W4 cleanup),
 * and this script wires the buttons up with plain DOM code.
 * Dependency-free; safe to load on every page (no-ops when no FAQ exists).
 */
(function () {
  function init() {
    var buttons = document.querySelectorAll(
      'button[data-slot="accordion-trigger"]'
    );
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var item = btn.closest('[data-slot="accordion-item"]');
          var answer = item
            ? item.querySelector(".pg-faq-answer")
            : null;
          if (!answer) return; // defensive: missing answer div, do nothing
          var isOpen = answer.style.display === "block";
          answer.style.display = isOpen ? "none" : "block";
          btn.setAttribute("aria-expanded", isOpen ? "false" : "true");
          var svgs = btn.querySelectorAll("svg");
          for (var j = 0; j < svgs.length; j++) {
            var svg = svgs[j];
            var cls = svg.getAttribute("class") || "";
            if (cls.indexOf("chevron-down") !== -1) {
              svg.style.display = isOpen ? "inline" : "none";
            } else if (cls.indexOf("chevron-up") !== -1) {
              svg.style.display = isOpen ? "none" : "inline";
            }
          }
        });
      })(buttons[i]);
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
