let currentLang = "en";

const translations = {
  en: {
    // Navbar and General
    home: "Home",
    about: "About",
    services: "Services",
    work: "Work",
    contact: "Contact",
    langBtn: "عربية",
    // Hero Section
    hero_title: "MazidMart – Crafted Silver Elegance",
    hero_desc: "Authentic silver jewelry and complete services from design to delivery.",
    hero_btn: "Explore Our Silver Work",
    // Collection Section
    collection_title: "Elegant Silver Collection",
    collection_desc: "At MazidMart, we bring you a diverse collection of elegant silver jewelry with modern designs and premium quality. From rings and bracelets to necklaces, earrings, wedding bands, and anklets, each piece is crafted with exceptional care. We also provide luxurious gift boxes with refined materials to make your gift more valuable and elegant.",
    collection_btn: "Shop Now",
    // Services Section
    // Note: Fixed duplicate key 'work_title' in the original snippet
    // Changed the first 'work_title' to 'services_title' to maintain uniqueness
    services_title: "What We Offer",
    work_title: "Our Work",
    services_title: "What We Offer",
    service1_title: "Custom Silver Jewelry",
    service1_desc: "Design your unique piece with our expert artisans.",
    service2_title: "Repair & Polishing",
    service2_desc: "Restore and maintain the beauty of your silver jewelry.",
    service3_title: "Wholesale & Bulk Orders",
    service3_desc: "Large-scale orders with competitive pricing.",
    service4_title: "Corporate & Gift Solutions",
    service4_desc: "Elegant gifts for your business partners and employees.",
    // Buttons
    btn_design: "Start Designing",
    btn_quote: "Get a Quote",
    btn_sales: "Contact Sales",
    btn_options: "See Options",
    // Work Section
    work_title: "Our Work",
    work_subtitle: "A showcase of our finest silver jewelry and elegant accessories.",
    // About Section
    about_title: "World of Silver Elegance",
    about_desc: "At MazidMart, we bring a legacy of craftsmanship and elegance in every silver piece. From rings to accessories, our passion is to deliver timeless jewelry that adds sparkle to your life.",
    about_sub: "Silver Jewelry",
    about_years: "Years of Experience",
    about_awards: "Awards",
    about_clients: "Happy Clients",
    sale_process: "Sale Process",
    // Why Choose Us Section
    choose_title: "Why Choose Us",
    choose_subtitle: "We provide unmatched quality, value, and trust for all your silver needs.",
    choose_fast: "FAST SHIPPING",
    choose_fast_desc: "Orders Over $500",
    choose_payment: "QUICK PAYMENT",
    choose_payment_desc: "100% Secure",
    choose_cashback: "BIG CASHBACK",
    choose_cashback_desc: "Over 40% Cashback",
    choose_support: "24/7 SUPPORT",
    choose_support_desc: "Ready For You",
    // Cards Section
    card1_tag: "New Arrival",
    card1_title: "Discover New Collection",
    card2_tag: "Engraving",
    card2_title: "Personalise Your Creation",
    // Discover Section
    discover_title: "Discover The Collection",
    discover_desc: "Explore our finest silver jewelry pieces, handcrafted with precision and designed to add elegance to every occasion.",
    discover_btn: "SHOP NOW",
    // Categories
    category_rings: "Rings",
    category_necklaces: "Necklaces",
    category_bracelets: "Bracelets",
    category_earrings: "Earrings",
    category_bands: "Wedding Bands",
    category_anklets: "Anklets",
    category_bars: "Silver Bars",
    category_sets: "Silver Sets",
    category_custom: "Custom Pieces",
    // ✅ NEW CONTACT SECTION
    contact_title: "Contact Us",
    contact_subtitle: "Get in touch with Mr. Mahmud El Mazed for all your inquiries.",
    contact_phone1_label: "Phone Number",
    contact_phone2_label: "WhatsApp",
    contact_email_label: "Email Address",
    contact_address_label: "Location",
    contact_address_value: "Sharjah media city, Sharjah, UAE",
    // ✅ NEW CONTACT BUTTONS
    btn_call: "Call Now",
    btn_email: "Send Email",
    btn_map: "View Map",
    btn_whatsapp: "Chat Now",
    // ✅ NEW FOOTER KEY
    footer_copyright: "© 2025 MazidMart. All rights reserved. Website designed by Qimatrix.",
  },
  ar: {
    // Navbar and General
    home: "الرئيسية",
    about: "من نحن",
    services: "الخدمات",
    work: "الأعمال",
    contact: "تواصل",
    langBtn: "English",
    // Hero Section
    hero_title: "مزيد مارت – أناقة الفضة المصنوعة بإتقان",
    hero_desc: "مجوهرات فضية أصلية وخدمات متكاملة من التصميم حتى التسليم.",
    hero_btn: "استكشف أعمالنا الفضية",
    // Collection Section
    collection_title: "تشكيلة فضية أنيقة",
    collection_desc: "في مزيد مارت، نقدم لك مجموعة متنوعة من المجوهرات الفضية الأنيقة بتصاميم عصرية وجودة ممتازة. من الخواتم والأساور إلى القلائد والأقراط والدبل والحلقان، كل قطعة مصنوعة بعناية فائقة. كما نوفر صناديق هدايا فاخرة بمواد راقية لجعل هديتك أكثر قيمة وأناقة.",
    collection_btn: "تسوق الآن",
    // Services Section
    // Note: Fixed duplicate key 'work_title' in the original snippet
    // Changed the first 'work_title' to 'services_title' to maintain uniqueness
    services_title: "ماذا نقدم",
    service1_title: "مجوهرات فضية مخصصة",
    service1_desc: "صممي قطعتك الخاصة مع خبرائنا الحرفيين.",
    service2_title: "إصلاح وتلميع",
    service2_desc: "استعيدي جمال مجوهراتك الفضية وحافظي عليه.",
    service3_title: "البيع بالجملة والكميات الكبيرة",
    service3_desc: "طلبات كبيرة بأسعار تنافسية.",
    service4_title: "حلول الشركات والهدايا",
    service4_desc: "هدايا أنيقة لشركاء عملك وموظفيك.",
    // Buttons
    btn_design: "ابدأ التصميم",
    btn_quote: "طلب عرض سعر",
    btn_sales: "تواصل مع المبيعات",
    btn_options: "استعرض الخيارات",
    // Work Section
    work_title: "أعمالنا",
    work_subtitle: "عرض لأفضل مجوهراتنا الفضية والإكسسوارات الأنيقة.",
    // About Section
    about_title: "عالم أناقة الفضة",
    about_desc: "في مزيد مارت، نقدم تراثًا من الحرفية والأناقة في كل قطعة فضة. من الخواتم إلى الإكسسوارات، شغفنا هو تقديم مجوهرات خالدة تضيف لمسة من البريق إلى حياتك.",
    about_sub: "مجوهرات فضية",
    about_years: "سنوات الخبرة",
    about_awards: "جوائز",
    about_clients: "عملاء سعداء",
    sale_process: "عملية البيع",
    // Why Choose Us Section
    choose_title: "لماذا تختارنا",
    choose_subtitle: "نقدم لك جودة لا مثيل لها وقيمة عالية وثقة في كل ما يخص الفضة.",
    choose_fast: "شحن سريع",
    choose_fast_desc: "للطلبات فوق 500 دولار",
    choose_payment: "دفع آمن",
    choose_payment_desc: "مضمون 100%",
    choose_cashback: "استرداد نقدي كبير",
    choose_cashback_desc: "أكثر من 40% استرداد",
    choose_support: "دعم 24/7",
    choose_support_desc: "جاهزون من أجلك",
    // Cards Section
    card1_tag: "وصل حديثاً",
    card1_title: "اكتشف التشكيلة الجديدة",
    card2_tag: "النقش",
    card2_title: "خصص إبداعك",
    // Discover Section
    discover_title: "اكتشف المجموعة",
    discover_desc: "استكشف أفضل قطع المجوهرات الفضية لدينا، المصنوعة يدويًا بدقة والمصممة لإضافة الأناقة لكل مناسبة.",
    discover_btn: "تسوق الآن",
    // Categories
    category_rings: "خواتم",
    category_necklaces: "قلائد",
    category_bracelets: "أساور",
    category_earrings: "أقراط",
    category_bands: "دبل",
    category_anklets: "حلقان",
    category_bars: "سبائك فضة",
    category_sets: "طقم فضة",
    category_custom: "قطع مخصصة",
    // ✅ NEW CONTACT SECTION KEYS
    contact_title: "تواصل معنا",
    contact_subtitle: "تواصل مع الأستاذ محمود المزيد لجميع استفساراتكم.",
    contact_phone1_label: "رقم الهاتف",
    contact_phone2_label: "واتساب",
    contact_email_label: "البريد الإلكتروني",
    contact_address_label: "الموقع",
    contact_address_value: "مدينة الشارقة للإعلام، الشارقة، الإمارات",
    // ✅ NEW CONTACT BUTTONS
    btn_call: "اتصل الآن",
    btn_email: "أرسل بريداً",
    btn_map: "عرض الموقع",
    btn_whatsapp: "ابدأ الدردشة",
    // ✅ NEW FOOTER KEY
    footer_copyright: "© 2025 مزيد مارت. جميع الحقوق محفوظة. تم تصميم الموقع بواسطة قيماتركس.",
  }
};

function updateTexts() {
  document.querySelectorAll("[data-key]").forEach(el => {
    let key = el.getAttribute("data-key");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  const langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    const span = langBtn.querySelector("span");
    if (span) {
      span.textContent = translations[currentLang]["langBtn"];
    }
  }

  // ✅ التحكم في الاتجاه والخط
  if (currentLang === "ar") {
    document.body.classList.add("ar");
  } else {
    document.body.classList.remove("ar");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith("ar")) currentLang = "ar";
  
  // ✅ تأخير صغير لضمان تحميل كل العناصر
  setTimeout(updateTexts, 100);

  const langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      currentLang = currentLang === "en" ? "ar" : "en";
      updateTexts();
    });
  }
});

