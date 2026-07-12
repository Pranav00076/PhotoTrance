document.addEventListener('DOMContentLoaded', () => {
    // 0. Preloader Logic
    const preloader = document.createElement('div');
    preloader.id = 'preloader';
    preloader.innerHTML = `
        <img src="P.png" alt="Loading Logo">
        <div class="loader-line"></div>
    `;
    document.body.prepend(preloader);

    let loadingTimeout;
    const hidePreloader = () => {
        preloader.classList.add('loaded');
    };

    const showPreloader = () => {
        preloader.classList.remove('loaded');
    };

    const checkAllImagesLoaded = () => {
        const images = document.querySelectorAll('img');
        let allLoaded = true;
        images.forEach(img => {
            if (!img.complete && img.getAttribute('loading') !== 'lazy' && img.src) {
                allLoaded = false;
            }
        });
        
        if (allLoaded) {
            hidePreloader();
        } else {
            showPreloader();
            clearTimeout(loadingTimeout);
            loadingTimeout = setTimeout(checkAllImagesLoaded, 200);
        }
    };

    checkAllImagesLoaded();

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

    // Zoom UI
    const zoomContainer = document.createElement('div');
    zoomContainer.id = 'zoom-container';
    
    const zoomOutIcon = document.createElement('span');
    zoomOutIcon.textContent = '-';
    zoomOutIcon.style.cursor = 'pointer';
    zoomOutIcon.style.padding = '0 5px';
    zoomOutIcon.addEventListener('click', () => {
        zoomSlider.value = Math.max(parseFloat(zoomSlider.min), parseFloat(zoomSlider.value) - 0.5);
        lightbox.style.setProperty('--zoom-level', zoomSlider.value);
    });
    
    const zoomInIcon = document.createElement('span');
    zoomInIcon.textContent = '+';
    zoomInIcon.style.cursor = 'pointer';
    zoomInIcon.style.padding = '0 5px';
    zoomInIcon.addEventListener('click', () => {
        zoomSlider.value = Math.min(parseFloat(zoomSlider.max), parseFloat(zoomSlider.value) + 0.5);
        lightbox.style.setProperty('--zoom-level', zoomSlider.value);
    });

    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.id = 'zoom-slider';
    zoomSlider.min = '1';
    zoomSlider.max = '4';
    zoomSlider.step = '0.1';
    zoomSlider.value = '1';

    zoomContainer.appendChild(zoomOutIcon);
    zoomContainer.appendChild(zoomSlider);
    zoomContainer.appendChild(zoomInIcon);
    lightbox.appendChild(zoomContainer);

    let isDragging = false;
    let hasDragged = false;
    let startX, startY;
    let translateX = 0, translateY = 0;

    lightboxImg.addEventListener('mousedown', (e) => {
        if (parseFloat(zoomSlider.value) > 1) {
            isDragging = true;
            hasDragged = false;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            lightboxImg.style.cursor = 'grabbing';
            lightboxImg.style.transition = 'none';
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        hasDragged = true;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        lightbox.style.setProperty('--tx', `${translateX}px`);
        lightbox.style.setProperty('--ty', `${translateY}px`);
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            lightboxImg.style.cursor = '';
            lightboxImg.style.transition = '';
            // We set a small timeout to allow click event to fire with hasDragged = true
            setTimeout(() => hasDragged = false, 50);
        }
    });

    lightbox.addEventListener('wheel', (e) => {
        if (parseFloat(zoomSlider.value) > 1) {
            translateX -= e.deltaX;
            translateY -= e.deltaY;
            lightbox.style.setProperty('--tx', `${translateX}px`);
            lightbox.style.setProperty('--ty', `${translateY}px`);
            e.preventDefault();
        }
    }, { passive: false });

    zoomContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing when clicking slider
    });

    zoomSlider.addEventListener('input', (e) => {
        lightbox.style.setProperty('--zoom-level', e.target.value);
    });

    const closeLightbox = () => {
        if (hasDragged) return; // Prevent closing immediately after dragging
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightboxImg.src = '';
            // Reset zoom and pan
            zoomSlider.value = '1';
            translateX = 0;
            translateY = 0;
            lightbox.style.setProperty('--zoom-level', '1');
            lightbox.style.setProperty('--tx', '0px');
            lightbox.style.setProperty('--ty', '0px');
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
                checkAllImagesLoaded();
            }
        });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });
});
