const homePreviewSummaries = document.querySelectorAll(".home-card-summary");
const homePreviewCards = document.querySelectorAll(".home-preview-card");
const homePreviewHeightLimit = 500;

const textWithEllipsis = (text, position) => {
  const partialText = text.slice(0, position).replace(/\s+\S*$/, "").trimEnd();
  return partialText ? `${partialText}…` : "…";
};

const fitEllipsis = (summary) => {
  const fullText = summary.dataset.fullText || summary.textContent.trim();
  summary.dataset.fullText = fullText;
  summary.textContent = fullText;

  if (summary.scrollHeight <= summary.clientHeight + 1) {
    return;
  }

  let lowerBound = 0;
  let upperBound = fullText.length;

  while (lowerBound < upperBound) {
    const midpoint = Math.ceil((lowerBound + upperBound) / 2);
    summary.textContent = textWithEllipsis(fullText, midpoint);

    if (summary.scrollHeight <= summary.clientHeight + 1) {
      lowerBound = midpoint;
    } else {
      upperBound = midpoint - 1;
    }
  }

  summary.textContent = textWithEllipsis(fullText, lowerBound);
};

const updateHomePreviewEllipses = () => {
  homePreviewCards.forEach((card) => {
    card.classList.remove("is-capped");
  });

  homePreviewSummaries.forEach((summary) => {
    summary.textContent = summary.dataset.fullText || summary.textContent.trim();
  });

  homePreviewCards.forEach((card) => {
    if (card.getBoundingClientRect().height > homePreviewHeightLimit) {
      card.classList.add("is-capped");
    }
  });

  homePreviewSummaries.forEach(fitEllipsis);
};

if (homePreviewSummaries.length) {
  updateHomePreviewEllipses();
  window.addEventListener("resize", updateHomePreviewEllipses);

  document.querySelectorAll(".home-preview-card img").forEach((image) => {
    image.addEventListener("load", updateHomePreviewEllipses);
  });
}
