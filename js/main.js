/**
 * Trà Tâm Sen — Thất trà (thiết kế mới)
 */
(function () {
  "use strict";

  function initCountdown() {
    var hEl = document.getElementById("cd-h");
    var mEl = document.getElementById("cd-m");
    var sEl = document.getElementById("cd-s");
    if (!hEl || !mEl || !sEl) return;

    function pad(n) {
      return n < 10 ? "0" + n : String(n);
    }

    function tick() {
      var now = new Date();
      var end = new Date();
      end.setHours(23, 59, 59, 999);
      var diff = Math.max(0, end - now);
      hEl.textContent = pad(Math.floor(diff / 3600000));
      mEl.textContent = pad(Math.floor((diff % 3600000) / 60000));
      sEl.textContent = pad(Math.floor((diff % 60000) / 1000));
    }

    tick();
    setInterval(tick, 1000);
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -32px 0px", threshold: 0.1 }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });

    /* Webcake: IO đôi khi không chạy — vẫn hiện nội dung */
    setTimeout(function () {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 600);
  }

  function initScarcity() {
    var stockEl = document.getElementById("stock-left");
    if (!stockEl) return;
    var stock = parseInt(stockEl.textContent, 10) || 47;
    setInterval(function () {
      if (stock > 12 && Math.random() > 0.72) {
        stock -= 1;
        stockEl.textContent = String(stock);
      }
    }, 50000);
  }

  function initNav() {
    var nav = document.getElementById("topNav");
    var hero = document.getElementById("hero");
    if (!nav || !hero) return;

    function update() {
      var threshold = hero.offsetHeight * 0.45;
      nav.classList.toggle("is-solid", window.scrollY > threshold);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initOrderForm() {
    var form = document.getElementById("orderForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      console.info("[Order]", {
        name: data.get("name"),
        phone: data.get("phone"),
        address: data.get("address"),
        combo: data.get("combo"),
        note: data.get("note"),
      });
      alert(
        "Cảm ơn bạn! Đơn hàng đã được ghi nhận.\nChúng tôi sẽ gọi xác nhận trong vòng 15 phút.\nHotline: 0916 188 330"
      );
      form.reset();
      var def = form.querySelector('select[name="combo"]');
      if (def) def.value = "2";
    });
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /** Webcake/Ladi: khớp chiều cao section với nội dung (không thu nhỏ về 0) */
  function initWebcakeFit() {
    var root = document.getElementById("tam-sen-root");
    if (!root || !document.querySelector(".ladi-section")) return;

    function fit() {
      var h = Math.max(root.scrollHeight, root.offsetHeight, 400);
      document.querySelectorAll(".ladi-section").forEach(function (sec) {
        sec.style.height = h + "px";
        sec.style.minHeight = h + "px";
        sec.style.overflow = "visible";
      });
      var page = document.querySelector(".ladi-page");
      if (page) {
        page.style.height = "auto";
        page.style.minHeight = h + "px";
      }
    }

    fit();
    setTimeout(fit, 300);
    setTimeout(fit, 1200);
    window.addEventListener("load", fit);
    window.addEventListener("resize", fit);
    if ("ResizeObserver" in window) {
      new ResizeObserver(fit).observe(root);
    }
  }

  function initPackages() {
    var packages = document.querySelectorAll(".package[data-combo]");
    var select = document.querySelector('select[name="combo"]');
    if (!packages.length || !select) return;

    packages.forEach(function (pkg) {
      pkg.addEventListener("click", function () {
        var val = pkg.getAttribute("data-combo");
        select.value = val;
        var radio = pkg.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        document.getElementById("order").scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });

    select.addEventListener("change", function () {
      var radio = document.querySelector(
        'input[name="package-preview"][value="' + select.value + '"]'
      );
      if (radio) radio.checked = true;
    });
  }

  function init() {
    initCountdown();
    initReveal();
    initScarcity();
    initNav();
    initOrderForm();
    initSmoothAnchors();
    initPackages();
    initWebcakeFit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
