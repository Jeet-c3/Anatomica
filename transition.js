// ===== Colorful Global Transition Engine (Relaxed & Refined) =====
document.addEventListener("DOMContentLoaded", () => {
  const svgEl = document.querySelector(".transition-svg svg");
  if (!svgEl) return;
  
  const paths = Array.from(svgEl.querySelectorAll("path"));

  // 🎨 COLOR DICTIONARY: Set the colors for each page destination
  function getTransitionColor(url) {
    if (url.includes("about.html")) return  "#a3a5ff";   // Light Blue
    if (url.includes("level1")) return "#afcdf2";       // Light Pink
    if (url.includes("level2")) return "#222939";       // Ash
    if (url.includes("gallery.html")) return "#a3a5ff"; // Sky Blue (Level 3 / Home)
    if (url.includes("profile.html")) return "#aad7ff"; // Light Cyan
    if (url.includes("index.html")) return "#2764fd";   // Light Green (Login)
    
    return "#5500ff"; // Default backup color
  }

  // Set the colors instantly when the page loads based on the CURRENT page
  const currentColor = getTransitionColor(window.location.href);
  paths.forEach((path) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = 0; 
    path.setAttribute("stroke", currentColor); 
    path.setAttribute("stroke-width", "200"); // Reduced from 2000 for a better brush texture
  });

  // Wipes the brush strokes away to reveal the newly loaded page
  function revealPage() {
    return new Promise((resolve) => {
      const tween = gsap.timeline({ onComplete: resolve });
      paths.forEach((path) => {
        const length = path.getTotalLength();
        tween.to(path, {
          strokeDashoffset: -length,
          attr: { "stroke-width": 400 },
          duration: 1.2, // SLOWED DOWN: Changed from 0.8 to 1.2 seconds
          ease: "power2.inOut",
        }, 0);
      });
    });
  }

  // Draws the brush strokes back over the screen when clicking to leave a page
  function coverPage(targetColor) {
    return new Promise((resolve) => {
      // Change brush color to match the NEXT page
      paths.forEach(path => path.setAttribute("stroke", targetColor));

      const tween = gsap.timeline({ onComplete: resolve });
      paths.forEach((path) => {
        tween.to(path, {
          strokeDashoffset: 0,
          attr: { "stroke-width": 200 }, // Reduced from 2000
          duration: 1.2, // SLOWED DOWN: Changed from 0.8 to 1.2 seconds
          ease: "power2.inOut",
        }, 0);
      });
    });
  }

  // Run the opening reveal immediately
  revealPage();

  // Intercept all menu clicks across all folders seamlessly
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    if (
      link &&
      link.href &&
      link.origin === window.location.origin &&
      !link.getAttribute("href").startsWith("#") &&
      link.getAttribute("target") !== "_blank"
    ) {
      e.preventDefault(); 
      const targetUrl = link.href;
      
      // Determine what color the wipe should be based on where we are going
      const targetColor = getTransitionColor(targetUrl);

      // Play closing animation with the new color, then move folders smoothly
      coverPage(targetColor).then(() => {
        window.location.href = targetUrl;
      });
    }
  });
});