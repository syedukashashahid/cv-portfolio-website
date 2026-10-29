/* ==========================================================================
   Syed Ukasha Shahid — Portfolio
   Shared script for all pages. Vanilla JavaScript, no libraries.

   Every feature is progressive: the site is fully readable and navigable
   with JavaScript turned off. Motion is skipped when the visitor has
   asked for reduced motion, and pointer effects only run on devices with
   a precise pointer (mouse or trackpad).
   ========================================================================== */
(function () {
  "use strict";

  // Tells the failsafe in each page's <head> that the script loaded.
  window.__siteReady = true;

  var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  var CONTACT_EMAIL = "syedukashashahid@gmail.com";

  function reduceMotion() { return motionQuery.matches; }
  function finePointer() { return finePointerQuery.matches; }


  /* 1. Navigation: mobile menu, focus handling, header shadow ------------ */
  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.getElementById("site-menu");
    if (!header || !toggle || !menu) return;

    var label = toggle.querySelector(".nav-toggle-label");
    var mobileQuery = window.matchMedia("(max-width: 959px)");

    function isOpen() { return toggle.getAttribute("aria-expanded") === "true"; }

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Close" : "Menu";

      if (open) {
        // Wait one frame so the panel is visible (and focusable) first.
        var first = menu.querySelector("a");
        if (first) window.requestAnimationFrame(function () { first.focus({ preventScroll: true }); });
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () { setOpen(!isOpen(), true); });

    // Escape closes the menu; Tab stays inside the menu while it is open.
    document.addEventListener("keydown", function (event) {
      if (!isOpen()) return;

      if (event.key === "Escape") {
        setOpen(false, true);
        return;
      }

      if (event.key === "Tab") {
        var focusables = [toggle].concat(Array.prototype.slice.call(menu.querySelectorAll("a[href], [tabindex='0']")));
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Close after choosing a link (matters for same-page links).
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false, false);
    });

    // Leaving the mobile layout always closes the menu.
    var onLayoutChange = function (event) { if (!event.matches && isOpen()) setOpen(false, false); };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", onLayoutChange);
    else if (mobileQuery.addListener) mobileQuery.addListener(onLayoutChange);

    // Subtle shadow once the page scrolls.
    var ticking = false;
    function updateHeader() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateHeader); }
    }, { passive: true });
    updateHeader();
  }


  /* 2. Active navigation state ----------------------------------------- */
  // Each page already marks its own link with aria-current="page" in the
  // HTML. This keeps it correct if the site is served with clean URLs
  // (e.g. /about instead of /about.html). If nothing matches, the HTML
  // value is left alone.
  function initActiveLink() {
    var normalise = function (value) {
      var file = (value || "").split("#")[0].split("?")[0].split("/").pop();
      if (!file) file = "index.html";
      return file.replace(/\.html?$/i, "").toLowerCase();
    };
    var current = normalise(window.location.pathname);
    var links = document.querySelectorAll(".nav-link");
    var matched = Array.prototype.filter.call(links, function (link) {
      return normalise(link.getAttribute("href")) === current;
    });
    if (!matched.length) return;
    Array.prototype.forEach.call(links, function (link) {
      if (matched.indexOf(link) > -1) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }


  /* 3. Scroll reveal with 3D entrance and stagger ---------------------- */
  // Elements marked [data-reveal] start hidden (CSS, only when JS runs).
  // When a batch of them enters the viewport together, they are revealed
  // in document order with a short stagger: heading, text, then buttons.
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (!items.length) return;

    if (reduceMotion() || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var STEP = 90;      // ms between items in one batch
    var MAX_DELAY = 540;

    var observer = new IntersectionObserver(function (entries) {
      var entering = entries
        .filter(function (entry) { return entry.isIntersecting; })
        .map(function (entry) { return entry.target; })
        .sort(function (a, b) {
          return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
        });

      entering.forEach(function (el, index) {
        el.style.setProperty("--d", Math.min(index * STEP, MAX_DELAY) + "ms");
        el.classList.add("is-visible");
        observer.unobserve(el);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });

    items.forEach(function (el) { observer.observe(el); });
  }


  /* 4. 3D tilt for project visuals ------------------------------------- */
  // Rotates the element a few degrees toward the pointer. Layers inside
  // it sit at different translateZ depths, so they shift at different
  // speeds. Disabled for touch and reduced motion.
  function initTilt() {
    if (reduceMotion() || !finePointer()) return;

    var tiltables = document.querySelectorAll("[data-tilt]");
    if (!tiltables.length) return;

    Array.prototype.forEach.call(tiltables, function (el) {
      var maxDeg = parseFloat(el.getAttribute("data-tilt")) || 7;
      var rect = null;
      var frame = 0;
      var pointerX = 0;
      var pointerY = 0;

      function render() {
        frame = 0;
        if (!rect) return;
        var x = Math.min(Math.max((pointerX - rect.left) / rect.width, 0), 1);
        var y = Math.min(Math.max((pointerY - rect.top) / rect.height, 0), 1);
        el.style.setProperty("--ry", ((x - 0.5) * 2 * maxDeg).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - y) * 2 * maxDeg).toFixed(2) + "deg");
        el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
      }

      function reset() {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        rect = null;
        el.classList.remove("is-tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      }

      el.addEventListener("pointerenter", function (event) {
        if (event.pointerType !== "mouse") return;
        rect = el.getBoundingClientRect();
        el.classList.add("is-tilting");
      });

      el.addEventListener("pointermove", function (event) {
        if (event.pointerType !== "mouse") return;
        if (!rect) { rect = el.getBoundingClientRect(); el.classList.add("is-tilting"); }
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = window.requestAnimationFrame(render);
      });

      el.addEventListener("pointerleave", reset);

      // Page scroll moves the element, so measure again on the next move.
      window.addEventListener("scroll", function () { rect = null; }, { passive: true });
    });
  }


  /* 5. Home hero: pointer parallax on the portrait --------------------- */
  // Writes --px / --py in the range -1…1. CSS uses them to shift the
  // plate, frame, photo and badge by different amounts.
  function initHeroParallax() {
    var hero = document.querySelector("[data-hero]");
    var visual = document.querySelector("[data-hero-visual]");
    if (!hero || !visual || reduceMotion() || !finePointer()) return;

    var frame = 0;
    var targetX = 0;
    var targetY = 0;

    function render() {
      frame = 0;
      visual.style.setProperty("--px", targetX.toFixed(3));
      visual.style.setProperty("--py", targetY.toFixed(3));
    }

    hero.addEventListener("pointermove", function (event) {
      if (event.pointerType !== "mouse") return;
      var rect = visual.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;
      // Normalise against the viewport so movement stays gentle.
      targetX = Math.max(-1, Math.min(1, (event.clientX - cx) / (window.innerWidth / 2)));
      targetY = Math.max(-1, Math.min(1, (event.clientY - cy) / (window.innerHeight / 2)));
      if (!frame) frame = window.requestAnimationFrame(render);
    });

    hero.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      if (!frame) frame = window.requestAnimationFrame(render);
    });
  }


  /* 6. Scroll-based parallax for decorative layers --------------------- */
  // [data-parallax="0.1"] moves the element at 10% of its distance from
  // the viewport centre. Only elements near the viewport are updated.
  function initScrollParallax() {
    var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!layers.length || reduceMotion()) return;

    var active = new Set();
    var ticking = false;
    var LIMIT = 90; // px, keeps movement subtle

    function update() {
      ticking = false;
      var viewportCentre = window.innerHeight / 2;
      active.forEach(function (el) {
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
        var current = el.__py || 0;
        var rect = el.getBoundingClientRect();
        // Remove our own offset so the measurement does not feed back.
        var centre = rect.top - current + rect.height / 2;
        var offset = Math.max(-LIMIT, Math.min(LIMIT, (centre - viewportCentre) * -speed));
        el.__py = offset;
        el.style.setProperty("--py", offset.toFixed(1) + "px");
      });
    }

    function request() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    if ("IntersectionObserver" in window) {
      var watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) active.add(entry.target);
          else active.delete(entry.target);
        });
        request();
      }, { rootMargin: "120px 0px" });
      layers.forEach(function (el) { watcher.observe(el); });
    } else {
      layers.forEach(function (el) { active.add(el); });
    }

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
  }


  /* 7. Page transitions between the HTML pages ------------------------- */
  // Entrance: pure CSS (.page-enter on <main>).
  // Exit: a 180 ms fade on ordinary left-clicks to other pages of this
  // site, then normal navigation. Downloads, new tabs, modified clicks,
  // mail/phone links and in-page anchors are never intercepted.
  function initPageTransitions() {
    // Back/forward cache can restore a faded page; always undo the fade.
    window.addEventListener("pageshow", function () {
      document.body.classList.remove("is-leaving");
    });

    if (reduceMotion()) return;

    document.addEventListener("click", function (event) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      var link = event.target.closest("a[href]");
      if (!link) return;
      if (link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto|tel):/i.test(href)) return;

      var url;
      try { url = new URL(link.href, window.location.href); } catch (err) { return; }
      if (url.origin !== window.location.origin) return;
      if (!/(\.html?|\/)$/i.test(url.pathname)) return;           // pages only
      if (url.pathname === window.location.pathname && url.hash) return;

      event.preventDefault();
      document.body.classList.add("is-leaving");
      window.setTimeout(function () { window.location.href = url.href; }, 180);
    });
  }


  /* 8. Back-to-top button --------------------------------------------- */
  function initBackToTop() {
    var button = document.querySelector(".to-top");
    if (!button) return;
    button.hidden = false;

    var ticking = false;
    function update() {
      ticking = false;
      var longPage = document.documentElement.scrollHeight > window.innerHeight * 1.8;
      button.classList.toggle("is-shown", longPage && window.scrollY > window.innerHeight * 0.8);
    }

    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
      var main = document.getElementById("main");
      if (main) main.focus({ preventScroll: true });
    });
  }


  /* 9. Missing profile image fallback ---------------------------------- */
  // Each <img> also has an inline onerror handler, which catches errors
  // that happen before this script runs. This is a second check.
  function initImageFallbacks() {
    document.querySelectorAll("[data-portrait] img").forEach(function (img) {
      var holder = img.closest("[data-portrait]");
      var markMissing = function () { holder.classList.add("is-missing"); };
      if (img.complete && img.naturalWidth === 0) markMissing();
      img.addEventListener("error", markMissing);
    });
  }


  /* 10. CV availability ------------------------------------------------ */
  // When the site runs on a web server, check that the PDF exists. If the
  // server answers 404, the CV buttons are disabled and say so, rather
  // than leading to an error page. Browsers do not allow this check for
  // pages opened directly from disk (file://), so it is skipped there.
  function initCvCheck() {
    var links = document.querySelectorAll("[data-cv]");
    if (!links.length || !/^https?:$/.test(window.location.protocol) || !window.fetch) return;

    var href = links[0].getAttribute("href");
    window.fetch(href, { method: "HEAD", cache: "no-store" })
      .then(function (response) {
        if (response.status === 404) markCvMissing(links);
      })
      .catch(function () { /* Network problem: leave the links as they are. */ });
  }

  function markCvMissing(links) {
    Array.prototype.forEach.call(links, function (link) {
      link.removeAttribute("href");
      link.removeAttribute("download");
      link.setAttribute("role", "link");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "0");
      link.setAttribute("title", "The CV file has not been added to the site yet.");
      var label = link.querySelector("[data-cv-label]");
      if (label) label.textContent = "CV not available yet";
    });
  }


  /* 11. Contact form validation --------------------------------------- */
  // The site has no server, so the form cannot deliver a message itself.
  // After validation it opens the visitor's email app with the message
  // filled in, and says clearly that nothing has been sent yet.
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    form.setAttribute("novalidate", "");   // use the custom messages below
    var status = form.querySelector(".form-status");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (value) {
        if (!value) return "Enter your name.";
        if (value.length < 2) return "Your name needs at least 2 characters.";
        return "";
      },
      email: function (value) {
        if (!value) return "Enter your email address.";
        if (!emailPattern.test(value)) return "Enter an email address like name@example.com.";
        return "";
      },
      subject: function (value) {
        if (!value) return "Enter a subject.";
        return "";
      },
      message: function (value) {
        if (!value) return "Write your message.";
        if (value.length < 10) return "Your message needs at least 10 characters.";
        return "";
      }
    };

    function check(field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var message = rule(field.value.trim());
      var error = document.getElementById(field.name + "-error");
      field.setAttribute("aria-invalid", message ? "true" : "false");
      if (error) error.textContent = message;
      return !message;
    }

    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener("blur", function () {
        if (field.value.trim() || field.getAttribute("aria-invalid") === "true") check(field);
      });
      field.addEventListener("input", function () {
        if (field.getAttribute("aria-invalid") === "true") check(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        if (field && !check(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.className = "form-status is-error";
        status.textContent = "Some fields need attention. Check the messages under each field.";
        firstInvalid.focus();
        return;
      }

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var subject = form.elements.subject.value.trim();
      var message = form.elements.message.value.trim();
      var body = message + "\n\n" + name + "\n" + email;
      var mailto = "mailto:" + CONTACT_EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      status.className = "form-status is-info";
      status.innerHTML =
        "Your email app should now open with this message filled in. " +
        "<strong>Nothing has been sent yet</strong>: review it there and press Send. " +
        "If no email app opened, write to " +
        '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a> directly.";

      window.location.href = mailto;
    });
  }


  /* 12. Footer year --------------------------------------------------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }


  /* Start --------------------------------------------------------------- */
  function start() {
    initNav();
    initActiveLink();
    initReveal();
    initTilt();
    initHeroParallax();
    initScrollParallax();
    initPageTransitions();
    initBackToTop();
    initImageFallbacks();
    initCvCheck();
    initContactForm();
    initYear();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
