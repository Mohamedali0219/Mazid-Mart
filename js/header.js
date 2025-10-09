document.addEventListener('DOMContentLoaded', function() {
  // Get all necessary elements
  const header = document.querySelector(".header");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const overlay = document.getElementById("overlay");
  
  // 1. Header scroll-based styling
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // 2. Mobile navigation menu functionality
  if (menuToggle && navMenu && overlay) {
    // Open/close menu on button click
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("show");
      overlay.classList.toggle("show", isOpen);
    });

    // Close menu when clicking the overlay
    overlay.addEventListener("click", () => {
      navMenu.classList.remove("show");
      overlay.classList.remove("show");
    });

    // Close menu when a navigation link is clicked
    document.querySelectorAll(".nav a").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show");
        overlay.classList.remove("show");
      });
    });
    
    // Close menu on resize to desktop view
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            navMenu.classList.remove("show");
            overlay.classList.remove("show");
        }
    });
  }
});