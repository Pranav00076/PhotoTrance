document.addEventListener('DOMContentLoaded', () => {
    // 1. Custom Cursor
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
    });

    // We will attach hover events to images dynamically as they might be added by upload.js
    const setupImageInteractions = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Exclude icons or logos
            if (img.parentElement.tagName === 'A' || img.parentElement.tagName === 'NAV') return;
            if (img.classList.contains('interaction-bound')) return;

            img.classList.add('interaction-bound');
            img.classList.add('scroll-reveal');

            img.addEventListener('mouseenter', () => {
                cursor.classList.add('cursor-view');
            });
            img.addEventListener('mouseleave', () => {
                cursor.classList.remove('cursor-view');
            });

            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
            });

            observer.observe(img);
        });
    };

    // 2. Lightbox
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    document.body.appendChild(lightbox);

    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightboxImg.src = '';
        }, 400); // match transition duration
    };

    lightbox.addEventListener('click', closeLightbox);

    // 3. Scroll Reveal Animation
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing if we only want it to animate once
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px"
    });

    // Run setup initially
    setupImageInteractions();

    // Re-run setup occasionally if upload.js injects images asynchronously
    // Or we can observe the DOM for new images
    const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                setupImageInteractions();
            }
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
});
