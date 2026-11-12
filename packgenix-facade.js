/* YouTube click-to-load facades.
 * The static export embeds autoplaying muted YouTube players (heavy: the
 * player JS and the video stream load on every product page, and autoplay
 * was already decided off). Replace each embed with a lightweight
 * thumbnail + play button; the real player loads only when the visitor
 * clicks. Layout is preserved by copying the iframe's own classes.
 */
(function () {
  function makeFacade(iframe) {
    var src = iframe.getAttribute("src") || "";
    var m = src.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
    if (!m) return;
    var id = m[1];
    var title = iframe.getAttribute("title") || "Video";
    var div = document.createElement("div");
    div.className = (iframe.className || "").replace("pointer-events-none", "").trim();
    div.setAttribute("role", "button");
    div.setAttribute("tabindex", "0");
    div.setAttribute("aria-label", "Play video: " + title);
    div.style.cssText =
      "background-image:url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg);" +
      "background-size:cover;background-position:center;cursor:pointer;" +
      "display:flex;align-items:center;justify-content:center;";
    var safeTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    div.innerHTML =
      '<span style="display:flex;align-items:center;justify-content:center;width:68px;height:48px;border-radius:12px;background:rgba(255,0,0,0.9);color:#fff;font-size:22px;">&#9654;</span>' +
      '<span style="position:absolute;left:12px;bottom:10px;right:12px;color:#fff;font-size:13px;line-height:1.4;text-shadow:0 1px 4px rgba(0,0,0,0.8);">' +
      safeTitle +
      "</span>";
    function load() {
      var fresh = iframe.cloneNode(true);
      fresh.setAttribute("src", src);
      div.replaceWith(fresh);
    }
    div.addEventListener("click", load);
    div.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        load();
      }
    });
    iframe.replaceWith(div);
  }

  function run() {
    document
      .querySelectorAll('iframe[src*="youtube.com/embed/"]')
      .forEach(makeFacade);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
