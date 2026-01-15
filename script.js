// =====================
// LOADER (your original)
// =====================
const loader = document.getElementById("loader");
const app = document.getElementById("app");
const barFill = document.getElementById("barFill");

/**
 * Симулиран loading, “една идея по-бавничко”.
 * Плавно качва прогреса, а накрая довършва до 100%.
 * После fade-out на loader и показване на app.
 */
const config = {
  minDurationMs: 2200,
  maxDurationMs: 3400,
  tickMs: 120,
};

let progress = 0;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const totalDuration = rand(config.minDurationMs, config.maxDurationMs);
const steps = Math.ceil(totalDuration / config.tickMs);

function stepAmount(p) {
  if (p < 35) return rand(6, 11);
  if (p < 70) return rand(3, 7);
  if (p < 90) return rand(1, 3);
  return 0;
}

let currentStep = 0;

const interval = setInterval(() => {
  currentStep++;
  const cap = 92;

  progress = Math.min(cap, progress + stepAmount(progress));
  barFill.style.width = progress + "%";

  if (currentStep >= steps) {
    clearInterval(interval);

    barFill.style.width = "100%";

    setTimeout(() => {
      loader.classList.add("loader--done");
      app.classList.remove("app--hidden");
      // If you use "is-ready" elsewhere, uncomment:
      // document.body.classList.add("is-ready");
    }, 420);
  }
}, config.tickMs);

// =====================
// TOPBAR: milky bg on scroll
// =====================
const topbar = document.querySelector(".topbar");
const SCROLL_TRIGGER = 24;

function updateNavOnScroll() {
  if (!topbar) return;
  topbar.classList.toggle("is-scrolled", window.scrollY > SCROLL_TRIGGER);
}

window.addEventListener("scroll", updateNavOnScroll, { passive: true });
updateNavOnScroll();

// =====================
// MOBILE MENU + letters + swipe
// =====================
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
const mobileClose = document.getElementById("mobileMenuClose");

function openMenu() {
  if (!mobileMenu || !burger) return;
  mobileMenu.classList.add("is-open");
  burger.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  animateMobileLinksIn();
  // optional: hide floating UI if you use it
  // document.body.classList.add("is-menu-open");
}

function closeMenu() {
  if (!mobileMenu || !burger) return;
  mobileMenu.classList.remove("is-open");
  burger.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  // optional:
  // document.body.classList.remove("is-menu-open");
}

function toggleMenu() {
  if (!mobileMenu) return;
  const isOpen = mobileMenu.classList.contains("is-open");
  isOpen ? closeMenu() : openMenu();
}

if (burger && mobileMenu) burger.addEventListener("click", toggleMenu);
if (mobileClose) mobileClose.addEventListener("click", closeMenu);

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu?.classList.contains("is-open")) closeMenu();
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => closeMenu());
});

/* Letters */
let lettersWrapped = false;

function wrapLinkLetters() {
  if (lettersWrapped || !mobileMenu) return;

  const links = mobileMenu.querySelectorAll(".mobileMenu__nav a");
  links.forEach((a) => {
    const text = a.textContent.trim();
    a.setAttribute("aria-label", text);

    const wrapper = document.createElement("span");
    wrapper.className = "letters";
    wrapper.setAttribute("aria-hidden", "true");

    [...text].forEach((ch) => {
      const s = document.createElement("span");
      s.className = "letter";
      s.textContent = ch === " " ? "\u00A0" : ch;
      wrapper.appendChild(s);
    });

    a.textContent = "";
    a.appendChild(wrapper);
  });

  lettersWrapped = true;
}

function animateMobileLinksIn() {
  wrapLinkLetters();
  const letters = mobileMenu?.querySelectorAll(".letter") || [];
  letters.forEach((el) => el.classList.remove("in"));
  letters.forEach((el, i) => {
    el.style.transitionDelay = `${i * 12}ms`;
    requestAnimationFrame(() => el.classList.add("in"));
  });
}

/* Swipe down to close */
let touchStartY = 0;
let touchStartX = 0;
let isSwiping = false;

mobileMenu?.addEventListener(
  "touchstart",
  (e) => {
    if (!mobileMenu.classList.contains("is-open")) return;
    const t = e.touches[0];
    touchStartY = t.clientY;
    touchStartX = t.clientX;
    isSwiping = true;
  },
  { passive: true }
);

