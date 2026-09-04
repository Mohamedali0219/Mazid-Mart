document.addEventListener('DOMContentLoaded', () => {
    // If live catalog is active (api.js + catalog.js loaded), this file only provides slider navigation.
    // Live categories use data-categoryId and are handled by catalog.js; skip legacy hard-coded logic.
    if (window.MazidAPI && window.MazidCatalog) {
      // attach only navigation handlers and exit early for category logic
      const modalR = document.getElementById('imageModal');
      const closeBtnR = modalR ? modalR.querySelector('.close-btn') : null;
      const sliderImagesContainerR = modalR ? modalR.querySelector('.slider-images') : null;
      const prevBtnR = modalR ? modalR.querySelector('.prev-btn') : null;
      const nextBtnR = modalR ? modalR.querySelector('.next-btn') : null;
      let currentSlideIndexR = 0;
      let imagesR = [];
      function showSlideR(index){
        if(!sliderImagesContainerR || !imagesR.length) return;
        if(index >= imagesR.length) currentSlideIndexR = 0; else if(index<0) currentSlideIndexR = imagesR.length-1; else currentSlideIndexR=index;
        sliderImagesContainerR.style.transform = `translateX(${-currentSlideIndexR*100}%)`;
      }
      function getLangR(){ if(typeof currentLang!=='undefined') return currentLang; if(window.currentLang) return window.currentLang; if(document.body.classList.contains('ar')) return 'ar'; return 'en';}
      if(prevBtnR) prevBtnR.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); const isAr=getLangR()==='ar'; showSlideR(currentSlideIndexR + (isAr?1:-1));});
      if(nextBtnR) nextBtnR.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); const isAr=getLangR()==='ar'; showSlideR(currentSlideIndexR + (isAr?-1:1));});
      if(closeBtnR) closeBtnR.addEventListener('click', ()=>{ modalR.style.display='none'; const cp=document.getElementById('catalogProducts'); if(cp) cp.style.display='none'; const sc=modalR.querySelector('.slider-container'); if(sc) sc.style.display='flex';});
      window.addEventListener('click', (e)=>{ if(e.target===modalR){ modalR.style.display='none'; }});
      return;
    }
    // 1. Get DOM elements (legacy fallback when API unavailable)
    const modal = document.getElementById('imageModal');
    const closeBtn = modal.querySelector('.close-btn');
    const sliderImagesContainer = modal.querySelector('.slider-images');
    const prevBtn = modal.querySelector('.prev-btn');
    const nextBtn = modal.querySelector('.next-btn');
    const sliderTitle = document.getElementById('sliderTitle');
    const workBoxes = document.querySelectorAll('.work-box');

    let currentSlideIndex = 0;
    let images = []; // Array to hold the image paths for the current category
    let currentCategory = ''; // Store current category for language switching

    // 2. Define the image data with actual filenames from the folders (ONLY categories with real images)
    const categoryImages = {
        'Rings': ['ring1.jpg', 'ring2.jpg', 'ring3.jpg', 'ring4.jpg', 'ring5.jpg', 'ring6.jpg', 'ring7.jpg', 'ring8.jpg', 'ring9.jpg', 'ring10.jpg', 'ring11.jpg', 'ring12.jpg'],
        'Necklaces': ['necklaces1.jpg', 'necklaces2.jpg', 'necklaces3.jpg', 'necklaces4.jpg', 'necklaces5.jpg', 'necklaces6.jpg', 'necklaces7.jpg', 'necklaces8.jpg', 'necklaces9.jpg', 'necklaces10.jpg', 'necklaces11.jpg', 'necklaces12.jpg'],
        'Bracelets': ['Bracelets1.jpg', 'Bracelets2.jpg', 'Bracelets3.jpg', 'Bracelets4.jpg', 'Bracelets5.jpg', 'Bracelets6.jpg', 'Bracelets7.jpg', 'Bracelets8.jpg'],
        'Earrings': ['earrings1.jpg', 'earrings2.jpg', 'earrings3.jpg', 'earrings4.jpg', 'WhatsApp Image 2025-10-08 at 22.33.44_b7cf4a70.jpg'],
        'Silver Sets': ['silver_sets1.jpg', 'silver_sets2.jpg', 'silver_sets22.jpg', 'silver_sets3.jpg', 'silver_sets4.jpg', 'silver_sets5.jpg', 'silver_sets6.jpg', 'silver_sets7.jpg', 'silver_sets8.jpg', 'silver_sets9.jpg', 'silver_sets10.jpg', 'silver_sets11.jpg', 'silver_sets12.jpg', 'silver_sets13.jpg', 'silver_sets14.jpg', 'silver_sets15.jpg', 'silver_sets16.jpg', 'silver_sets17.jpg']
        // Note: Anklets, Silver Bars, Custom Pieces removed - no images in folders
    };

    // 3. Category name translations (Arabic/English)
    const categoryTranslations = {
        'Rings': { en: 'Rings', ar: 'خواتم' },
        'Necklaces': { en: 'Necklaces', ar: 'قلائد' },
        'Bracelets': { en: 'Bracelets', ar: 'أساور' },
        'Earrings': { en: 'Earrings', ar: 'أقراط' },
        'Anklets': { en: 'Anklets', ar: 'حلقان' },
        'Silver Bars': { en: 'Silver Bars', ar: 'سبائك فضة' },
        'Silver Sets': { en: 'Silver Sets', ar: 'طقم فضة' },
        'Custom Pieces': { en: 'Custom Pieces', ar: 'قطع مخصصة' }
    };

    // 4. Get current language from global variable
    function getCurrentLanguage() {
        // Check multiple possible locations for the language variable
        if (typeof currentLang !== 'undefined') {
            return currentLang;
        }
        if (window.currentLang) {
            return window.currentLang;
        }
        // Check if body has 'ar' class (set by lang.js)
        if (document.body.classList.contains('ar')) {
            return 'ar';
        }
        return 'en';
    }

    // 5. Get translated category name
    function getTranslatedCategoryName(category) {
        const lang = getCurrentLanguage();
        if (categoryTranslations[category] && categoryTranslations[category][lang]) {
            return categoryTranslations[category][lang];
        }
        return category; // Fallback to original name
    }

    // 6. Helper function to show a specific slide
    function showSlide(index) {
        if (images.length === 0) return;

        // Loop back to start/end if necessary
        if (index >= images.length) {
            currentSlideIndex = 0;
        } else if (index < 0) {
            currentSlideIndex = images.length - 1;
        } else {
            currentSlideIndex = index;
        }

        // Calculate the transform value for the sliding effect
        const offset = -currentSlideIndex * 100;
        sliderImagesContainer.style.transform = `translateX(${offset}%)`;
    }

    // 7. Function to load and display the images for a category
    function loadCategory(categoryName) {
        const categoryData = categoryImages[categoryName];
        
        // Check if category has images
        if (!categoryData || categoryData.length === 0) {
            console.warn('No images available for category:', categoryName);
            const lang = getCurrentLanguage();
            const message = lang === 'ar' 
                ? 'لا توجد صور متاحة لهذه الفئة' 
                : 'No images available for this category';
            alert(message);
            return; 
        }

        images = categoryData;
        currentCategory = categoryName; // Store for language switching
        sliderImagesContainer.innerHTML = ''; // Clear previous images
        
        // Set translated title
        sliderTitle.textContent = getTranslatedCategoryName(categoryName);

        images.forEach(imageFile => {
            const img = document.createElement('img');
            // Map category name to actual folder name (Silver Sets -> silver_sets)
            const folderName = categoryName === 'Silver Sets' ? 'silver_sets' : categoryName;
            img.src = `images/mazid products/${folderName}/${imageFile}`; 
            img.alt = `${getTranslatedCategoryName(categoryName)} - ${imageFile}`;
            sliderImagesContainer.appendChild(img);
        });

        currentSlideIndex = 0;
        // Adjust the container width to fit all images side-by-side
        sliderImagesContainer.style.width = `${images.length * 100}%`; 
        showSlide(0); // Show the first image
        modal.style.display = 'block'; // Display the modal
    }

    // 8. Initialize - Disable categories without images
    workBoxes.forEach(box => {
        const category = box.getAttribute('data-category');
        const hasImages = categoryImages[category] && categoryImages[category].length > 0;
        
        if (!hasImages) {
            // Visually disable categories without images
            box.style.opacity = '0.5';
            box.style.cursor = 'not-allowed';
            box.style.pointerEvents = 'none';
            
            // Add a visual indicator
            const overlay = box.querySelector('.work-overlay');
            if (overlay) {
                overlay.style.opacity = '0.7';
            }
        }
    });

    // 9. Event Listeners - Open Modal on Work Box Click
    workBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const category = box.getAttribute('data-category');
            const hasImages = categoryImages[category] && categoryImages[category].length > 0;
            
            // Only open if category has images
            if (category && hasImages) {
                loadCategory(category);
            }
        });
    });

    // 10. Listen for language changes and update modal title if open
    const langBtn = document.getElementById('lang-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            // Small delay to ensure currentLang is updated
            setTimeout(() => {
                // If modal is open, update the title
                if (modal.style.display === 'block' && currentCategory) {
                    sliderTitle.textContent = getTranslatedCategoryName(currentCategory);
                }
            }, 200);
        });
    }

    // 11. Also listen for body class changes (alternative method)
    const observer = new MutationObserver(() => {
        if (modal.style.display === 'block' && currentCategory) {
            sliderTitle.textContent = getTranslatedCategoryName(currentCategory);
        }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Close Modal when clicking the X
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close Modal when clicking outside of the content
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Slider navigation - with RTL support for Arabic
    prevBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isArabic = getCurrentLanguage() === 'ar';
        
        // In Arabic (RTL), prev button is on right and should go forward
        if (isArabic) {
            showSlide(currentSlideIndex + 1);
        } else {
            showSlide(currentSlideIndex - 1);
        }
    });

    nextBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isArabic = getCurrentLanguage() === 'ar';
        
        // In Arabic (RTL), next button is on left and should go backward
        if (isArabic) {
            showSlide(currentSlideIndex - 1);
        } else {
            showSlide(currentSlideIndex + 1);
        }
    });

    // Keyboard navigation (optional) - with RTL support
    document.addEventListener('keydown', (event) => {
        if (modal.style.display === 'block') {
            const isArabic = getCurrentLanguage() === 'ar';
            
            if (event.key === 'ArrowLeft') {
                // In Arabic (RTL), left arrow should go forward
                if (isArabic) {
                    showSlide(currentSlideIndex + 1);
                } else {
                    showSlide(currentSlideIndex - 1);
                }
            } else if (event.key === 'ArrowRight') {
                // In Arabic (RTL), right arrow should go backward
                if (isArabic) {
                    showSlide(currentSlideIndex - 1);
                } else {
                    showSlide(currentSlideIndex + 1);
                }
            } else if (event.key === 'Escape') {
                modal.style.display = 'none';
            }
        }
    });
});