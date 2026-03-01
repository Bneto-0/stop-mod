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
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/address`

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

## 6) Cadastro/Login seguro de cliente

No `.env`, configure:

- `AUTH_JWT_SECRET` (obrigatorio, minimo 32 chars)
- `AUTH_TOKEN_TTL_SEC` (padrao 7200 = 2h)

Cadastro:

`POST /api/auth/register`

```json
{
  "fullName": "Nome Completo",
  "birthDate": "1990-05-20",
  "cpf": "12345678909",
  "email": "cliente@email.com",
  "password": "Senha@123",
  "phone": "11999999999",
  "address": {
    "street": "Rua Exemplo",
    "number": "123",
    "district": "Centro",
    "city": "Sao Paulo",
    "state": "SP",
    "cep": "05786090",
    "complement": "Apto 12"
  }
}
```

Login:

`POST /api/auth/login`

```json
{
  "identifier": "cliente@email.com ou CPF",
  "password": "Senha@123"
}
```

Resposta de login/cadastro traz:

- `token` JWT
- `profile` (dados do cliente)
- `addresses` e `defaultAddress`

### Verificacao civil CPF (opcional)

Para integrar com provedor oficial/KYC:

- `CPF_CIVIL_CHECK_MODE=warn` ou `strict`
- `CPF_CIVIL_CHECK_URL=https://seu-provedor/validar-cpf`
- `CPF_CIVIL_CHECK_TOKEN=...`

Em `strict`, o cadastro e bloqueado se o provedor nao confirmar CPF + nome + data.

Sem provedor externo configurado, o backend valida apenas:

- formato/algoritmo do CPF
- consistencia dos campos obrigatorios
