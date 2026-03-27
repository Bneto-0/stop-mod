# Stopmod Site

Frontend estatico da loja Stop mod.

## Publicacao automatica

Este projeto foi preparado para publicar automaticamente no Netlify via GitHub.

### Configuracao recomendada no Netlify
- Build command: deixar vazio
- Publish directory: `.`
- Dominio principal: `stopmod.com.br`
- Redirect de `www.stopmod.com.br` para o principal

### Estrutura
- `index.html`: home da loja
- `style.css`: estilos globais
- `script.js`: banners, vitrine e interacoes da home
- `login/`: login e cadastro
- `carrinho/`: carrinho e checkout
- `netlify.toml`: configuracoes de deploy e cache
