document.querySelectorAll(".mobile-menu").forEach((menu) => {
  const toggle = menu.querySelector(".menu-toggle");
  const links = menu.querySelectorAll("a");

  if (!toggle) {
    return;
  }

  const setMenuOpen = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  setMenuOpen(false);

  toggle.addEventListener("click", () => {
    setMenuOpen(!menu.classList.contains("is-open"));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (menu.classList.contains("is-open") && !menu.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
});
