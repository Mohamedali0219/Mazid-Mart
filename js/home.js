// Home dynamic sections — pulls from Supabase get_home_screen_data (same as app home SDUI)
document.addEventListener('DOMContentLoaded', async () => {
  const heroSlider = document.querySelector('.hero-slider');
  const heroContent = document.querySelector('.hero-content');
  const dynamicContainer = document.getElementById('dynamicHomeSections');
  const silverTicker = document.getElementById('silverTicker');
  if (!window.MazidAPI) return;

  function isArabic(){ if(typeof currentLang!=='undefined') return currentLang==='ar'; return document.body.classList.contains('ar'); }
  function pickTitle(sec){ return isArabic() ? (sec.title_ar || sec.titleAr) : (sec.title_en || sec.titleEn); }
  function pickSubtitle(sec){ return isArabic() ? (sec.subtitle_ar || sec.subtitleAr) : (sec.subtitle_en || sec.subtitleEn); }
  function pickName(o){ return window.MazidAPI.pickName(o, isArabic()?'ar':'en'); }

  // 1. Fetch home data
  let home = null;
  try {
    home = await window.MazidAPI.getHome();
  } catch(e){
    console.warn('home fetch failed', e.message);
    return;
  }
  if (!home || !home.success || !Array.isArray(home.data)) return;

  const sections = home.data;

  // 2. Hero carousel — replace static slides with live Cloudinary banners
  const heroSec = sections.find(s=> s.section_type==='hero_carousel' || s.section_type==='hero_banners');
  if (heroSec && Array.isArray(heroSec.data) && heroSec.data.length && heroSlider){
    // keep fallback if less than 2? we have 2 from API
    heroSlider.innerHTML = '';
    heroSec.data
      .sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))
      .forEach((b,i)=>{
        const div=document.createElement('div');
        div.className='slide'+(i===0?' active':'');
        const img = b.image_url || b.imageUrl || '';
        div.style.backgroundImage = `url('${img}')`;
        div.setAttribute('role','img');
        div.setAttribute('aria-label', pickName(b) || b.title_en || 'MazidMart banner');
        heroSlider.appendChild(div);
      });
    // update hero text from first banner if exists
    const first = heroSec.data[0];
    if (first && heroContent){
      const title = isArabic()? (first.title_ar||first.title_en) : (first.title_en||first.title_ar);
      const desc = isArabic()? (first.description_ar||first.description_en) : (first.description_en||first.description_ar);
      if(title) {
        const h1=heroContent.querySelector('h1');
        if(h1){ h1.textContent = title; h1.style.fontFamily='"Playfair Display", serif'; }
      }
      if(desc){
        const p=heroContent.querySelector('p');
        if(p) p.textContent=desc;
      }
    }
    // create dots
    if (!document.querySelector('.hero-dots')){
      const dots=document.createElement('div');
      dots.className='hero-dots';
      dots.style.cssText='position:absolute; bottom:18px; left:50%; transform:translateX(-50%); display:flex; gap:8px; z-index:3;';
      heroSec.data.forEach((_,i)=>{
        const d=document.createElement('button');
        d.style.cssText='width:8px; height:8px; border-radius:50%; border:1px solid #fff; background:'+(i===0?'#fff':'transparent')+'; cursor:pointer;';
        d.setAttribute('aria-label','slide '+(i+1));
        d.onclick=()=>{
          document.querySelectorAll('.hero-slider .slide').forEach((s,idx)=> s.classList.toggle('active', idx===i));
          dots.querySelectorAll('button').forEach((b,idx)=> b.style.background= idx===i ? '#fff' : 'transparent');
        };
        dots.appendChild(d);
      });
      heroSlider.parentElement.appendChild(dots);
      // sync existing slider.js auto-rotation with dots (optional)
      let idx=0;
      setInterval(()=>{
        idx=(idx+1)%heroSec.data.length;
        document.querySelectorAll('.hero-slider .slide').forEach((s,i)=> s.classList.toggle('active', i===idx));
        dots.querySelectorAll('button').forEach((b,i)=> b.style.background= i===idx ? '#fff' : 'transparent');
      }, 5000);
    }
  }

  // 3. Helper to render product grid section
  function renderProductsSection(sec, type){
    const title = pickTitle(sec) || sec.section_type;
    const subtitle = pickSubtitle(sec);
    const products = Array.isArray(sec.data) ? sec.data : [];
    if (!products.length) return '';
    const cards = products.slice(0,8).map(p=>{
      const img = p.image_urls?.[0] || p.main_image_url || p.imageUrl || p.image_url || 'images/MazidMartLogo.png';
      const name = pickName(p);
      const price = p.final_price ?? p.finalPrice ?? p.base_price ?? p.basePrice ?? p.price ?? null;
      const priceStr = price!=null ? Number(price).toLocaleString(isArabic()?'ar-EG':'en-US', {maximumFractionDigits:2})+' AED' : '';
      return `
        <div class="product-card" style="cursor:pointer" onclick="location.href='product.html?id=${p.id}'">
          <img src="${img}" alt="${name}" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/>
          <div class="product-card-body">
            <div class="product-card-title">${name}</div>
            ${priceStr ? `<div class="product-card-price">${priceStr}</div>` : ''}
          </div>
        </div>`;
    }).join('');
    return `
      <section class="home-products-section" style="padding:56px 20px; max-width:1280px; margin:0 auto;">
        <div style="text-align:center; margin-bottom:22px;">
          <h2 style="font-family:'Playfair Display',serif; font-size:clamp(1.5rem,4vw,2rem); color:var(--color-primary);">${title}</h2>
          ${subtitle ? `<p style="color:var(--color-text-muted); margin-top:6px;">${subtitle}</p>` : ''}
        </div>
        <div class="product-modal-grid" style="max-height:none; overflow:visible;">${cards}</div>
        <div style="text-align:center; margin-top:16px;"><a href="categories.html" class="btn" style="text-decoration:none;">${isArabic()?'تصفح الكل':'Browse all'} →</a></div>
      </section>`;
  }

  function renderBannerSection(sec){
    const banners = Array.isArray(sec.data) ? sec.data : [];
    if (!banners.length) return '';
    // take first banner
    const b = banners[0];
    const img = b.image_url || '';
    const title = pickTitle({title_en:b.title_en,title_ar:b.title_ar}) || b.title_en || '';
    const desc = isArabic() ? (b.description_ar||'') : (b.description_en||'');
    return `
      <section class="home-banner-section" style="max-width:1280px; margin:24px auto; padding:0 20px;">
        <div style="position:relative; border-radius:16px; overflow:hidden; height: 360px; background:#000;">
          <img src="${img}" alt="${title}" loading="lazy" style="width:100%; height:100%; object-fit:cover; opacity:0.92;" />
          <div style="position:absolute; inset:0; background: linear-gradient(to right, rgba(15,61,36,0.78) 0%, rgba(15,61,36,0.15) 70%); display:flex; align-items:center; padding:24px;">
            <div style="max-width:520px; color:#fff;">
              <h3 style="font-family:'Playfair Display',serif; font-size:clamp(1.4rem,4vw,2rem); margin-bottom:8px;">${title || 'Seasonal Offer'}</h3>
              ${desc ? `<p style="opacity:0.92; line-height:1.6;">${desc}</p>` : ''}
              <a href="${b.is_category && b.category_id ? `categories.html?id=${b.category_id}` : (b.is_product && b.product_id ? `product.html?id=${b.product_id}` : 'categories.html')}" class="collection-btn" style="margin-top:14px; display:inline-block; border-color:#fff; color:#fff;">${isArabic()?'تسوق الآن':'Shop Now'}</a>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderCategoryHighlight(sec){
    const cat = sec.data;
    if (!cat || !cat.id) return '';
    const title = pickTitle(sec) || pickName(cat);
    const desc = isArabic() ? (cat.description_ar||'') : (cat.description_en||'');
    const img = cat.product_image_url || cat.image_url || (cat.product_images && cat.product_images[0]) || '';
    const tag = isArabic() ? 'مجموعة مميزة' : 'Featured Collection';
    const btnText = isArabic() ? 'استكشف المجموعة' : 'Explore collection';
    const arrow = isArabic() ? '←' : '→';
    return `
      <section class="cat-highlight-section">
        <div class="cat-highlight-card">
          <div class="cat-highlight-content">
            <span class="cat-highlight-tag">${tag}</span>
            <h3 class="cat-highlight-title">${title}</h3>
            ${desc ? `<p class="cat-highlight-desc">${desc}</p>` : ''}
            <a href="categories.html?id=${cat.id}" class="cat-highlight-btn">
              <span>${btnText}</span>
              <span class="btn-arrow">${arrow}</span>
            </a>
          </div>
          <a href="categories.html?id=${cat.id}" class="cat-highlight-img-wrap" aria-label="${title}">
            <img src="${img}" alt="${pickName(cat)}" class="cat-highlight-img" loading="lazy" onerror="this.src='images/MazidMartLogo.png'"/>
          </a>
        </div>
      </section>`;
  }

  // 4. Build dynamic HTML — reordered so Featured LADIES is under New Arrivals (as requested)
  let newArrivalsHtml = '';
  let categoryHighlightsHtml = '';
  let otherProductsHtml = '';
  sections.forEach(sec=>{
    switch(sec.section_type){
      case 'products_grid':
        if (sec.title_en && sec.title_en.toLowerCase().includes('new arrival')) newArrivalsHtml += renderProductsSection(sec);
        break;
      case 'category_highlight':
        categoryHighlightsHtml += renderCategoryHighlight(sec);
        break;
      case 'products_carousel':
        otherProductsHtml += renderProductsSection(sec);
        break;
      case 'banners_seasonal':
      case 'banners_grid':
        // Seasonal banner section removed as requested
        break;
      default:
        break;
    }
  });
  let html = newArrivalsHtml + categoryHighlightsHtml + otherProductsHtml;

  // Also render banners_seasonal and banners_grid if not yet (ensure at least one banner)
  // If no html yet from seasonal, fallback

  if (dynamicContainer && html){
    dynamicContainer.innerHTML = html;
  }

  // 5. Silver price ticker — only show if valid price (avoid empty green bar between header and hero)
  if (silverTicker){
    try{
      const key = window.MAZID_CONFIG.SUPABASE_ANON_KEY;
      const url = window.MAZID_CONFIG.SUPABASE_URL + "/rest/v1/silver_prices?select=*&order=created_at.desc&limit=1";
      const r = await fetch(url, { headers: { apikey: key, Authorization: 'Bearer '+key } });
      if (r.ok){
        const arr = await r.json();
        if (Array.isArray(arr) && arr.length){
          const sp = arr[0];
          const priceRaw = sp.price ?? sp.price_per_gram ?? sp.current_price ?? '';
          const price = String(priceRaw).trim();
          if (!price || price === '0' || price === '0.0') { silverTicker.style.display='none'; return; }
          const unit = sp.currency || 'AED';
          const updated = sp.created_at ? new Date(sp.created_at).toLocaleDateString(isArabic()?'ar-EG':'en-US') : '';
          silverTicker.innerHTML = `<span>Silver •</span> <strong>${price} ${unit}/g</strong> <span style="opacity:.8;">${updated}</span>`;
          silverTicker.classList.add('show');
        } else {
          silverTicker.style.display='none';
        }
      } else {
        silverTicker.style.display='none';
      }
    }catch(e){ silverTicker.style.display='none'; }
  }

  // 6. Enhance static sections attractiveness: add fade-in on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting){
        ent.target.style.opacity='1';
        ent.target.style.transform='translateY(0)';
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.about-stats, .collection, .why-choose-us, .discover-collection, .services, .our-work, .home-products-section, .home-banner-section').forEach(el=>{
    el.style.opacity='0';
    el.style.transform='translateY(14px)';
    el.style.transition='opacity .6s ease, transform .6s ease';
    observer.observe(el);
  });
});
