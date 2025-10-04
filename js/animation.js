// ظهور السكاشن بالأنيميشن
const sections = document.querySelectorAll("section, .products .container, .services-grid, .work-grid, .features-grid, .promo");

const revealOnScroll = () => {
  let triggerBottom = window.innerHeight * 0.85;

  sections.forEach(sec => {
    const secTop = sec.getBoundingClientRect().top;
    if (secTop < triggerBottom) {
      sec.classList.add("show");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// ظهور السكاشن بالأنيميشن عند التمرير
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".container").forEach((el) => observer.observe(el));
