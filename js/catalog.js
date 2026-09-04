document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('workGrid');
  const statusEl = document.getElementById('catalogStatus');
  const modal = document.getElementById('imageModal');
  const sliderContainer = modal ? modal.querySelector('.slider-container') : null;
  const sliderImages = modal ? modal.querySelector('.slider-images') : null;
  const sliderTitle = document.getElementById('sliderTitle');
  const catalogProducts = document.getElementById('catalogProducts');
  if (!grid) return;

  // Helpers
  function isArabic() {
    if (typeof currentLang !== 'undefined') return currentLang === 'ar';
    return document.body.classList.contains('ar');
  }
  function pickName(obj) {
    return window.MazidAPI ? MazidAPI.pickName(obj, isArabic() ? 'ar' : 'en') : (obj.name_en || obj.nameEn || '');
  }
  function displayImage(obj){
    return window.MazidAPI ? MazidAPI.displayImage(obj) : (obj.image_url||'');
  }
  function formatPrice(p){
    const price = p.final_price ?? p.finalPrice ?? p.base_price ?? p.basePrice ?? null;
    if (price === null || price === '') return '';
    const n = Number(price);
    if (isNaN(n)) return String(price);
    return n.toLocaleString(isArabic() ? 'ar-EG' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' AED';
  }

  // Skeletons
  function showSkeletons(n=8){
    grid.innerHTML = '';
    for(let i=0;i<n;i++){
      const div = document.createElement('div');
      div.className = 'work-box skeleton-box skeleton';
      div.setAttribute('aria-hidden','true');
      grid.appendChild(div);
    }
    if (statusEl) statusEl.textContent = isArabic() ? 'جاري تحميل المجموعات...' : 'Loading collections...';
  }

  function staticFallback(){
    const fallback = [
      { id:'r1', name_en:'Rings', name_ar:'خواتم', image_url:'images/work/Rings.png', products_count: 12 },
      { id:'r2', name_en:'Necklaces', name_ar:'قلائد', image_url:'images/work/Necklaces.png', products_count: 12 },
      { id:'r3', name_en:'Bracelets', name_ar:'أساور', image_url:'images/work/Bracelets.png', products_count: 8 },
      { id:'r4', name_en:'Earrings', name_ar:'أقراط', image_url:'images/work/Earrings.png', products_count: 5 },
      { id:'r5', name_en:'Silver Sets', name_ar:'طقم فضة', image_url:'images/work/Silver_Sets.png', products_count: 26 },
    ];
    renderCategories(fallback, true);
    if (statusEl) {
      statusEl.textContent = isArabic() ? 'عرض محلي (غير متصل)' : 'Showing offline catalog';
      statusEl.classList.add('error');
    }
  }

  function renderCategories(categories, isFallback=false){
    grid.innerHTML = '';
    if (!categories || !categories.length){
      if (statusEl) statusEl.textContent = isArabic() ? 'لا توجد مجموعات متاحة' : 'No collections available';
      // keep fallback? 
      return;
    }
    if (statusEl) {
      statusEl.style.display = 'none';
    }
    categories.forEach(cat=>{
      const box = document.createElement('div');
      box.className = 'work-box';
      box.dataset.categoryId = cat.id;
      box.dataset.categoryName = pickName(cat);
      box.tabIndex = 0;
      box.setAttribute('role','button');
      box.setAttribute('aria-label', pickName(cat));
      const imgUrl = displayImage(cat) || cat.image_url || '';
      const count = cat.products_count ?? cat.productsCount ?? '';
      box.innerHTML = `
        <img src="${imgUrl}" alt="${pickName(cat)}" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/>
        ${count !== '' && count !== 0 ? `<span class="badge-count">${count} items</span>` : ''}
        <div class="work-overlay">
          <h3>${pickName(cat)}</h3>
          <p class="work-cta">${isArabic() ? 'اضغط لعرض المنتجات' : 'Click to view products'}</p>
        </div>
      `;
      box.addEventListener('click', ()=> openCategory(cat));
      box.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openCategory(cat);} });
      grid.appendChild(box);
    });
    // also listen lang switch to re-render names without refetch
    // store last categories
    window._lastCats = categories;
  }

  // Re-render on language change
  const langBtn = document.getElementById('lang-btn');
  if (langBtn){
    langBtn.addEventListener('click', ()=>{
      setTimeout(()=>{
        if (window._lastCats) renderCategories(window._lastCats);
        // if modal open, re-title
        if (modal && modal.style.display==='block' && window._lastCat){
          sliderTitle.textContent = pickName(window._lastCat);
        }
      }, 250);
    });
  }

  async function openCategory(cat){
    window._lastCat = cat;
    if (!modal) return;
    sliderTitle.textContent = pickName(cat);
    // show modal, hide slider images area initially, show products grid loading
    modal.style.display = 'block';
    if (sliderContainer) sliderContainer.style.display = 'none';
    if (sliderImages) sliderImages.innerHTML = '';
    if (catalogProducts){
      catalogProducts.style.display = 'grid';
      catalogProducts.innerHTML = '<div class="empty-products">Loading products…</div>';
    }

    try {
      let products = [];
      // 1) try get_products_by_category
      try {
        const resp = await window.MazidAPI.getProductsByCategory(cat.id);
        // response may be {success, data: []} or {data:[]}
        if (resp && resp.data && Array.isArray(resp.data)) products = resp.data;
        else if (resp && Array.isArray(resp)) products = resp;
        else if (resp && resp.products) products = resp.products;
      } catch(e){ console.warn('getProductsByCategory failed', e.message); }

      // 2) fallback to get_category_product_images (images only -> wrap as product-like)
      if (!products.length){
        try {
          const imgResp = await window.MazidAPI.getCategoryProductImages(cat.id);
          // endpoint returns {images: []} or {success, images}
          let imgs = [];
          if (Array.isArray(imgResp)) imgs = imgResp;
          else if (imgResp && Array.isArray(imgResp.images)) imgs = imgResp.images;
          else if (imgResp && Array.isArray(imgResp.data)) imgs = imgResp.data;
          if (imgs.length){
            products = imgs.map((url,i)=> ({
              id: cat.id+'-img-'+i,
              name_en: pickName(cat) + ' ' + (i+1),
              name_ar: pickName(cat) + ' ' + (i+1),
              main_image_url: url,
              mainImageUrl: url,
              final_price: null
            }));
          }
        } catch(e){ console.warn('getCategoryProductImages failed', e.message); }
      }

      // 3) fallback to home newest if still empty (e.g., GIFT BOXES 0 products)
      if (!products.length){
        renderProductGrid([], cat);
        return;
      }
      renderProductGrid(products, cat);
    } catch (err){
      console.error(err);
      renderProductGrid([], cat, err.message);
    }
  }

  function renderProductGrid(products, cat, errMsg){
    if (!catalogProducts) return;
    catalogProducts.innerHTML = '';
    if (errMsg){
      catalogProducts.innerHTML = `<div class="empty-products catalog-status error">${isArabic()?'حدث خطأ':'Error'}: ${errMsg}<br><button class="btn" onclick="location.reload()">Retry</button></div>`;
      return;
    }
    if (!products || !products.length){
      const msg = isArabic() ? 'لا توجد منتجات في هذه المجموعة حالياً' : 'No products in this collection yet. Please check back soon or contact us.';
      catalogProducts.innerHTML = `<div class="empty-products">${msg}<br><br><a href="#contact" class="btn" onclick="document.getElementById('imageModal').style.display='none'">Contact Us</a></div>`;
      return;
    }
    products.forEach(p=>{
      const img = p.main_image_url || p.mainImageUrl || p.image_url || p.imageUrl || (p.image_urls && p.image_urls[0]) || (p.imageUrls && p.imageUrls[0]) || 'images/MazidMartLogo.png';
      const title = pickName(p) || p.sku || 'Product';
      const weight = p.weight_grams ?? p.weightGrams;
      const price = formatPrice(p);
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/>
        <div class="product-card-body">
          <div class="product-card-title" title="${title}">${title}</div>
          ${weight ? `<div class="product-card-meta">${weight}g</div>` : ''}
          ${price ? `<div class="product-card-price">${price}</div>` : ''}
        </div>
      `;
      catalogProducts.appendChild(card);
    });
  }

  // Expose fallback trigger
  window.MazidCatalog = { renderCategories, showSkeletons, staticFallback };

  // Init flow
  async function init(){
    showSkeletons(4);
    try{
      const resp = await window.MazidAPI.getCategories();
      // resp may be {success, data}
      const cats = resp && resp.data ? resp.data : (Array.isArray(resp) ? resp : []);
      // filter only active, sort by sort_order
      const filtered = cats.filter(c=> c.is_active !== false).sort((a,b)=> (a.sort_order||0)-(b.sort_order||0));
      if (!filtered.length) throw new Error('no categories');
      renderCategories(filtered);
    } catch(e){
      console.warn('Categories fetch failed, fallback', e.message);
      // try to keep skeleton a bit then fallback
      staticFallback();
    }
  }
  init();

  // Close modal handling also hide products grid
  const closeBtn = modal ? modal.querySelector('.close-btn') : null;
  function closeModal(){
    if (modal) modal.style.display='none';
    if (catalogProducts) catalogProducts.style.display='none';
    if (sliderContainer) sliderContainer.style.display='flex';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
  // also re-enable work_slider keyboard handling already there
});
