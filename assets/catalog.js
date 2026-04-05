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

  const variantSwatches = Object.freeze({
    branco: "linear-gradient(135deg, #ffffff 0%, #ece7df 100%)",
    branca: "linear-gradient(135deg, #ffffff 0%, #ece7df 100%)",
    preto: "linear-gradient(135deg, #2c2522 0%, #0c0a09 100%)",
    preta: "linear-gradient(135deg, #2c2522 0%, #0c0a09 100%)",
    bege: "linear-gradient(135deg, #e3cfb6 0%, #b5916f 100%)",
    caramelo: "linear-gradient(135deg, #d09a63 0%, #8c5a32 100%)",
    vermelho: "linear-gradient(135deg, #de625a 0%, #8c2623 100%)",
    vermelha: "linear-gradient(135deg, #de625a 0%, #8c2623 100%)",
    vinho: "linear-gradient(135deg, #87324d 0%, #43101f 100%)",
    azul: "linear-gradient(135deg, #6a93e3 0%, #243a72 100%)",
    "azul-claro": "linear-gradient(135deg, #afd7ff 0%, #5f91c4 100%)",
    "azul-marinho": "linear-gradient(135deg, #405f98 0%, #16243f 100%)",
    cinza: "linear-gradient(135deg, #c8cbd1 0%, #747b85 100%)",
    caqui: "linear-gradient(135deg, #b9a279 0%, #7c694a 100%)",
    verde: "linear-gradient(135deg, #90a675 0%, #50613d 100%)",
    "verde-militar": "linear-gradient(135deg, #758162 0%, #3f4735 100%)",
    telha: "linear-gradient(135deg, #d4866f 0%, #934736 100%)",
    marrom: "linear-gradient(135deg, #9d7150 0%, #5d4028 100%)",
    offwhite: "linear-gradient(135deg, #fef8ef 0%, #ddd2c1 100%)",
    "off-white": "linear-gradient(135deg, #fef8ef 0%, #ddd2c1 100%)"
  });

  const categoryVariantPalettes = Object.freeze({
    Acessorios: [
      { id: "preto", colorName: "Preto", stock: 6 },
      { id: "marrom", colorName: "Marrom", stock: 5 },
      { id: "caramelo", colorName: "Caramelo", stock: 4 },
      { id: "bege", colorName: "Bege", stock: 3 },
      { id: "offwhite", colorName: "Off-white", stock: 2 }
    ],
    Blazers: [
      { id: "preto", colorName: "Preto", stock: 5 },
      { id: "offwhite", colorName: "Off-white", stock: 4 },
      { id: "caramelo", colorName: "Caramelo", stock: 3 },
      { id: "azul-marinho", colorName: "Azul marinho", stock: 2 },
      { id: "vinho", colorName: "Vinho", stock: 1 }
    ],
    Calcados: [
      { id: "branco", colorName: "Branco", stock: 5 },
      { id: "preto", colorName: "Preto", stock: 4 },
      { id: "cinza", colorName: "Cinza", stock: 3 },
      { id: "azul", colorName: "Azul", stock: 2 },
      { id: "caramelo", colorName: "Caramelo", stock: 1 }
    ],
    Calcas: [
      { id: "preto", colorName: "Preto", stock: 6 },
      { id: "cinza", colorName: "Cinza", stock: 5 },
      { id: "caqui", colorName: "Caqui", stock: 4 },
      { id: "azul-marinho", colorName: "Azul marinho", stock: 3 },
      { id: "bege", colorName: "Bege", stock: 2 }
    ],
    Camisas: [
      { id: "branco", colorName: "Branco", stock: 6 },
      { id: "azul-claro", colorName: "Azul claro", stock: 5 },
      { id: "bege", colorName: "Bege", stock: 4 },
      { id: "preto", colorName: "Preto", stock: 3 },
      { id: "cinza", colorName: "Cinza", stock: 2 }
    ],
    Camisetas: [
      { id: "branco", colorName: "Branco", stock: 6 },
      { id: "preto", colorName: "Preto", stock: 5 },
      { id: "cinza", colorName: "Cinza", stock: 4 },
      { id: "azul", colorName: "Azul", stock: 3 },
      { id: "vermelho", colorName: "Vermelho", stock: 2 }
    ],
    Casacos: [
      { id: "bege", colorName: "Bege", stock: 5 },
      { id: "cinza", colorName: "Cinza", stock: 4 },
      { id: "vinho", colorName: "Vinho", stock: 3 },
      { id: "preto", colorName: "Preto", stock: 2 },
      { id: "verde", colorName: "Verde", stock: 1 }
    ],
    Jaquetas: [
      { id: "cinza", colorName: "Cinza", stock: 5 },
      { id: "preta", colorName: "Preta", stock: 4 },
      { id: "vermelha", colorName: "Vermelha", stock: 3 },
      { id: "azul", colorName: "Azul", stock: 2 },
      { id: "branca", colorName: "Branca", stock: 1 }
    ],
    Moletons: [
      { id: "cinza", colorName: "Cinza", stock: 6 },
      { id: "preto", colorName: "Preto", stock: 5 },
      { id: "vermelho", colorName: "Vermelho", stock: 4 },
      { id: "azul", colorName: "Azul", stock: 3 },
      { id: "branco", colorName: "Branco", stock: 2 }
    ],
    Saias: [
      { id: "preta", colorName: "Preta", stock: 5 },
      { id: "bege", colorName: "Bege", stock: 4 },
      { id: "vinho", colorName: "Vinho", stock: 3 },
      { id: "verde", colorName: "Verde", stock: 2 },
      { id: "azul", colorName: "Azul", stock: 1 }
    ],
    Shorts: [
      { id: "bege", colorName: "Bege", stock: 5 },
      { id: "preto", colorName: "Preto", stock: 4 },
      { id: "branco", colorName: "Branco", stock: 3 },
      { id: "azul", colorName: "Azul", stock: 2 },
      { id: "caqui", colorName: "Caqui", stock: 1 }
    ],
    Vestidos: [
      { id: "preto", colorName: "Preto", stock: 5 },
      { id: "vermelho", colorName: "Vermelho", stock: 4 },
      { id: "azul-marinho", colorName: "Azul marinho", stock: 3 },
      { id: "bege", colorName: "Bege", stock: 2 },
      { id: "branco", colorName: "Branco", stock: 1 }
    ]
  });

  const productVariantsConfig = Object.freeze({
    1: [
      { id: "branco", colorName: "Branco", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", stock: 7 },
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80", stock: 4 },
      { id: "bege", colorName: "Bege", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "vermelho", colorName: "Vermelho", image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ],
    2: [
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1506629905607-d9d4b5b1f1b3?auto=format&fit=crop&w=900&q=80", stock: 5 },
      { id: "verde-militar", colorName: "Verde militar", image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80", stock: 3 },
      { id: "caqui", colorName: "Caqui", image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80", stock: 1 },
      { id: "cinza", colorName: "Cinza", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ],
    3: [
      { id: "cinza", colorName: "Cinza", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80&sat=-100", stock: 5 },
      { id: "preta", colorName: "Preta", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80", stock: 4 },
      { id: "vermelha", colorName: "Vermelha", image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "azul", colorName: "Azul", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80", stock: 1 }
    ],
    4: [
      { id: "cinza", colorName: "Cinza", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=80", stock: 6 },
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80", stock: 4 },
      { id: "vermelho", colorName: "Vermelho", image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "azul", colorName: "Azul", image: "https://images.unsplash.com/photo-1603252109303-2751441c6f22?auto=format&fit=crop&w=900&q=80", stock: 1 }
    ],
    5: [
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80", stock: 4 },
      { id: "vermelho", colorName: "Vermelho", image: "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "branco", colorName: "Branco", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", stock: 1 }
    ],
    6: [
      { id: "branco", colorName: "Branco", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80", stock: 6 },
      { id: "azul-claro", colorName: "Azul claro", image: "https://images.unsplash.com/photo-1603252109303-2751441c6f22?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ],
    8: [
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1484515991647-c5760fcecfc7?auto=format&fit=crop&w=900&q=80", stock: 3 },
      { id: "offwhite", colorName: "Off-white", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80", stock: 1 },
      { id: "caramelo", colorName: "Caramelo", image: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ],
    11: [
      { id: "branco", colorName: "Branco", image: "https://images.unsplash.com/photo-1549298916-f52d724204b4?auto=format&fit=crop&w=900&q=80", stock: 4 },
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", stock: 3 },
      { id: "azul", colorName: "Azul", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ],
    15: [
      { id: "cinza", colorName: "Cinza", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80&sat=-100", stock: 4 },
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80", stock: 3 },
      { id: "vermelho", colorName: "Vermelho", image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "azul", colorName: "Azul", image: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=900&q=80", stock: 1 }
    ],
    18: [
      { id: "bege", colorName: "Bege", image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80", stock: 4 },
      { id: "cinza", colorName: "Cinza", image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=900&q=80&sat=-100", stock: 2 },
      { id: "preto", colorName: "Preto", image: "https://images.unsplash.com/photo-1506629905607-d9d4b5b1f1b3?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ],
    19: [
      { id: "preta", colorName: "Preta", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", stock: 2 },
      { id: "vinho", colorName: "Vinho", image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&w=900&q=80", stock: 1 },
      { id: "marrom", colorName: "Marrom", image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80", stock: 0 }
    ]
  });

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

  function normalizeVariantKey(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  }

  function getVariantSwatch(variant) {
    const key = normalizeVariantKey(variant.id || variant.colorName);
    return variantSwatches[key] || "linear-gradient(135deg, #e9dfd6 0%, #c9b7a9 100%)";
  }

  function buildCategoryVariants(product) {
    const palette = categoryVariantPalettes[product.category] || [
      { id: "branco", colorName: "Branco", stock: 5 },
      { id: "preto", colorName: "Preto", stock: 4 },
      { id: "cinza", colorName: "Cinza", stock: 3 },
      { id: "azul", colorName: "Azul", stock: 2 },
      { id: "vermelho", colorName: "Vermelho", stock: 1 }
    ];

    return palette.map((variant) => ({
      ...variant,
      image: product.image
    }));
  }

  function mergeProductVariants(product) {
    const baseVariants = buildCategoryVariants(product);
    const configured = Array.isArray(productVariantsConfig[product.id]) ? productVariantsConfig[product.id] : [];
    if (!configured.length) return baseVariants;

    const configuredMap = new Map(
      configured.map((variant) => [normalizeVariantKey(variant.id || variant.colorName), variant])
    );

    const merged = baseVariants.map((variant) => {
      const key = normalizeVariantKey(variant.id || variant.colorName);
      const override = configuredMap.get(key);
      return override ? { ...variant, ...override } : variant;
    });

    const existingKeys = new Set(merged.map((variant) => normalizeVariantKey(variant.id || variant.colorName)));

    configured.forEach((variant) => {
      const key = normalizeVariantKey(variant.id || variant.colorName);
      if (existingKeys.has(key)) return;
      merged.push({
        ...variant,
        image: variant.image || product.image
      });
      existingKeys.add(key);
    });

    return merged;
  }

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

  function productHref(id, variantId) {
  const params = new URLSearchParams({ id: String(id) });
  if (variantId) params.set("variant", String(variantId));
  return `/produtos/?${params.toString()}`;
}

function getProductById(id) {
  return productMap.get(Number(id)) || null;
}

function getProductVariants(productOrId) {
  const product = typeof productOrId === "object" && productOrId ? productOrId : getProductById(productOrId);
  if (!product) return [];
  const variants = mergeProductVariants(product);

  return variants
    .map((variant) => ({
      id: String(variant.id || `default-${product.id}`),
      colorName: String(variant.colorName || "Padrao"),
      image: String(variant.image || product.image || ""),
      stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
      swatch: String(variant.swatch || getVariantSwatch(variant))
    }))
    .filter((variant) => variant.image);
}

function getAvailableVariants(productOrId) {
  return getProductVariants(productOrId).filter((variant) => variant.stock > 0);
}

function getVariantById(productOrId, variantId) {
  const variants = getProductVariants(productOrId);
  return variants.find((variant) => variant.id === String(variantId || "")) || null;
}

function getDefaultVariant(productOrId) {
  return getAvailableVariants(productOrId)[0] || getProductVariants(productOrId)[0] || null;
}

function resolveVariant(productOrId, variantId) {
  return getVariantById(productOrId, variantId) || getDefaultVariant(productOrId);
}

function normalizeCartItems(raw) {
  if (!Array.isArray(raw)) return [];

  const grouped = new Map();

  raw.forEach((entry) => {
    let productId = null;
    let variantId = "";
    let quantity = 1;

    if (Number.isInteger(Number(entry))) {
      productId = Number(entry);
    } else if (entry && typeof entry === "object") {
      productId = Number(entry.productId ?? entry.id ?? entry.product ?? 0);
      variantId = String(entry.variantId || entry.variant || "");
      quantity = Math.max(1, Math.floor(Number(entry.quantity ?? entry.qty ?? 1) || 1));
    }

    const product = getProductById(productId);
    if (!product) return;

    const variant = resolveVariant(product, variantId);
    if (!variant || variant.stock <= 0) return;

    const key = `${product.id}::${variant.id}`;
    const current = grouped.get(key) || {
      productId: product.id,
      variantId: variant.id,
      quantity: 0
    };

    current.quantity = Math.min(variant.stock, current.quantity + quantity);
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).filter((item) => item.quantity > 0);
}

function loadCartItems() {
  const raw = loadJson(STORAGE_KEYS.cart, []);
  const normalized = normalizeCartItems(raw);
  if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
    saveJson(STORAGE_KEYS.cart, normalized);
  }
  return normalized;
}

function saveCartItems(items) {
  const normalized = normalizeCartItems(items);
  saveJson(STORAGE_KEYS.cart, normalized);
  return normalized;
}

function loadCartIds() {
  return loadCartItems().flatMap((item) => Array.from({ length: item.quantity }, () => item.productId));
}

function saveCartIds(ids) {
  const mapped = Array.isArray(ids)
    ? ids.map((id) => ({ productId: Number(id), quantity: 1 }))
    : [];
  return saveCartItems(mapped).flatMap((item) => Array.from({ length: item.quantity }, () => item.productId));
}

function countCartItems() {
  return loadCartItems().reduce((total, item) => total + item.quantity, 0);
}

function getCartQuantity(productId, variantId) {
  const match = loadCartItems().find((item) => item.productId === Number(productId) && item.variantId === String(variantId || ""));
  return match ? match.quantity : 0;
}

function addToCart(id, quantity, options = {}) {
  const product = getProductById(id);
  if (!product) return countCartItems();

  const variant = resolveVariant(product, options.variantId);
  if (!variant || variant.stock <= 0) return countCartItems();

  const qty = Math.max(1, Math.floor(Number(quantity) || 1));
  const items = loadCartItems();
  const index = items.findIndex((item) => item.productId === product.id && item.variantId === variant.id);

  if (index >= 0) {
    items[index] = {
      ...items[index],
      quantity: Math.min(variant.stock, items[index].quantity + qty)
    };
  } else {
    items.push({
      productId: product.id,
      variantId: variant.id,
      quantity: Math.min(variant.stock, qty)
    });
  }

  saveCartItems(items);
  return countCartItems();
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
    getProductVariants,
    getAvailableVariants,
    getVariantById,
    getDefaultVariant,
    resolveVariant,
    loadCartItems,
    saveCartItems,
    loadCartIds,
    saveCartIds,
    countCartItems,
    getCartQuantity,
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
