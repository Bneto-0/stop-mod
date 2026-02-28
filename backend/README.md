# Backend PagBank (Stop mod)

Esse backend cria checkout real no PagBank e recebe webhook.

## 1) Instalar

```bash
cd backend
npm install
```

## 2) Configurar variaveis

```bash
copy .env.example .env
```

Preencha:
- `PAGBANK_ENV=sandbox` (teste) ou `production`
- `PAGBANK_TOKEN=...`
- `PAGBANK_EMAIL=...` (opcional)
- `PAGBANK_RETURN_URL` e `PAGBANK_REDIRECT_URL`
- `PAGBANK_NOTIFICATION_URL` e `PAGBANK_PAYMENT_NOTIFICATION_URL` (recomendado)

Importante:
- Use apenas o valor do token (sem aspas, sem quebrar linha).
- Nao deixe `PAGBANK_TOKEN=SEU_TOKEN_AQUI`.
- Sempre reinicie o backend apos mudar o `.env`.

## 3) Rodar

```bash
npm run dev
```

API local:
- `GET /api/health`
- `POST /api/pagbank/checkout`
- `POST /api/pagbank/webhook`
- `GET /api/pagbank/webhook/logs`

Validacao rapida:

```bash
node -e "import('dotenv/config').then(()=>console.log('ENV=',process.env.PAGBANK_ENV,'LEN=',(process.env.PAGBANK_TOKEN||'').length,'INI=',(process.env.PAGBANK_TOKEN||'').slice(0,8)))"
```

Se aparecer `INI=SEU_TOKE`, o token ainda nao foi configurado.

## 4) Conectar com o frontend

No navegador, no dominio da loja, execute no console:

```js
localStorage.setItem("stopmod_pagbank_api_base", "https://SEU_BACKEND_PUBLICO");
```

Se o backend estiver no mesmo dominio com proxy `/api`, nao precisa desse passo.

## 5) Fluxo esperado

1. Cliente escolhe forma de pagamento no carrinho.
2. Front chama `POST /api/pagbank/checkout`.
3. Backend cria checkout no PagBank e retorna `checkoutUrl`.
4. Front redireciona para o link do PagBank.
5. PagBank envia atualizacao para webhook.
