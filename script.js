document.addEventListener("DOMContentLoaded", () => {
  // Update the copyright year automatically.
  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Reveal content as it enters the viewport.
  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");

            // Animate each element only once.
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  }

  // Smooth scrolling for links pointing to sections on this page.
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const targetElement = document.querySelector(targetId);

      if (!targetElement) {
        return;
      }

      event.preventDefault();

      targetElement.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      // Update the URL hash without causing another jump.
      history.replaceState(null, "", targetId);
    });
  });

  // Handle missing images gracefully.
  const images = document.querySelectorAll("img");

  images.forEach((imageElement) => {
    imageElement.addEventListener("error", () => {
      if (imageElement.dataset.fallbackHandled) {
        return;
      }

      imageElement.dataset.fallbackHandled = "true";

      console.warn(
        "Portfolio image could not be loaded:",
        imageElement.getAttribute("src")
      );

      imageElement.classList.add("image-unavailable");
      imageElement.setAttribute("alt", "Image currently unavailable");
    });
  });
});