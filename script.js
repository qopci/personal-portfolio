document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;

    // Update the footer copyright year automatically.
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Respect the user's reduced-motion accessibility preference.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Enable JavaScript-dependent animations.
    root.classList.add("js-motion");

    // Reveal elements as they enter the viewport.
    const revealElements = document.querySelectorAll(".reveal");

    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
        // Show everything immediately if animations are disabled or unsupported.
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.05,
                rootMargin: "0px 0px -20px 0px"
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });
    }

    let activeScrollFrame = null;
    let scrollCancelledByUser = false;

    // Stop the current animation frame when scrolling is interrupted.
    function cancelCurrentScroll() {
        if (activeScrollFrame !== null) {
            cancelAnimationFrame(activeScrollFrame);
            activeScrollFrame = null;
        }
    }

    // Let the user take control when they scroll or touch the screen.
    window.addEventListener("wheel", () => {
        scrollCancelledByUser = true;
        cancelCurrentScroll();
    }, { passive: true });

    window.addEventListener("touchstart", () => {
        scrollCancelledByUser = true;
        cancelCurrentScroll();
    }, { passive: true });

    window.addEventListener("keydown", (event) => {
        const scrollKeys = [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Home",
            "End",
            " "
        ];

        if (scrollKeys.includes(event.key)) {
            scrollCancelledByUser = true;
            cancelCurrentScroll();
        }
    });

    // Smoothly scroll to a target while accounting for the fixed header.
    function scrollToElement(target) {
        if (!target) return;

        cancelCurrentScroll();
        scrollCancelledByUser = false;

        const header = document.querySelector(".site-header");
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
        const startTop = window.scrollY;
        const distance = targetTop - startTop;

        // Use instant scrolling when reduced motion is preferred or the distance is tiny.
        if (reduceMotion.matches || Math.abs(distance) < 2) {
            window.scrollTo(0, targetTop);
            return;
        }

        const duration = 1800;
        let startTime = null;

        function step(timestamp) {
            if (scrollCancelledByUser) {
                activeScrollFrame = null;
                return;
            }

            if (startTime === null) {
                startTime = timestamp;
            }

            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease in and out for a gradual start and finish.
            const eased = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startTop + distance * eased);

            if (progress < 1) {
                activeScrollFrame = requestAnimationFrame(step);
            } else {
                activeScrollFrame = null;
            }
        }

        activeScrollFrame = requestAnimationFrame(step);
    }

    // Handle internal navigation links, such as Explore My Work and Back to Top.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!href || href === "#") return;

            let target;

            try {
                target = document.querySelector(href);
            } catch {
                return;
            }

            if (!target) return;

            event.preventDefault();
            scrollToElement(target);

            // Update the URL without triggering the browser's default jump.
            history.replaceState(null, "", href);
        });
    });

    // Handle missing images gracefully without interrupting the page.
    document.querySelectorAll("img").forEach((img) => {
        img.addEventListener("error", () => {
            if (img.dataset.fallbackHandled) return;

            img.dataset.fallbackHandled = "true";

            console.warn("Portfolio image could not be loaded:", img.getAttribute("src"));

            img.classList.add("image-unavailable");
            img.setAttribute("alt", "Image currently unavailable");
        });
    });
});