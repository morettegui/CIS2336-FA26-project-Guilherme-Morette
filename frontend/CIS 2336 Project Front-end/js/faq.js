function getFaqItems() {
  return document.querySelectorAll(".faq-item");
}

function setAllFaqItems(shouldOpen) {
  getFaqItems().forEach(function (item) {
    item.open = shouldOpen;
  });
}

function openFaqFromLink() {
  if (!window.location.hash) {
    return;
  }

  const target = document.getElementById(window.location.hash.slice(1));
  if (target && target.classList.contains("faq-item")) {
    target.open = true;
    target.querySelector("summary").focus();
  }
}

function setUpFaq() {
  const openAllButton = document.getElementById("faq-open-all");
  const closeAllButton = document.getElementById("faq-close-all");

  if (openAllButton) {
    openAllButton.addEventListener("click", function () {
      setAllFaqItems(true);
    });
  }

  if (closeAllButton) {
    closeAllButton.addEventListener("click", function () {
      setAllFaqItems(false);
    });
  }

  openFaqFromLink();
  window.addEventListener("hashchange", openFaqFromLink);
}

setUpFaq();
