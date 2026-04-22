const intro = document.getElementById("intro");
const site = document.getElementById("site");

const musicBtn = document.getElementById("musicBtn");
const bgMusic = document.getElementById("bgMusic");

const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const weddingDate = new Date("2026-07-11T17:00:00").getTime();

let isPlaying = false;
let opened = false;
let touchStartY = 0;
let wheelAccumulated = 0;

function lockIntroScroll() {
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  window.scrollTo(0, 0);
}

function unlockIntroScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

function openInvitation() {
  if (opened) return;
  opened = true;
  window.scrollTo(0, 0);

  intro.classList.add("hide");
  site.classList.add("show");

  setTimeout(() => {
    intro.style.display = "none";
    unlockIntroScroll();
    window.scrollTo(0, 0);
  }, 1200);

  bgMusic.play()
    .then(() => {
      isPlaying = true;
      musicBtn.textContent = "❚❚";
    })
    .catch(() => {
      console.log("El navegador bloqueó la reproducción automática.");
    });
}

function handleOpenGesture() {
  if (opened) return;
  openInvitation();
}

window.addEventListener(
  "wheel",
  (event) => {
    if (opened) return;

    event.preventDefault();
    wheelAccumulated += event.deltaY;

    if (wheelAccumulated > 8) {
      handleOpenGesture();
    }
  },
  { passive: false }
);

window.addEventListener(
  "touchstart",
  (event) => {
    if (opened) return;
    touchStartY = event.touches[0].clientY;
    window.scrollTo(0, 0);
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (opened) return;

    const currentY = event.touches[0].clientY;
    const diffY = touchStartY - currentY;

    if (diffY > 18) {
      event.preventDefault();
      handleOpenGesture();
    }
  },
  { passive: false }
);

window.addEventListener(
  "keydown",
  (event) => {
    if (opened) return;

    if (event.key === "ArrowUp" || event.key === "PageUp" || event.key === " ") {
      handleOpenGesture();
    }
  }
);

if (musicBtn && bgMusic) {
  musicBtn.addEventListener("click", async () => {
    try {
      if (isPlaying) {
        bgMusic.pause();
        musicBtn.textContent = "♪";
      } else {
        await bgMusic.play();
        musicBtn.textContent = "❚❚";
      }
      isPlaying = !isPlaying;
    } catch (error) {
      console.log("No se pudo reproducir el audio:", error);
    }
  });
}

function updateCountdown() {
  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, "0");
  hoursEl.textContent = String(hours).padStart(2, "0");
  minutesEl.textContent = String(minutes).padStart(2, "0");
  secondsEl.textContent = String(seconds).padStart(2, "0");
}

/* =========================
   GALERIA POLAROID
========================= */
const polaroidCards = document.querySelectorAll(".polaroid-card");
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");
const openGalleryModal = document.getElementById("openGalleryModal");

const galleryModal = document.getElementById("galleryModal");
const closeGalleryModal = document.getElementById("closeGalleryModal");
const modalImage = document.getElementById("modalImage");
const modalCaption = document.getElementById("modalCaption");
const modalPrev = document.getElementById("modalPrev");
const modalNext = document.getElementById("modalNext");
const galleryThumbs = document.getElementById("galleryThumbs");

let currentCard = 0;
let currentModalIndex = 0;

const galleryData = Array.from(polaroidCards).map((card) => {
  const img = card.querySelector("img");
  const caption = card.querySelector("p");

  return {
    src: img.src,
    alt: img.alt,
    caption: caption ? caption.textContent : ""
  };
});

function normalizeIndex(index, length) {
  return (index + length) % length;
}

function updatePolaroidStack() {
  if (!polaroidCards.length) return;

  polaroidCards.forEach((card, index) => {
    card.classList.remove(
      "active",
      "next-1",
      "next-2",
      "prev-1",
      "prev-2",
      "hidden-card"
    );

    const total = polaroidCards.length;
    const offset = (index - currentCard + total) % total;

    if (offset === 0) {
      card.classList.add("active");
    } else if (offset === 1) {
      card.classList.add("next-1");
    } else if (offset === 2) {
      card.classList.add("next-2");
    } else if (offset === total - 1) {
      card.classList.add("prev-1");
    } else if (offset === total - 2) {
      card.classList.add("prev-2");
    } else {
      card.classList.add("hidden-card");
    }
  });
}

function showNextCard() {
  currentCard = normalizeIndex(currentCard + 1, polaroidCards.length);
  updatePolaroidStack();
}

function showPrevCard() {
  currentCard = normalizeIndex(currentCard - 1, polaroidCards.length);
  updatePolaroidStack();
}

function renderThumbs() {
  if (!galleryThumbs) return;

  galleryThumbs.innerHTML = "";

  galleryData.forEach((item, index) => {
    const thumb = document.createElement("img");
    thumb.src = item.src;
    thumb.alt = item.alt;
    thumb.className = index === currentModalIndex ? "active-thumb" : "";

    thumb.addEventListener("click", () => {
      openModal(index);
    });

    galleryThumbs.appendChild(thumb);
  });
}

function openModal(index) {
  currentModalIndex = index;
  modalImage.src = galleryData[index].src;
  modalImage.alt = galleryData[index].alt;
  modalCaption.textContent = galleryData[index].caption;

  galleryModal.classList.add("show");
  document.body.style.overflow = "hidden";
  renderThumbs();
}

function closeModal() {
  galleryModal.classList.remove("show");
  document.body.style.overflow = "";
}

function showNextModalImage() {
  currentModalIndex = normalizeIndex(currentModalIndex + 1, galleryData.length);
  openModal(currentModalIndex);
}

function showPrevModalImage() {
  currentModalIndex = normalizeIndex(currentModalIndex - 1, galleryData.length);
  openModal(currentModalIndex);
}

if (galleryNext) {
  galleryNext.addEventListener("click", showNextCard);
}

if (galleryPrev) {
  galleryPrev.addEventListener("click", showPrevCard);
}

polaroidCards.forEach((card, index) => {
  card.addEventListener("click", () => {
    openModal(index);
  });
});

if (openGalleryModal) {
  openGalleryModal.addEventListener("click", () => {
    openModal(currentCard);
  });
}

if (closeGalleryModal) {
  closeGalleryModal.addEventListener("click", closeModal);
}

if (modalNext) {
  modalNext.addEventListener("click", showNextModalImage);
}

if (modalPrev) {
  modalPrev.addEventListener("click", showPrevModalImage);
}

if (galleryModal) {
  galleryModal.addEventListener("click", (e) => {
    if (e.target === galleryModal) {
      closeModal();
    }
  });
}

window.addEventListener("keydown", (e) => {
  if (!galleryModal || !galleryModal.classList.contains("show")) return;

  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowRight") showNextModalImage();
  if (e.key === "ArrowLeft") showPrevModalImage();
});

updatePolaroidStack();

lockIntroScroll();
updateCountdown();
setInterval(updateCountdown, 1000);