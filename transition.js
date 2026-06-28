// ===== Dual-Layer SVG Page Transition Engine =====
document.addEventListener("DOMContentLoaded", () => {
  const svgEl = document.querySelector(".transition-svg svg");
  if (!svgEl) return;
  
  // The SVG should contain exactly 2 paths for the layered effect
  const paths = Array.from(svgEl.querySelectorAll("path"));

  // 🎨 DUAL-TONE DICTIONARY: Set background (bg) and foreground (fg) colors
  function getTransitionColors(url) {
    if (url.includes("about.html")) return { bg: "#e0e7ff", fg: "#a3a5ff" };
    if (url.includes("level1/index.html")) return { bg: "#ff6cf3e9", fg: "#ffffff" };
    if (url.includes("level2/index.html")) return { bg: "#f0ffe0", fg: "#222939" };
    if (url.includes("gallery.html")) return { bg: "#e0e7ff", fg: "#a3a5ff" };
    if (url.includes("profile.html")) return { bg: "#ffffff", fg: "#b6cef1" };
    // if (url.includes("index.html")) return { bg: "#d5f556", fg: "#2764fd" };
    if (url.includes("quiz/index.html")) return { bg: "#ffffff", fg: "#2764fd" };
    
    // Default fallback (Matches the exact colors from your inspiration file)
    return { bg: "#f3ffe6", fg: "#6e44ff" }; 
  }

  // 1. Setup Initial State (Matches the end state of a "cover" animation)
  const currentColors = getTransitionColors(window.location.href);
  
  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = 0; // Start fully covering the screen
    path.setAttribute("stroke-width", "600"); // Thick stroke for full coverage
    
    // Index 0 is the bottom path (bg), Index 1 is the top path (fg)
    path.setAttribute("stroke", index === 0 ? currentColors.bg : currentColors.fg); 
  });

  // 2. Reveal Animation (Corresponds to enter() in the inspiration)
  function revealPage() {
    return new Promise((resolve) => {
      const tween = gsap.timeline({ onComplete: resolve });
      paths.forEach((path) => {
        const length = path.getTotalLength();
        tween.to(
          path,
          {
            strokeDashoffset: -length,     // Sweep off-screen
            attr: { "stroke-width": 200 }, // Taper the stroke down as it leaves
            duration: 1.3,                   // Matching inspiration timing
            ease: "power1.inOut",          // Matching inspiration ease
            onComplete: () => {
              // Invisibly reset the path to the starting side for the next transition
              gsap.set(path, { strokeDashoffset: length });
            }
          },
          0
        );
      });
    });
  }

  // 3. Cover Animation (Corresponds to leave() in the inspiration)
  function coverPage(targetColors) {
    return new Promise((resolve) => {
      // Set the stroke colors based on the page we are about to navigate to
      paths.forEach((path, index) => {
        path.setAttribute("stroke", index === 0 ? targetColors.bg : targetColors.fg);
      });

      const tween = gsap.timeline({ onComplete: resolve });
      paths.forEach((path) => {
        const length = path.getTotalLength();
        
        // Ensure path starts at the invisible ready position with a tapered width
        gsap.set(path, { strokeDashoffset: length, attr: { "stroke-width": 200 } });

        tween.to(
          path,
          {
            strokeDashoffset: 0,           // Fill the screen
            attr: { "stroke-width": 600 }, // Expand stroke for gapless coverage
            duration: 1.3,                   // Matching inspiration timing
            ease: "power1.inOut",          // Matching inspiration ease
          },
          0
        );
      });
    });
  }

  // EXPORT TO WINDOW: Allow other scripts (like Firebase Auth) to trigger this manually
  window.playTransitionAndRedirect = function(url) {
      const targetColors = getTransitionColors(url);
      coverPage(targetColors).then(() => {
          window.location.href = url;
      });
  };

  // Run the opening reveal immediately on page load
  revealPage();

  // Intercept standard anchor clicks for smooth routing
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");

    if (
      link &&
      link.href &&
      link.origin === window.location.origin &&
      !link.getAttribute("href").startsWith("#") &&
      !link.getAttribute("href").startsWith("javascript") &&
      link.getAttribute("target") !== "_blank"
    ) {
      e.preventDefault(); 
      const targetUrl = link.href;
      window.playTransitionAndRedirect(targetUrl);
    }
  });
});