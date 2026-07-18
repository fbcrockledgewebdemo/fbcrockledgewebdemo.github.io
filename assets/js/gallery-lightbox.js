document.querySelectorAll("[data-gallery-track]").forEach((track) => {
  const gallery = track.closest(".about-gallery");
  const dialog = gallery.querySelector("[data-gallery-dialog]");
  const triggers = [...track.querySelectorAll("[data-gallery-trigger]")];
  const image = dialog.querySelector("[data-gallery-image]");
  const caption = dialog.querySelector("[data-gallery-caption]");
  const position = dialog.querySelector("[data-gallery-position]");
  const close = dialog.querySelector("[data-gallery-close]");
  const previous = dialog.querySelector("[data-gallery-previous]");
  const next = dialog.querySelector("[data-gallery-next]");
  let activeIndex = 0;

  const showPhoto = (index) => {
    activeIndex = (index + triggers.length) % triggers.length;
    const thumbnail = triggers[activeIndex].querySelector("img");

    image.src = thumbnail.currentSrc || thumbnail.src;
    image.alt = thumbnail.alt;
    caption.textContent = thumbnail.alt;
    position.textContent = `Photo ${activeIndex + 1} of ${triggers.length}`;
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      showPhoto(index);
      dialog.showModal();
      close.focus();
    });
  });

  close.addEventListener("click", () => dialog.close());
  previous.addEventListener("click", () => showPhoto(activeIndex - 1));
  next.addEventListener("click", () => showPhoto(activeIndex + 1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      showPhoto(activeIndex - 1);
    }

    if (event.key === "ArrowRight") {
      showPhoto(activeIndex + 1);
    }
  });
});
