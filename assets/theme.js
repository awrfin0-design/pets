(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Mobile menu ---------- */
  function initNav() {
    var toggle = $("[data-nav-toggle]");
    var nav = $("[data-nav]");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Drag-to-scroll carousel ---------- */
  function initDragScroll() {
    $$("[data-drag-scroll]").forEach(function (track) {
      var down = false, startX = 0, startLeft = 0, moved = false;
      track.addEventListener("pointerdown", function (e) {
        if (e.pointerType === "touch") return; // native touch scrolling
        down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      });
      window.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) { moved = true; track.classList.add("is-dragging"); }
        track.scrollLeft = startLeft - dx;
      });
      window.addEventListener("pointerup", function () {
        if (!down) return;
        down = false;
        setTimeout(function () { track.classList.remove("is-dragging"); }, 0);
      });
      track.addEventListener("click", function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
      track.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") track.scrollBy({ left: 300, behavior: "smooth" });
        if (e.key === "ArrowLeft") track.scrollBy({ left: -300, behavior: "smooth" });
      });
    });
  }

  /* ---------- Product slides + dots ---------- */
  function initSlides() {
    $$("[data-slides]").forEach(function (wrap) {
      var slides = $$("[data-slide]", wrap);
      var dots = $$("[data-slide-to]", wrap);
      if (!slides.length || !("IntersectionObserver" in window)) return;

      function setActive(i) {
        dots.forEach(function (d, n) { d.classList.toggle("is-active", n === i); });
      }
      setActive(0);

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(slides.indexOf(e.target));
        });
      }, { threshold: 0.55 });
      slides.forEach(function (s) { io.observe(s); });

      var wio = new IntersectionObserver(function (entries) {
        wrap.classList.toggle("is-active", entries[0].isIntersecting);
      }, { threshold: 0.2 });
      wio.observe(wrap);

      dots.forEach(function (d) {
        d.addEventListener("click", function () {
          slides[+d.dataset.slideTo].scrollIntoView({ behavior: "smooth" });
        });
      });
    });
  }

  /* ---------- Product page ---------- */
  function initProduct() {
    var root = $("[data-product]");
    if (!root) return;

    // gallery
    var mains = $$("[data-main-image]", root);
    var thumbs = $$("[data-thumb]", root);
    function showMedia(id) {
      mains.forEach(function (img) { img.hidden = String(img.dataset.mediaId) !== String(id); });
      thumbs.forEach(function (t) { t.classList.toggle("is-active", String(t.dataset.thumb) === String(id)); });
    }
    thumbs.forEach(function (t) { t.addEventListener("click", function () { showMedia(t.dataset.thumb); }); });

    // variants
    var form = $("#product-form", root);
    var json = $("[data-variants]", root);
    if (!form || !json) return;
    var variants = JSON.parse(json.textContent);
    var idInput = $("[data-variant-id]", form);
    var addBtn = $("[data-add]", form);
    var priceEl = $("[data-price]", root);
    var fieldsets = $$("[data-option-index]", form);
    var money = function (cents) {
      var fmt = (window.Shopify && Shopify.formatMoney) ? Shopify.formatMoney(cents, window.theme_money_format || "${{amount}}") : null;
      if (fmt) return fmt;
      return new Intl.NumberFormat(document.documentElement.lang || "en", { style: "currency", currency: (window.Shopify && Shopify.currency && Shopify.currency.active) || "USD" }).format(cents / 100);
    };

    function selected() {
      return fieldsets.map(function (fs) {
        var c = $("input:checked", fs);
        return c ? c.value : null;
      });
    }
    function match(opts) {
      return variants.find(function (v) {
        return v.options.every(function (o, i) { return opts[i] === o; });
      });
    }
    function markAvailability() {
      var opts = selected();
      fieldsets.forEach(function (fs, i) {
        $$("input", fs).forEach(function (inp) {
          var test = opts.slice(); test[i] = inp.value;
          var v = variants.find(function (x) {
            return x.options.every(function (o, n) { return test[n] === o; });
          });
          inp.closest(".opt__pill").classList.toggle("is-unavailable", !v || !v.available);
        });
      });
    }
    function update() {
      var v = match(selected());
      if (!v) { if (addBtn) addBtn.disabled = true; return; }
      idInput.value = v.id;
      if (priceEl) {
        priceEl.innerHTML = (v.compare_at_price && v.compare_at_price > v.price ? "<s>" + money(v.compare_at_price) + "</s> " : "") + money(v.price);
      }
      if (addBtn) addBtn.disabled = !v.available;
      if (v.featured_media && v.featured_media.id) showMedia(v.featured_media.id);
      markAvailability();
      var url = new URL(window.location.href);
      url.searchParams.set("variant", v.id);
      window.history.replaceState({}, "", url.toString());
    }
    form.addEventListener("change", function (e) {
      if (e.target.matches(".opt input")) update();
    });
    markAvailability();

    // quantity
    var qty = $("[data-qty]", form);
    var minus = $("[data-qty-minus]", form);
    var plus = $("[data-qty-plus]", form);
    if (qty && minus && plus) {
      minus.addEventListener("click", function () { qty.value = Math.max(1, (+qty.value || 1) - 1); });
      plus.addEventListener("click", function () { qty.value = (+qty.value || 1) + 1; });
    }
  }

  /* ---------- Product recommendations ---------- */
  function initRecs() {
    var el = $("[data-recs]");
    if (!el || !window.themeRoutes || !window.themeRoutes.recs) return;
    var url = window.themeRoutes.recs + "?section_id=" + el.dataset.sectionId + "&product_id=" + el.dataset.productId + "&limit=" + (el.dataset.limit || 4);
    fetch(url).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var fresh = $("[data-recs]", doc);
      if (fresh && fresh.innerHTML.trim()) el.innerHTML = fresh.innerHTML;
    }).catch(function () {});
  }

  /* ---------- Cart quantity: auto-update ---------- */
  function initCart() {
    $$("[data-cart-qty]").forEach(function (input) {
      input.addEventListener("change", function () {
        var form = input.closest("form");
        if (!form) return;
        var hidden = document.createElement("input");
        hidden.type = "hidden"; hidden.name = "update"; hidden.value = "1";
        form.appendChild(hidden);
        form.submit();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initReveal();
    initDragScroll();
    initSlides();
    initProduct();
    initRecs();
    initCart();
  });
})();
