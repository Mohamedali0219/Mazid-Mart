const menuToggle = document.getElementById("menu-toggle");
const navMenu = document.getElementById("nav-menu");
const overlay = document.getElementById("overlay");

if (menuToggle && navMenu && overlay) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("show");
    overlay.classList.toggle("show", isOpen);
  });

  overlay.addEventListener("click", () => {
    navMenu.classList.remove("show");
    overlay.classList.remove("show");
  });

  document.querySelectorAll(".nav a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("show");
      overlay.classList.remove("show");
    });
  });
}