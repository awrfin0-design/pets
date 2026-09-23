document.addEventListener("DOMContentLoaded", function () {
  /* ---------- LOADER ---------- */
  var loader = document.querySelector(".moove-loader");
  var loaderBar = loader ? loader.querySelector(".loader-bar span") : null;
  var progress = 0;
  var loaderInterval = setInterval(function () {
    progress = Math.min(progress + Math.random() * 18, 92);
    if (loaderBar) loaderBar.style.width = progress + "%";
  }, 150);

  function hideLoader() {
    clearInterval(loaderInterval);
    if (loaderBar) loaderBar.style.width = "100%";
    setTimeout(function () {
      if (loader) loader.classList.add("is-hidden");
      document.body.style.overflow = "";
    }, 250);
  }

  if (loader) {
    document.body.style.overflow = "hidden";
    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader);
      setTimeout(hideLoader, 4000);
    }
  }

  function splitChars(el) {
    var text = el.textContent;
    el.textContent = "";
    return text.split("").map(function (ch) {
      var span = document.createElement("span");
      span.className = "char";
      span.textContent = ch === " " ? " " : ch;
      el.appendChild(span);
      return span;
    });
  }
  function splitWords(el) {
    var text = el.textContent;
    el.textContent = "";
    return text.split(" ").map(function (w, i, arr) {
      var span = document.createElement("span");
      span.className = "word";
      span.textContent = w + (i < arr.length - 1 ? " " : "");
      el.appendChild(span);
      return span;
    });
  }

  var pinBox = document.getElementById("pinBox");
  if (pinBox) {
    pinBox.querySelectorAll(".vd-card").forEach(function (card) {
      var video = card.querySelector("video");
      if (!video) return;
      card.addEventListener("mouseenter", function () { video.play(); });
      card.addEventListener("mouseleave", function () { video.pause(); });
    });
  }

  if (typeof gsap === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  window.addEventListener("load", function () {
    var heroTitle = document.getElementById("heroTitle");
    if (heroTitle) {
      var chars = splitChars(heroTitle);
      var tl = gsap.timeline({ delay: 0.5 });
      tl.to(".hero-content", { opacity: 1, y: 0, duration: 0.8, ease: "power1.inOut" })
        .to("#heroScroll", { duration: 1, clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)", ease: "circ.out" }, "-=0.4")
        .from(chars, { yPercent: 200, stagger: 0.02, ease: "power2.out" }, "-=0.5");
    }

    gsap.to(".hero-container", {
      rotate: 5, scale: 0.92, yPercent: 20, ease: "power1.inOut",
      scrollTrigger: { trigger: ".hero-container", start: "top top", end: "bottom top", scrub: true }
    });

    var firstMsg = document.getElementById("firstMsg");
    var secondMsg = document.getElementById("secondMsg");
    if (firstMsg && secondMsg) {
      var firstWords = splitWords(firstMsg);
      var secondWords = splitWords(secondMsg);
      gsap.to(firstWords, {
        color: "#f3ecdf", stagger: 0.5, ease: "power1.in",
        scrollTrigger: { trigger: ".message-content", start: "top center", end: "30% center", scrub: true }
      });
      gsap.to(secondWords, {
        color: "#f3ecdf", stagger: 0.5, ease: "power1.in",
        scrollTrigger: { trigger: "#secondMsg", start: "top center", end: "bottom center", scrub: true }
      });
    }
    if (document.getElementById("msgScroll")) {
      gsap.to("#msgScroll", {
        duration: 1, clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)", ease: "circ.inOut",
        scrollTrigger: { trigger: "#msgScroll", start: "top 70%" }
      });
    }

    var flavA = document.getElementById("flavA");
    var flavB = document.getElementById("flavB");
    if (flavA && flavB) {
      gsap.from(splitChars(flavA), { yPercent: 200, stagger: 0.02, ease: "power1.inOut", scrollTrigger: { trigger: ".flavor-section", start: "top 60%" } });
      gsap.from(splitChars(flavB), { yPercent: 200, stagger: 0.02, ease: "power1.inOut", scrollTrigger: { trigger: ".flavor-section", start: "top 40%" } });
    }
    if (document.getElementById("flavScroll")) {
      gsap.to("#flavScroll", { duration: 1, clipPath: "polygon(0% 0%,100% 0%,100% 100%,0% 100%)", scrollTrigger: { trigger: ".flavor-section", start: "top 50%" } });
    }

    if (window.innerWidth >= 1024) {
      var flavors = document.getElementById("flavors");
      if (flavors) {
        var scrollAmount = function () { return flavors.scrollWidth - window.innerWidth; };
        gsap.timeline({
          scrollTrigger: {
            trigger: ".flavor-section", start: "2% top",
            end: function () { return "+=" + (scrollAmount() + 1200) + "px"; }, scrub: true, pin: true
          }
        }).to(".flavor-section", { x: function () { return -(scrollAmount() + 1200); }, ease: "power1.inOut" });
      }
    }

    var nutA = document.getElementById("nutA");
    if (nutA) {
      gsap.from(splitChars(nutA), { yPercent: 100, stagger: 0.02, ease: "power2.out", scrollTrigger: { trigger: ".nutrition-section", start: "top center" } });
    }
    if (document.getElementById("nutScroll")) {
      gsap.to("#nutScroll", { duration: 1, opacity: 1, clipPath: "polygon(100% 0,0 0,0 100%,100% 100%)", ease: "power1.inOut", scrollTrigger: { trigger: ".nutrition-section", start: "top 80%" } });
    }

    if (document.querySelector(".benefit-section")) {
      gsap.timeline({
        scrollTrigger: { trigger: ".benefit-section", start: "top 60%", end: "top top", scrub: 1.5 }
      }).to(".clip-title:nth-child(1) .clip-inner", { opacity: 1, clipPath: "polygon(0% 0%,100% 0,100% 100%,0% 100%)", ease: "circ.out" })
        .to(".clip-title:nth-child(2) .clip-inner", { opacity: 1, clipPath: "polygon(0% 0%,100% 0,100% 100%,0% 100%)", ease: "circ.out" })
        .to(".clip-title:nth-child(3) .clip-inner", { opacity: 1, clipPath: "polygon(0% 0%,100% 0,100% 100%,0% 100%)", ease: "circ.out" })
        .to(".clip-title:nth-child(4) .clip-inner", { opacity: 1, clipPath: "polygon(0% 0%,100% 0,100% 100%,0% 100%)", ease: "circ.out" });
    }
    document.querySelectorAll(".clip-inner").forEach(function (el) { el.style.borderColor = el.dataset.border; });

    if (window.innerWidth >= 768) {
      if (document.getElementById("videoBox")) {
        gsap.timeline({
          scrollTrigger: { trigger: ".vd-pin-section", start: "-15% top", end: "200% top", scrub: 1.5, pin: true }
        }).to("#videoBox", { clipPath: "circle(100% at 50% 50%)", ease: "power1.inOut" });
      }
    } else if (document.getElementById("videoBox")) {
      document.getElementById("videoBox").style.clipPath = "circle(100% at 50% 50%)";
    }

    if (document.querySelector(".vd-card")) {
      gsap.from(".vd-card", {
        yPercent: 40, opacity: 0, stagger: 0.15, ease: "power1.inOut",
        scrollTrigger: { trigger: ".testimonials-section", start: "top 70%" }
      });
    }

    ScrollTrigger.refresh();
  });
});

document.addEventListener("change", function (e) {
  if (e.target && e.target.matches("[data-lang-switcher]")) {
    window.location.href = e.target.value;
  }
});
