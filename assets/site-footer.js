(function () {
  const root = document.getElementById("site-footer-root");
  if (!root) return;

  root.innerHTML = `
    <footer class="site-footer home-premium-footer">
      <div class="container home-footer__top">
        <section class="home-footer__brand">
          <a class="home-footer__logo" href="/#top" aria-label="UZUU">UZUU</a>
          <p>Estilo sem pagar caro.<br />Peca premium com preco justo para todos os estilos.</p>
          <div class="home-footer__social" aria-label="Redes sociais">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm6.2-.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z"></path></svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg viewBox="0 0 24 24"><path d="M14 3c1 2 2.7 3.7 5 4.2V10a8.2 8.2 0 0 1-5-1.7v6.4a5.7 5.7 0 1 1-4-5.4v2.8a2.9 2.9 0 1 0 1.2 2.4V3z"></path></svg>
            </a>
            <a href="#" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24"><path d="M20 11.5a8.5 8.5 0 0 1-12.4 7.5L4 20l1.1-3.4A8.5 8.5 0 1 1 20 11.5zm-4.8 2.3-.8-.4c-.3-.2-.6-.2-.8.1l-.2.3c-.2.2-.4.3-.7.2a6.9 6.9 0 0 1-3.3-2.9c-.2-.3-.2-.6 0-.8l.2-.2c.2-.2.2-.5.1-.8l-.3-.8c-.2-.5-.7-.6-1.1-.3a2 2 0 0 0-.7 2.1 9.2 9.2 0 0 0 5.6 5.7 2 2 0 0 0 2.1-.6c.4-.4.3-.9-.1-1.2z"></path></svg>
            </a>
            <a href="#" aria-label="YouTube">
              <svg viewBox="0 0 24 24"><path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C18 4.8 12 4.8 12 4.8s-6 0-7.7.5A2.7 2.7 0 0 0 2.4 7.2 28.8 28.8 0 0 0 1.9 12c0 1.7.1 3.3.5 4.8a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.5.5-3.1.5-4.8s-.1-3.3-.5-4.8zM10 15.5v-7l6 3.5-6 3.5z"></path></svg>
            </a>
          </div>
        </section>

        <div class="home-footer__columns">
          <section>
            <h3>INSTITUCIONAL</h3>
            <a href="/marketplace/">Sobre a UZUU</a>
            <a href="/seller/">Trabalhe conosco</a>
            <a href="/privacidade/">Politica de privacidade</a>
            <a href="/termos/">Trocas e devolucoes</a>
            <a href="/termos/">Termos de uso</a>
          </section>
          <section>
            <h3>AJUDA</h3>
            <a href="/perfil/">Central de ajuda</a>
            <a href="/produtos/">Como comprar</a>
            <a href="/carrinho/">Formas de pagamento</a>
            <a href="/entrega/">Prazos de entrega</a>
            <a href="/perfil/pedidos/">Rastrear pedido</a>
          </section>
          <section>
            <h3>CATEGORIAS</h3>
            <a href="/?q=masculino#produtos">Masculino</a>
            <a href="/?q=feminino#produtos">Feminino</a>
            <a href="/?cat=Acessorios#produtos">Acessorios</a>
            <a href="/?q=calcados#produtos">Calcados</a>
            <a href="/?q=streetwear#produtos">Streetwear</a>
            <a href="/cupons/">Promocoes</a>
          </section>
          <section class="home-footer__payments">
            <h3>FORMAS DE PAGAMENTO</h3>
            <div class="home-payment-badges">
              <span><img src="/assets/icons/visa-logo-real.svg" alt="Visa" /></span>
              <span><img src="/assets/icons/mastercard-logo-real.svg" alt="Mastercard" /></span>
              <span><img src="/assets/icons/elo-logo-real.png" alt="Elo" /></span>
              <span><img src="/assets/icons/hipercard-logo-real.svg" alt="Hipercard" /></span>
              <span><img src="/assets/icons/pix-logo.svg" alt="Pix" /></span>
            </div>
            <div class="home-security-card">
              <h3>SEGURANCA</h3>
              <div class="home-security-card__item">
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.6-2.7 8.8-7 10-4.3-1.2-7-5.4-7-10V6zm-3 9 2 2 4-4"></path></svg>
                </span>
                <div>
                  <strong>Site protegido</strong>
                  <small>Certificado SSL</small>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div class="container home-footer__bottom">
        <p>&copy; 2026 UZUU. Todos os direitos reservados.</p>
      </div>
    </footer>
  `;
})();
