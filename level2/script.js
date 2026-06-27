document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
        'hop',
        'M0,0 C0.488,0.02 0.467,0.286 0.5,0.5 0.532,0.712 0.58,1 1,1'
    );

    const slides = Array.from(document.querySelectorAll('.slide'));
    const totalSlides = slides.length;
    let activeIndex = 0;
    let isAnimating = false;

    // Helper for circular array indexing
    const getIndex = (offset) => (activeIndex + offset + totalSlides) % totalSlides;

    const clipPath = {
        closed: 'polygon(25% 30%, 75% 30%, 75% 70%, 25% 70%)',
        // Expanded bottom boundary to 120% to reveal the hanging tag
        open: 'polygon(0% 0%, 100% 0%, 100% 120%, 0% 120%)',
    };

    const slidePositions = {
        prev: { left: '15%', rotation: -90 },
        active: { left: '50%', rotation: 0 },
        next: { left: '85%', rotation: 90 },
    };

    // Initialize layout
    function initSlider() {
        slides.forEach((slide) => {
            gsap.set(slide, { 
                xPercent: -50, 
                yPercent: -50, 
                scale: 0, 
                opacity: 0, 
                clipPath: clipPath.closed, 
                zIndex: 0 
            });
            gsap.set(slide.querySelector('.slide-inner'), { rotation: 0 });
            slide.querySelector('.overlay-svg').style.pointerEvents = 'none';
            
            // Hide all tags and shift them up slightly by default
            gsap.set(slide.querySelector('.slide-tag'), { opacity: 0, y: -20 });
        });

        const prevSlide = slides[getIndex(-1)];
        const activeSlide = slides[activeIndex];
        const nextSlide = slides[getIndex(1)];

        // Prep Prev
        gsap.set(prevSlide, { ...slidePositions.prev, scale: 1, opacity: 1, zIndex: 1 });
        gsap.set(prevSlide.querySelector('.slide-inner'), { rotation: -slidePositions.prev.rotation });

        // Prep Active
        gsap.set(activeSlide, { ...slidePositions.active, clipPath: clipPath.open, scale: 1, opacity: 1, zIndex: 2 });
        gsap.set(activeSlide.querySelector('.slide-inner'), { rotation: -slidePositions.active.rotation });
        activeSlide.querySelector('.overlay-svg').style.pointerEvents = 'auto'; // Enable anatomica hitboxes
        
        // Ensure the tag on the currently active slide is fully visible
        gsap.set(activeSlide.querySelector('.slide-tag'), { opacity: 1, y: 0 });

        // Prep Next
        gsap.set(nextSlide, { ...slidePositions.next, scale: 1, opacity: 1, zIndex: 1 });
        gsap.set(nextSlide.querySelector('.slide-inner'), { rotation: -slidePositions.next.rotation });
    }

    initSlider();

    // Transition Handler
    function transition(direction) {
        if (isAnimating) return;
        isAnimating = true;

        const outgoingPos = direction === 'next' ? 'prev' : 'next';
        const incomingPos = direction === 'next' ? 'next' : 'prev';

        const outgoingSlide = slides[getIndex(direction === 'next' ? -1 : 1)];
        const activeSlide = slides[activeIndex];
        const incomingSlide = slides[getIndex(direction === 'next' ? 1 : -1)];
        const newSlide = slides[getIndex(direction === 'next' ? 2 : -2)];

        // Disable hitboxes on outgoing active slide
        activeSlide.querySelector('.overlay-svg').style.pointerEvents = 'none';

        // Fade out and slide up the tag on the outgoing slide
        gsap.to(activeSlide.querySelector('.slide-tag'), { 
            opacity: 0, 
            y: -20, 
            duration: 0.5 
        });

        // Fade in and drop down the tag on the incoming slide
        gsap.to(incomingSlide.querySelector('.slide-tag'), { 
            opacity: 1, 
            y: 0, 
            duration: 1.5, 
            delay: 0.4, 
            ease: 'power3.out' 
        });

        // Animate incoming to active
        gsap.to(incomingSlide, { ...slidePositions.active, clipPath: clipPath.open, duration: 2, ease: 'hop', zIndex: 2 });
        gsap.to(incomingSlide.querySelector('.slide-inner'), { rotation: -slidePositions.active.rotation, duration: 2, ease: 'hop' });

        // Animate active to outgoing
        gsap.to(activeSlide, { ...slidePositions[outgoingPos], clipPath: clipPath.closed, duration: 2, ease: 'hop', zIndex: 1 });
        gsap.to(activeSlide.querySelector('.slide-inner'), { rotation: -slidePositions[outgoingPos].rotation, duration: 2, ease: 'hop' });

        // Animate old outgoing away
        gsap.to(outgoingSlide, { scale: 0, opacity: 0, duration: 2, ease: 'hop', zIndex: 0 });

        // Animate brand new slide into position
        gsap.set(newSlide, { ...slidePositions[incomingPos], scale: 0, opacity: 0, clipPath: clipPath.closed, zIndex: 1 });
        gsap.set(newSlide.querySelector('.slide-inner'), { rotation: -slidePositions[incomingPos].rotation });
        gsap.to(newSlide, { scale: 1, opacity: 1, duration: 2, ease: 'hop' });

        activeIndex = getIndex(direction === 'next' ? 1 : -1);

        setTimeout(() => {
            slides[activeIndex].querySelector('.overlay-svg').style.pointerEvents = 'auto';
            isAnimating = false;
        }, 2000);

        // Hide info panel when moving
        gsap.to("#info-panel", {
            opacity: 0,
            y: -10,
            pointerEvents: "none",
            duration: 0.2
        });
    }

    // Scroll Control
    window.addEventListener("wheel", e => {
        if (e.deltaY > 0) transition('next');
        else if (e.deltaY < 0) transition('prev');
    }, { passive: true });

    // Click to cycle 
    slides.forEach((slide, i) => {
        slide.addEventListener('click', (e) => {
            // Ignore if clicking a hitbox on the active slide
            if (e.target.classList.contains('hitbox') && i === activeIndex) return;

            if (isAnimating) return;
            if (i === getIndex(1)) transition('next');
            else if (i === getIndex(-1)) transition('prev');
        });
    });
});

// --- ANATOMICA ORIGINAL LOGIC (Unchanged) --- //

window.updateInfo = function (name, text) {
    const titleEl = document.getElementById("title");
    const descEl = document.getElementById("description");
    const panel = document.getElementById("info-panel");

    titleEl.innerText = name;
    descEl.innerText = text;

    gsap.to(panel, {
        opacity: 1,
        y: 0,
        pointerEvents: "auto",
        duration: 0.4,
        ease: "back.out(1.5)"
    });
};

let navTimer;
const navBar = document.querySelector("header.clay-nav");
let isNavVisible = true;

function hideNav() {
    gsap.to(navBar, {
        y: -120,     
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        pointerEvents: "none" 
    });
    isNavVisible = false;
}

function showNav() {
    gsap.to(navBar, {
        y: 0,       
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        pointerEvents: "auto"
    });
    isNavVisible = true;
}

window.addEventListener("mousemove", (e) => {
    if (e.clientY <= 100) {
        clearTimeout(navTimer); 
        if (!isNavVisible) {
            showNav();
        }
    } else {
        if (isNavVisible) {
            clearTimeout(navTimer);
            navTimer = setTimeout(hideNav, 1000);
        }
    }
});
navTimer = setTimeout(hideNav, 3000);