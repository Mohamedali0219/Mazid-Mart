document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector(".header");
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const overlay = document.getElementById("overlay");
  const navLinks = document.querySelectorAll(".nav a[href^='#'], .nav a[href*='#']");

  // 1. Header scroll styling + active link
  const sections = ["home","work","about","contact"].map(id=> document.getElementById(id)).filter(Boolean);
  function onScroll(){
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
    // active link by scroll
    let current = "home";
    sections.forEach(sec=>{
      const top = sec.getBoundingClientRect().top;
      if (top <= 90) current = sec.id;
    });
    document.querySelectorAll(".nav a").forEach(a=>{
      const href = a.getAttribute("href")||"";
      const isActive = href === "#"+current || href.endsWith("#"+current);
      a.classList.toggle("active", isActive);
    });
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  // smooth scroll for hash links
  navLinks.forEach(a=>{
    a.addEventListener("click", (e)=>{
      const href = a.getAttribute("href");
      if (href && href.includes("#")){
        const hash = href.split("#")[1];
        const target = document.getElementById(hash);
        if (target){
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior:"smooth" });
          history.pushState(null,"","#"+hash);
        }
      }
    });
  });

  // 2. Mobile drawer
  if (menuToggle && navMenu && overlay) {
    function setOpen(open){
      navMenu.classList.toggle("show", open);
      overlay.classList.toggle("show", open);
      document.body.classList.toggle("show-nav-body", open);
      document.body.style.overflow = open ? "hidden" : "";
      menuToggle.textContent = open ? "✕" : "☰";
      menuToggle.setAttribute("aria-expanded", String(open));
    }
    menuToggle.addEventListener("click", () => setOpen(!navMenu.classList.contains("show")));
    overlay.addEventListener("click", () => setOpen(false));
    document.querySelectorAll(".nav a").forEach(link => link.addEventListener("click", () => setOpen(false)));
    window.addEventListener('resize', function() {
      if (window.innerWidth > 860) setOpen(false);
    });
    document.addEventListener('keydown', (e)=>{ if(e.key==="Escape") setOpen(false); });
  }
});