mobileMenu?.addEventListener(
  "touchmove",
  (e) => {
    if (!isSwiping) return;
    const t = e.touches[0];
    const dy = t.clientY - touchStartY;
    const dx = t.clientX - touchStartX;

    if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      isSwiping = false;
      closeMenu();
    }
  },
  { passive: true }
);

mobileMenu?.addEventListener(
  "touchend",
  () => {
    isSwiping = false;
  },
  { passive: true }
);

// =====================
// SCROLL SPY (active link)
// =====================
function setActiveLinkById(id) {
  const allLinks = document.querySelectorAll(".navPill__link, .mobileMenu__nav a");
  allLinks.forEach((a) => a.classList.remove("is-active"));

  const targets = document.querySelectorAll(
    `.navPill__link[href="#${CSS.escape(id)}"], .mobileMenu__nav a[href="#${CSS.escape(id)}"]`
  );
  targets.forEach((a) => a.classList.add("is-active"));
}

(function initScrollSpy() {
  const sections = Array.from(document.querySelectorAll("section[id], main[id], header[id]")).filter(
    (el) => el.id && document.querySelector(`a[href="#${CSS.escape(el.id)}"]`)
  );
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActiveLinkById(visible.target.id);
    },
    {
      threshold: [0.2, 0.35, 0.5, 0.65],
      rootMargin: "-20% 0px -60% 0px",
    }
  );

  sections.forEach((sec) => observer.observe(sec));

  const hash = (location.hash || "").replace("#", "");
  if (hash && document.getElementById(hash)) setActiveLinkById(hash);
})();

// =====================
// HERO crossfade (2 photos)
// =====================
const heroImages = ["img/hero5.jpg", "img/about2.jpg"];

(function initHeroSlider() {
  const layerA = document.querySelector(".hero__bgLayer.is-a");
  const layerB = document.querySelector(".hero__bgLayer.is-b");
  if (!layerA || !layerB) return;

  layerA.style.backgroundImage = `url("${heroImages[0]}")`;
  layerB.style.backgroundImage = `url("${heroImages[1]}")`;

  let activeIsA = true;
  layerA.classList.add("is-active");

  const INTERVAL = 7500;

  setInterval(() => {
    activeIsA = !activeIsA;
    if (activeIsA) {
      layerA.classList.add("is-active");
      layerB.classList.remove("is-active");
    } else {
      layerB.classList.add("is-active");
      layerA.classList.remove("is-active");
    }
  }, INTERVAL);
})();

// =====================
// ABOUT (first about section) reveal
// =====================
(function initAboutReveal() {
  const about = document.querySelector(".about");
  if (!about) return;

  const obs = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) about.classList.add("is-visible");
    },
    { threshold: 0.25 }
  );

  obs.observe(about);
})();

// =====================
// ABOUT DETAILS reveal (ONLY ONCE) + REPLAY COLLAGE EVERY 10s
// =====================
(function initAboutDetailsRevealAndReplay() {
  const section = document.querySelector(".aboutDetails");
  const collage = document.querySelector(".aboutDetails .collage");
  if (!section || !collage) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (reduceMotion) return;

  // ---- Reveal (one-time) ----
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      if (entries[0].isIntersecting) {
        section.classList.add("is-visible");
        obs.disconnect();
      }
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );
  revealObserver.observe(section);

  // ---- Replay collage reveal every 10s (only images) ----
  const PERIOD_MS = 10000;
  let timer = null;

  const replay = () => {
    if (!section.classList.contains("is-visible")) return;

    collage.classList.add("is-cycle");
    void collage.offsetHeight; // force reflow
    collage.classList.remove("is-cycle");
  };

  const start = () => {
    if (timer) return;
    timer = setInterval(replay, PERIOD_MS);
  };

  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  };

  // start/stop while section in view
  const inViewObs = new IntersectionObserver(
    (entries) => {
      const inView = entries[0]?.isIntersecting;
      if (inView) start();
      else stop();
    },
    { threshold: 0.25 }
  );
  inViewObs.observe(section);

  // when first becomes visible -> do one replay immediately, then start timer
  const classObs = new MutationObserver(() => {
    if (section.classList.contains("is-visible")) {
      replay();
      start();
      classObs.disconnect();
    }
  });
  classObs.observe(section, { attributes: true, attributeFilter: ["class"] });

  // if already visible (refresh mid-page)
  if (section.classList.contains("is-visible")) {
    replay();
    start();
  }
})();
