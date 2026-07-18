document.querySelectorAll("[data-share-button]").forEach((button) => {
  const shareUrl = button.dataset.shareUrl || window.location.href;
  const shareTitle = button.dataset.shareTitle || document.title;
  const status = button.closest(".content-share")?.querySelector("[data-share-status]");

  const setStatus = (message) => {
    if (status) {
      status.textContent = message;
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setStatus("Link copied.");
    } catch {
      const field = document.createElement("textarea");
      field.value = shareUrl;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      document.execCommand("copy");
      field.remove();
      setStatus("Link copied.");
    }
  };

  button.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
      }
    }

    await copyLink();
  });
});
