let target = 0;
let current = 0;
const ease = 0.075;

const sliderWrapper = document.querySelector(".slider-wrapper");

const originalContent = sliderWrapper.innerHTML;
sliderWrapper.innerHTML =
    originalContent +
    originalContent +
    originalContent;

let slides = [];

function refreshSlides() {
    slides = [...sliderWrapper.children];
}

refreshSlides();

let sectionWidth = 0;

// Measures section width accurately using un-transformed DOM offset positions
function measureSection() {
    const totalSlides = slides.length;
    if (totalSlides > 0) {
        const originalCount = totalSlides / 3;
        if (slides[originalCount]) {
            sectionWidth = slides[originalCount].offsetLeft - slides[0].offsetLeft;
            return true;
        }
    }
    return false;
}

// Initial measurement pass
requestAnimationFrame(() => {
    if (measureSection()) {
        current = target = sectionWidth;
    }
});

// Re-verify on full window load to accommodate fully rendered layouts and images
window.addEventListener("load", () => {
    if (measureSection()) {
        current = target = sectionWidth;
    }
});

function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

function updateScaleAndPosition() {
    slides.forEach(slide => {
        // Mathematically stable calculation of slide center relative to the viewport
        // completely bypassing layout thrashing feedback loops from getBoundingClientRect
        const centerPosition = -current + slide.offsetLeft + slide.offsetWidth / 2;
        const distanceFromCenter = centerPosition - window.innerWidth / 2;

        let scale;
        let offsetX;

        if (distanceFromCenter > 0) {
            scale = Math.min(
                1.5,
                1 + distanceFromCenter / window.innerWidth
            );
            offsetX = (scale - 1) * 300;
        } else {
            scale = Math.max(
                0.5,
                1 - Math.abs(distanceFromCenter) / window.innerWidth
            );
            offsetX = 0;
        }

        gsap.set(slide, {
            scale: scale,
            x: offsetX
        });

        const svg = slide.querySelector(".overlay-svg");

        if (svg) {
            const centered =
                Math.abs(distanceFromCenter) <
                window.innerWidth / 3;

            svg.style.pointerEvents =
                centered ? "auto" : "none";
        }
    });
}

function update() {
    // Dynamic fallback measurement mechanism
    if (sectionWidth === 0) {
        if (measureSection()) {
            current = target = sectionWidth;
        }
    }

    current = lerp(current, target, ease);

    if (sectionWidth > 0) {
        const middle = sectionWidth;

        // Perfect looping math around the boundaries
        if (current < middle - sectionWidth / 2) {
            current += sectionWidth;
            target += sectionWidth;
        }
        else if (current > middle + sectionWidth / 2) {
            current -= sectionWidth;
            target -= sectionWidth;
        }
    }

    gsap.set(sliderWrapper, {
        x: -Math.round(current)
    });

    updateScaleAndPosition();

    requestAnimationFrame(update);
}

window.addEventListener("resize", () => {
    measureSection();
});

window.addEventListener("wheel", e => {
    target += e.deltaY;

    gsap.to("#info-panel", {
        opacity: 0,
        y: -10,
        pointerEvents: "none",
        duration: 0.2
    });
}, { passive: true });

update();

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