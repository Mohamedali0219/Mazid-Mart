// MazidMart API — free (no-auth) endpoints only
(function(){
  const cfg = window.MAZID_CONFIG;
  const CACHE_TTL = 5 * 60 * 1000; // 5 min

  function headers() {
    return {
      "apikey": cfg.SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
      "Authorization": "Bearer " + cfg.SUPABASE_ANON_KEY
    };
  }

  function withCache(key, fetcher) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const { t, v } = JSON.parse(raw);
        if (Date.now() - t < CACHE_TTL) return Promise.resolve(v);
      }
    } catch {}
    return fetcher().then(v => {
      try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch {}
      return v;
    });
  }

  async function rpcGet(funcName, params = {}) {
    const url = new URL(cfg.RPC_BASE + funcName);
    Object.entries(params).forEach(([k,v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), { headers: headers() });
    if (!res.ok) {
      const txt = await res.text().catch(()=> "");
      throw new Error(funcName + " " + res.status + " " + txt.slice(0,300));
    }
    return res.json();
  }

  async function rpcPost(funcName, body = {}) {
    const res = await fetch(cfg.RPC_BASE + funcName, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const txt = await res.text().catch(()=> "");
      throw new Error(funcName + " " + res.status + " " + txt.slice(0,300));
    }
    return res.json();
  }

  window.MazidAPI = {
    getCategories: (opts={}) => withCache("mazid_categories_"+JSON.stringify(opts), () =>
      rpcGet("get_categories", { only_active: true, only_roots: true, ...opts })
    ),
    getSubcategories: (parentId) => rpcGet("get_categories", { parent_id_filter: parentId, only_active: true }),
    getHome: () => withCache("mazid_home", () => rpcGet("get_home_screen_data", { user_id: "" })),
    getCategoryProductImages: (categoryId) => rpcPost("get_category_product_images", { p_category_id: categoryId }),
    // Primary: use get_all_products?category_id=...&status=active (free, as in SearchRepository)
    getProductsByCategory: (categoryId, page=1) => rpcGet("get_all_products", { category_id: categoryId, status: "active", page, limit: 20 }),
    getAllProducts: (page=1) => rpcGet("get_all_products", { status: "active", page, limit: 20 }),
    searchProducts: (query) => rpcGet("search_products", { query }),
    getNewest: () => rpcGet("get_newest_products"),
    getPopular: () => rpcGet("get_most_popular_products"),
    // helpers
    pickName(catOrProd, lang) {
      const isAr = lang === "ar";
      return isAr ? (catOrProd.name_ar || catOrProd.nameAr || catOrProd.name_en || catOrProd.nameEn || "") 
                  : (catOrProd.name_en || catOrProd.nameEn || catOrProd.name_ar || catOrProd.nameAr || "");
    },
    displayImage(cat) {
      if (cat.product_images && cat.product_images.length) return cat.product_images[0];
      if (cat.product_image_url) return cat.product_image_url;
      if (cat.image_url) return cat.image_url;
      return "";
    }
  };
})();
