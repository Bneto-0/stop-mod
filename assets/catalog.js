(function () {
  const STORAGE_KEYS = Object.freeze({
    cart: "stopmod_cart",
    favorites: "stopmod_favorites",
    reviews: "stopmod_product_reviews",
    ratingStats: "stopmod_product_ratings",
    soldCounts: "stopmod_sold_counts",
    profile: "stopmod_profile"
  });

  const products = Object.freeze([
    {
      id: 1,
      name: "Camiseta Oversized Street",
      category: "Camisetas",
      size: "P ao GG",
      price: 89.9,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      badge: "12x sem juros",
      shortDescription: "Modelagem ampla com caimento urbano e malha macia para o dia a dia.",
      description: "A Camiseta Oversized Street foi pensada para quem gosta de visual solto, estrutura reta e conforto real no uso diario. A malha leve segura a proposta streetwear sem perder respiracao nem mobilidade.",
      highlights: ["Malha premium com toque macio", "Modelagem oversized", "Caimento reto e gola reforcada", "Boa para looks basicos e camadas"]
    },
    {
      id: 2,
      name: "Calca Cargo Urban",
      category: "Calcas",
      size: "36 ao 46",
      price: 159.9,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      badge: "frete verde",
      shortDescription: "Calca cargo com bolsos utilitarios e estrutura para uso intenso.",
      description: "A Calca Cargo Urban entrega leitura utilitaria, cintura firme e tecido resistente para compor looks mais pesados ou casuais. Os bolsos laterais ajudam no visual e no uso pratico.",
      highlights: ["Bolsos cargo laterais", "Tecido resistente", "Modelagem reta", "Boa para composicoes street e utilitarias"]
    },
    {
      id: 3,
      name: "Jaqueta Jeans Vintage",
      category: "Jaquetas",
      size: "P ao XG",
      price: 219.9,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      badge: "novo drop",
      shortDescription: "Lavagem vintage e estrutura jeans para sobrepor com personalidade.",
      description: "A Jaqueta Jeans Vintage traz leitura classica com cara de peca ja usada no ponto certo. O acabamento mais encorpado segura a forma e funciona bem tanto aberta quanto fechada.",
      highlights: ["Lavagem vintage", "Jeans encorpado", "Botoes metalicos", "Facil de combinar com camisetas e vestidos"]
    },
    {
      id: 4,
      name: "Moletom Essential Stop",
      category: "Moletons",
      size: "P ao GG",
      price: 179.9,
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80",
      badge: "pix -7%",
      shortDescription: "Moletom com interior aconchegante e visual limpo para uso diario.",
      description: "O Moletom Essential Stop tem estrutura classica, toque macio e visual limpo. E uma peca de uso recorrente para dias frios ou combinacoes mais confortaveis.",
      highlights: ["Interior macio", "Punhos ajustados", "Capuz estruturado", "Visual limpo e versatil"]
    },
    {
      id: 5,
      name: "Vestido Casual Minimal",
      category: "Vestidos",
      size: "PP ao G",
      price: 139.9,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      badge: "mais vendido",
      shortDescription: "Vestido leve, reto e facil de usar em propostas casuais.",
      description: "O Vestido Casual Minimal trabalha com linhas limpas, tecido leve e uso simples no dia a dia. A proposta e deixar o look pronto com poucos elementos.",
      highlights: ["Caimento leve", "Modelagem minimalista", "Uso casual", "Combina com tenis e sandalia"]
    },
    {
      id: 6,
      name: "Camisa Linho Leve",
      category: "Camisas",
      size: "P ao GG",
      price: 129.9,
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
      badge: "colecao 2026",
      shortDescription: "Camisa de linho com respiracao alta e visual refinado.",
      description: "A Camisa Linho Leve tem leitura mais limpa, tecido respiravel e caimento relaxado. Funciona tanto em composicoes sociais quanto em looks mais leves de calor.",
      highlights: ["Tecido com linho", "Respiracao alta", "Caimento leve", "Facil de usar aberta ou fechada"]
    },
    {
      id: 7,
      name: "Cardigan Tricot Cozy",
      category: "Casacos",
      size: "P ao G",
      price: 149.9,
      image: "https://images.unsplash.com/photo-1503341338985-c0477be52513?auto=format&fit=crop&w=900&q=80",
      badge: "estoque rapido",
      shortDescription: "Cardigan com leitura cosy e tricot de toque agradavel.",
      description: "O Cardigan Tricot Cozy entra para completar os looks em dias de meia estacao com textura visual interessante e uso bem versatil.",
      highlights: ["Tricot macio", "Otimo para meia estacao", "Sobreposicao facil", "Visual cosy"]
    },
    {
      id: 8,
      name: "Blazer Minimal Preto",
      category: "Blazers",
      size: "P ao GG",
      price: 249.9,
      image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=900&q=80",
      badge: "premium",
      shortDescription: "Blazer de linhas limpas para composicoes mais firmes e elegantes.",
      description: "O Blazer Minimal Preto traz estrutura, ombro marcado e leitura refinada. E uma peca de apoio para compor do office ao casual arrumado.",
      highlights: ["Estrutura firme", "Visual minimalista", "Acabamento premium", "Vai bem com calca, saia ou jeans"]
    },
    {
      id: 9,
      name: "Saia Midi Plissada",
      category: "Saias",
      size: "PP ao G",
      price: 119.9,
      image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
      badge: "leve e soltinha",
      shortDescription: "Saia midi com movimento leve e efeito plissado.",
      description: "A Saia Midi Plissada entrega movimento na medida e encaixa bem em looks mais femininos, leves ou arrumados sem perder conforto.",
      highlights: ["Comprimento midi", "Plissado leve", "Cintura confortavel", "Boa para looks elegantes e casuais"]
    },
    {
      id: 10,
      name: "Short Alfaiataria",
      category: "Shorts",
      size: "36 ao 44",
      price: 109.9,
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=900&q=80",
      badge: "look do dia",
      shortDescription: "Short de alfaiataria com estrutura limpa e cintura bem desenhada.",
      description: "O Short Alfaiataria foi pensado para looks mais arrumados sem abrir mao do conforto. A modelagem valoriza a cintura e segura bem a proposta elegante.",
      highlights: ["Modelagem de alfaiataria", "Cintura bem marcada", "Visual elegante", "Otimo para calor com look arrumado"]
    },
    {
      id: 11,
      name: "Tenis Street Clean",
      category: "Calcados",
      size: "37 ao 43",
      price: 239.9,
      image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=900&q=80",
      badge: "street clean",
      shortDescription: "Tenis de visual limpo para fechar looks urbanos com facilidade.",
      description: "O Tenis Street Clean combina base neutra, sola confortavel e proposta facil de usar todos os dias. Fica bem com jeans, cargo, vestido e conjunto.",
      highlights: ["Visual clean", "Palmilha confortavel", "Uso diario", "Combina com varias categorias"]
    },
    {
      id: 12,
      name: "Bolsa Tote Minimal",
      category: "Acessorios",
      size: "Unico",
      price: 189.9,
      image: "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=900&q=80",
      badge: "acabamento fosco",
      shortDescription: "Bolsa tote com espacamento interno util e visual moderno.",
      description: "A Bolsa Tote Minimal segura o visual da producao e ao mesmo tempo resolve o uso do dia a dia com espaco interno e acabamento limpo.",
      highlights: ["Formato tote", "Boa capacidade interna", "Acabamento fosco", "Visual sofisticado"]
    },
    {
      id: 13,
      name: "Top Ribana Soft",
      category: "Camisetas",
      size: "PP ao G",
      price: 79.9,
      image: "https://images.unsplash.com/photo-1506629905607-d9d4b5b1f1b3?auto=format&fit=crop&w=900&q=80",
      badge: "basico chic",
      shortDescription: "Top canelado com toque macio e uso basico bem resolvido.",
      description: "O Top Ribana Soft foi pensado para funcionar como base do look. A textura canelada ajuda no caimento e deixa a peca com visual mais interessante.",
      highlights: ["Malha canelada", "Toque macio", "Facil de combinar", "Ideal para sobreposicao"]
    },
    {
      id: 14,
      name: "Wide Leg Essential",
      category: "Calcas",
      size: "36 ao 48",
      price: 169.9,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      badge: "cintura alta",
      shortDescription: "Wide leg de cintura alta com caimento mais solto.",
      description: "A Wide Leg Essential tem perna mais ampla, cintura alta e uma leitura mais moderna. E uma calca facil para montar looks elegantes e urbanos.",
      highlights: ["Cintura alta", "Pernas amplas", "Caimento alongado", "Boa para office e casual"]
    },
    {
      id: 15,
      name: "Jaqueta Puffer Glow",
      category: "Jaquetas",
      size: "P ao GG",
      price: 269.9,
      image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
      badge: "inverno",
      shortDescription: "Puffer volumosa com isolamento leve para dias frios.",
      description: "A Jaqueta Puffer Glow traz mais volume, brilho discreto e sensacao termica mais protegida para os dias frios sem perder o visual atual.",
      highlights: ["Efeito puffer", "Volume equilibrado", "Visual de inverno", "Acabamento levemente acetinado"]
    },
    {
      id: 16,
      name: "Vestido Midi Glow",
      category: "Vestidos",
      size: "PP ao GG",
      price: 149.9,
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      badge: "tecido leve",
      shortDescription: "Vestido midi com leitura fluida e brilho suave.",
      description: "O Vestido Midi Glow foi pensado para eventos leves, saidas e combinacoes mais femininas. O tecido entrega movimento sem pesar no corpo.",
      highlights: ["Comprimento midi", "Movimento leve", "Brilho sutil", "Bom para eventos e uso casual refinado"]
    },
    {
      id: 17,
      name: "Camiseta Boxy Fade",
      category: "Camisetas",
      size: "P ao XG",
      price: 94.9,
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
      badge: "streetwear",
      shortDescription: "Camiseta boxy com shape mais curto e visual lavado.",
      description: "A Camiseta Boxy Fade mistura shape boxy, manga ampla e leitura casual mais moderna. Funciona bem em looks street e em composicoes basicas.",
      highlights: ["Shape boxy", "Visual lavado", "Caimento curto", "Boa para look streetwear"]
    },
    {
      id: 18,
      name: "Calca Reta Office",
      category: "Calcas",
      size: "38 ao 48",
      price: 154.9,
      image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80",
      badge: "alfaiataria",
      shortDescription: "Calca reta com leitura alinhada e visual limpo.",
      description: "A Calca Reta Office atende bem looks mais alinhados sem perder conforto. A modelagem reta deixa o visual limpo e facilita as combinacoes.",
      highlights: ["Modelagem reta", "Visual alinhado", "Boa para office", "Confortavel no uso diario"]
    },
    {
      id: 19,
      name: "Jaqueta Couro Clean",
      category: "Jaquetas",
      size: "P ao G",
      price: 299.9,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      badge: "edicao limitada",
      shortDescription: "Jaqueta com visual de couro e leitura marcante.",
      description: "A Jaqueta Couro Clean tem proposta mais intensa, acabamento firme e leitura forte para compor looks noturnos ou urbanos com personalidade.",
      highlights: ["Visual de couro", "Acabamento marcante", "Edicao limitada", "Peca de destaque no look"]
    },
    {
      id: 20,
      name: "Vestido Satin Night",
      category: "Vestidos",
      size: "PP ao G",
      price: 159.9,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      badge: "brilho suave",
      shortDescription: "Vestido acetinado com brilho suave para producoes noturnas.",
      description: "O Vestido Satin Night foi pensado para saidas, eventos e combinacoes de destaque. O tecido trabalha o brilho sem exagero e segura bem a silhueta.",
      highlights: ["Acetinado leve", "Brilho suave", "Visual noturno", "Bom para eventos e jantares"]
    },
    {
      id: 21,
      name: "Cropped Urban Fit",
      category: "Camisetas",
      size: "PP ao G",
      price: 84.9,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
      badge: "alta procura",
      shortDescription: "Cropped de modelagem urbana para composicoes leves e atuais.",
      description: "O Cropped Urban Fit trabalha caimento justo na medida, comprimento curto e leitura atual para producoes mais leves no dia ou na noite.",
      highlights: ["Comprimento cropped", "Caimento ajustado", "Visual urbano", "Alta procura na vitrine"]
    }
  ]);

  const productMap = new Map(products.map((product) => [Number(product.id), product]));

  const seededReviews = Object.freeze({
    1: [
      { name: "Livia", rating: 5, text: "Caimento bem solto e malha muito boa.", createdAt: "2026-03-18T11:00:00.000Z" },
      { name: "Rafa", rating: 4, text: "Vestiu como eu queria e chegou rapido.", createdAt: "2026-03-04T15:20:00.000Z" }
    ],
    2: [
      { name: "Diego", rating: 5, text: "Os bolsos dao outra cara para a calca.", createdAt: "2026-03-14T09:10:00.000Z" }
    ],
    5: [
      { name: "Nina", rating: 5, text: "Vestido leve, bonito e facil de usar.", createdAt: "2026-03-21T18:10:00.000Z" }
    ],
    11: [
      { name: "Pedro", rating: 4, text: "Tenis bonito e confortavel no dia todo.", createdAt: "2026-03-16T13:40:00.000Z" }
    ],
    14: [
      { name: "Maya", rating: 5, text: "A cintura alta vestiu muito bem.", createdAt: "2026-03-26T10:00:00.000Z" }
    ],
    17: [
      { name: "Caio", rating: 4, text: "Curti a modelagem boxy e o visual lavado.", createdAt: "2026-03-11T20:15:00.000Z" }
    ]
  });

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function formatBRL(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function oldPrice(value) {
    return Number((Number(value || 0) * 1.12).toFixed(2));
  }

  function pixPrice(value) {
    return Number((Number(value || 0) * 0.93).toFixed(2));
  }

  function productHref(id) {
    return `/produtos/?id=${encodeURIComponent(String(id))}`;
  }

  function getProductById(id) {
    return productMap.get(Number(id)) || null;
  }

  function loadCartIds() {
    const raw = loadJson(STORAGE_KEYS.cart, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0 && productMap.has(item));
  }

  function saveCartIds(ids) {
    const clean = Array.isArray(ids)
      ? ids.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0 && productMap.has(item))
      : [];
    saveJson(STORAGE_KEYS.cart, clean);
    return clean;
  }

  function addToCart(id, quantity) {
    const product = getProductById(id);
    if (!product) return 0;
    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const ids = loadCartIds();
    for (let index = 0; index < qty; index += 1) {
      ids.push(product.id);
    }
    saveCartIds(ids);
    return ids.length;
  }

  function loadFavorites() {
    const raw = loadJson(STORAGE_KEYS.favorites, []);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0 && productMap.has(item));
  }

  function saveFavorites(ids) {
    const clean = Array.isArray(ids)
      ? [...new Set(ids.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0 && productMap.has(item)))]
      : [];
    saveJson(STORAGE_KEYS.favorites, clean);
    return clean;
  }

  function isFavorite(id) {
    return loadFavorites().includes(Number(id));
  }

  function toggleFavorite(id) {
    const product = getProductById(id);
    if (!product) return false;
    const favorites = loadFavorites();
    const numericId = Number(id);
    const next = favorites.includes(numericId)
      ? favorites.filter((item) => item !== numericId)
      : [...favorites, numericId];
    saveFavorites(next);
    return next.includes(numericId);
  }

  function loadManualReviews() {
    const raw = loadJson(STORAGE_KEYS.reviews, {});
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw;
  }

  function saveManualReviews(map) {
    saveJson(STORAGE_KEYS.reviews, map && typeof map === "object" ? map : {});
  }

  function loadRatingStats() {
    const raw = loadJson(STORAGE_KEYS.ratingStats, {});
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw;
  }

  function loadSoldCounts() {
    const raw = loadJson(STORAGE_KEYS.soldCounts, {});
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw;
  }

  function getProductReviews(id) {
    const key = String(Number(id) || 0);
    const manual = loadManualReviews();
    const stored = Array.isArray(manual[key]) ? manual[key] : [];
    const seeded = Array.isArray(seededReviews[key]) ? seededReviews[key] : [];
    return [...stored, ...seeded]
      .filter((review) => review && Number(review.rating) >= 1)
      .sort((left, right) => Date.parse(String(right.createdAt || "")) - Date.parse(String(left.createdAt || "")));
  }

  function getRatingSummary(id) {
    const key = String(Number(id) || 0);
    const reviews = getProductReviews(id);
    const seededSum = reviews.reduce((total, review) => total + Number(review.rating || 0), 0);
    const seededCount = reviews.length;
    const stats = loadRatingStats();
    const sold = loadSoldCounts();
    const extraSum = Number(stats[key]?.sum || 0);
    const extraCount = Number(stats[key]?.count || 0);
    const count = seededCount + extraCount;
    const average = count ? Number(((seededSum + extraSum) / count).toFixed(1)) : Number((4.4 + ((Number(id) || 0) % 5) * 0.1).toFixed(1));
    return {
      average,
      count,
      sold: Number(sold[key] || 0)
    };
  }

  function addProductReview(id, payload) {
    const product = getProductById(id);
    if (!product) return null;

    const rating = Math.max(1, Math.min(5, Math.floor(Number(payload?.rating) || 0)));
    const name = String(payload?.name || "Cliente").trim() || "Cliente";
    const text = String(payload?.text || "").trim();
    if (!rating || !text) return null;

    const key = String(product.id);
    const manual = loadManualReviews();
    const list = Array.isArray(manual[key]) ? manual[key] : [];
    const review = {
      name,
      rating,
      text,
      createdAt: new Date().toISOString()
    };

    manual[key] = [review, ...list].slice(0, 30);
    saveManualReviews(manual);
    return review;
  }

  function getRelatedProducts(id, limit) {
    const product = getProductById(id);
    if (!product) return [];
    const max = Math.max(1, Math.floor(Number(limit) || 4));
    const sameCategory = products.filter((item) => item.id !== product.id && item.category === product.category);
    const others = products.filter((item) => item.id !== product.id && item.category !== product.category);
    return [...sameCategory, ...others].slice(0, max);
  }

  window.stopmodCatalog = {
    storageKeys: STORAGE_KEYS,
    products,
    formatBRL,
    oldPrice,
    pixPrice,
    productHref,
    getProductById,
    loadCartIds,
    saveCartIds,
    addToCart,
    loadFavorites,
    saveFavorites,
    isFavorite,
    toggleFavorite,
    getProductReviews,
    getRatingSummary,
    addProductReview,
    getRelatedProducts
  };
})();
