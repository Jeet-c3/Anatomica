document.addEventListener("DOMContentLoaded", () => {
  const svgEl = document.querySelector(".transition-svg svg");
  if (!svgEl) return;
  
  const paths = Array.from(svgEl.querySelectorAll("path"));

  function getTransitionColors(url) {
    if (url.includes("about.html")) return { bg: "#e0e7ff", fg: "#a3a5ff" };
    if (url.includes("level1/index.html")) return { bg: "#b4ffaa", fg: "#ffffff" };
    if (url.includes("level2/index.html")) return { bg: "#f0ffe0", fg: "#222939" };
    if (url.includes("gallery.html")) return { bg: "#e0e7ff", fg: "#a3a5ff" };
    if (url.includes("profile.html")) return { bg: "#ffffff", fg: "#b6cef1" };
    // if (url.includes("index.html")) return { bg: "#d5f556", fg: "#2764fd" };
    if (url.includes("quiz/index.html")) return { bg: "#ffffff", fg: "#2764fd" };
    
    return { bg: "#f3ffe6", fg: "#6e44ff" }; 
  }

  const currentColors = getTransitionColors(window.location.href);
  
  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = 0; 
    path.setAttribute("stroke-width", "600"); 
    
    path.setAttribute("stroke", index === 0 ? currentColors.bg : currentColors.fg); 
  });

  function revealPage() {
    return new Promise((resolve) => {
      const tween = gsap.timeline({ onComplete: resolve });
      paths.forEach((path) => {
        const length = path.getTotalLength();
        tween.to(
          path,
          {
            strokeDashoffset: -length,     
            attr: { "stroke-width": 200 }, 
            duration: 1.3,                 
            ease: "power1.inOut",          
            onComplete: () => {
              gsap.set(path, { strokeDashoffset: length });
            }
          },
          0
        );
      });
    });
  }

  function coverPage(targetColors) {
    return new Promise((resolve) => {
      paths.forEach((path, index) => {
        path.setAttribute("stroke", index === 0 ? targetColors.bg : targetColors.fg);
      });

      const tween = gsap.timeline({ onComplete: resolve });
      paths.forEach((path) => {
        const length = path.getTotalLength();
        
        gsap.set(path, { strokeDashoffset: length, attr: { "stroke-width": 200 } });

        tween.to(
          path,
          {
            strokeDashoffset: 0,           
            attr: { "stroke-width": 600 }, 
            duration: 1.3,                 
            ease: "power1.inOut",          
          },
          0
        );
      });
    });
  }

  window.playTransitionAndRedirect = function(url) {
      const targetColors = getTransitionColors(url);
      coverPage(targetColors).then(() => {
          window.location.href = url;
      });
  };

  revealPage();

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