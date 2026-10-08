(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = window.matchMedia("(min-width: 901px)").matches;

  document.body.classList.add("is-loading");

  // ---------- Loader ----------
  window.addEventListener("load", () => {
    const loader = $(".site-loader");
    const line = $(".loader-line span");

    if (window.gsap && !reducedMotion) {
      gsap.to(line, { xPercent: 0, duration: .9, ease: "power3.inOut" });
      gsap.to(loader, {
        autoAlpha: 0,
        duration: .75,
        delay: .95,
        ease: "power2.inOut",
        onComplete: () => {
          loader.remove();
          document.body.classList.remove("is-loading");
          document.body.classList.add("loaded");
          initAnimations();
        }
      });
    } else {
      loader.remove();
      document.body.classList.remove("is-loading");
      document.body.classList.add("loaded");
      initAnimations();
    }
  });

  // ---------- Mobile navigation ----------
  const nav = $(".nav");
  const menuToggle = $(".menu-toggle");

  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  $$(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });

  // ---------- Cursor ----------
  if (desktop && !reducedMotion) {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    let mx = innerWidth / 2, my = innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("pointermove", e => {
      mx = e.clientX; my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    });

    gsap.ticker.add(() => {
      rx += (mx - rx) * .13;
      ry += (my - ry) * .13;
      gsap.set(ring, { x: rx, y: ry });
    });

    $$("a,button,.comparison-handle").forEach(el => {
      el.addEventListener("mouseenter", () => ring.classList.add("active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("active"));
    });
  }

  // ---------- Magnetic buttons ----------
  if (desktop && !reducedMotion) {
    $$(".magnetic").forEach(el => {
      el.addEventListener("pointermove", e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * .12, y: y * .12, duration: .35, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: .5, ease: "elastic.out(1,.5)" });
      });
    });
  }

  // ---------- Hero mouse depth ----------
  if (desktop && !reducedMotion) {
    const hero = $(".hero");
    const layers = $$(".hero-depth", hero);
    hero.addEventListener("pointermove", e => {
      const x = e.clientX / innerWidth - .5;
      const y = e.clientY / innerHeight - .5;
      layers.forEach(layer => {
        const d = Number(layer.dataset.depth || 10);
        gsap.to(layer, { x: x * d, y: y * d, duration: .8, ease: "power3.out" });
      });
    });
    hero.addEventListener("pointerleave", () => {
      layers.forEach(layer => gsap.to(layer, { x: 0, y: 0, duration: 1 }));
    });
  }

  // ---------- Smooth / scroll animations ----------
  function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger || reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    $$(".reveal-up").forEach(el => {
      gsap.fromTo(el,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: .9, ease: "power3.out", delay: parseFloat(getComputedStyle(el).transitionDelay) || 0 }
      );
    });

    $$(".service-item,.why-list article,.process article").forEach((el, i) => {
      gsap.fromTo(el, { y: 35, opacity: 0 }, {
        y: 0, opacity: 1, duration: .8, ease: "power3.out",
        delay: (i % 4) * .06,
        scrollTrigger: { trigger: el, start: "top 88%" }
      });
    });

    $$(".parallax-media img,.parallax-img").forEach(img => {
      const speed = Number(img.closest("[data-speed]")?.dataset.speed || .03);
      gsap.to(img, {
        yPercent: speed * -100,
        ease: "none",
        scrollTrigger: { trigger: img.closest("section"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    const processLine = $(".process-line span");
    if (processLine) {
      gsap.to(processLine, {
        scaleX: 1, duration: 1.2, ease: "power2.inOut",
        scrollTrigger: { trigger: ".process", start: "top 75%" }
      });
    }

    // Counters
    $$("[data-counter]").forEach(el => {
      const target = Number(el.dataset.counter);
      const obj = { value: 0 };
      gsap.to(obj, {
        value: target, duration: 1.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => el.textContent = Math.round(obj.value).toLocaleString()
      });
    });
  }

  // ---------- Before / After slider ----------
  const comparison = $(".comparison");
  const before = $(".comparison-panel.before");
  const handle = $(".comparison-handle");

  if (comparison && before && handle) {
    let dragging = false;

    const setPosition = clientX => {
      const r = comparison.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100));
      before.style.width = `${percent}%`;
      handle.style.left = `${percent}%`;
      handle.setAttribute("aria-valuenow", Math.round(percent));
    };

    comparison.addEventListener("pointerdown", e => {
      dragging = true;
      comparison.setPointerCapture(e.pointerId);
      setPosition(e.clientX);
    });
    comparison.addEventListener("pointermove", e => {
      if (dragging) setPosition(e.clientX);
    });
    comparison.addEventListener("pointerup", () => dragging = false);
    comparison.addEventListener("pointercancel", () => dragging = false);

    handle.addEventListener("keydown", e => {
      const current = Number(handle.getAttribute("aria-valuenow"));
      if (e.key === "ArrowLeft") setPosition(comparison.getBoundingClientRect().left + comparison.offsetWidth * ((current - 2) / 100));
      if (e.key === "ArrowRight") setPosition(comparison.getBoundingClientRect().left + comparison.offsetWidth * ((current + 2) / 100));
    });
  }

  // ---------- Gallery lightbox ----------
  const galleryItems = $$(".gallery-card");
  const lightbox = $(".lightbox");
  const lightboxImg = $(".lightbox img");
  const caption = $(".lightbox figcaption");
  let galleryIndex = 0;

  const openLightbox = index => {
    galleryIndex = index;
    const item = galleryItems[galleryIndex];
    lightboxImg.src = item.dataset.full;
    lightboxImg.alt = $("img", item)?.alt || "";
    caption.textContent = $("span", item)?.textContent || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const moveGallery = direction => {
    galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
    openLightbox(galleryIndex);
  };

  galleryItems.forEach((item, i) => item.addEventListener("click", () => openLightbox(i)));
  $(".lightbox-close")?.addEventListener("click", closeLightbox);
  $(".lightbox-prev")?.addEventListener("click", () => moveGallery(-1));
  $(".lightbox-next")?.addEventListener("click", () => moveGallery(1));

  lightbox?.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") moveGallery(-1);
    if (e.key === "ArrowRight") moveGallery(1);
  });
})();
