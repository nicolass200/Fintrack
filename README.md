# FinTrack - Controle Financeiro Pessoal

Projeto de extensão universitária desenvolvido no curso de Engenharia de Software do iCEV.

O **FinTrack** é uma plataforma web responsiva para organização financeira pessoal. A aplicação permite registrar receitas e despesas, acompanhar movimentações, controlar pendências, definir orçamentos mensais e visualizar indicadores financeiros em um dashboard.

---

## Sobre o projeto

Muitas pessoas possuem dificuldade para acompanhar sua vida financeira por falta de ferramentas simples, acessíveis e fáceis de usar. Pequenos gastos podem passar despercebidos, contas podem permanecer pendentes e o orçamento mensal pode ficar comprometido.

O FinTrack busca reduzir esse problema por meio de uma interface direta e adaptada para desktop e dispositivos móveis. A plataforma centraliza as principais informações financeiras do usuário e facilita o registro cotidiano de movimentações.

### Público-alvo

- Jovens e adultos;
- Estudantes;
- Trabalhadores assalariados;
- Profissionais autônomos;
- Pequenos empreendedores;
- Pessoas interessadas em organizar melhor suas finanças pessoais.

---

## Funcionalidades

### Autenticação e perfil

- Cadastro, login e logout;
- Sessão autenticada por cookie `HttpOnly`;
- Consulta ao usuário autenticado;
- Recuperação de senha por e-mail com código temporário;
- Perfil com dados básicos da conta e edição de nome;
- Seleção de idioma entre português e inglês;
- Português como idioma padrão;
- Preferência de idioma salva no navegador.

### Categorias

- Categorias padrão criadas automaticamente para novos usuários;
- Categorias separadas por tipo: `INCOME` ou `EXPENSE`;
- Criação de categoria durante o preenchimento de uma transação;
- Listagem, edição e exclusão de categorias personalizadas;
- Proteção contra categorias duplicadas para o mesmo usuário.

### Transações e extrato

- Cadastro de receitas e despesas;
- Fluxos visuais separados para despesas e receitas;
- Forma de pagamento opcional para despesas;
- Conta de recebimento opcional para receitas;
- Controle de lançamentos pagos, recebidos ou pendentes;
- Listagem, edição e exclusão de movimentações;
- Extrato com filtros por intervalo de datas, tipo, categoria, situação e forma de pagamento;
- Validação de pertencimento da categoria ao usuário autenticado.

### Dashboard

- Total de receitas;
- Total de despesas;
- Saldo;
- Valores pendentes a pagar;
- Valores pendentes a receber;
- Despesas agrupadas por categoria;
- Resumo mensal;
- Últimas movimentações.

### Orçamentos

- Criação de orçamento mensal;
- Listagem, edição e exclusão de orçamentos;
- Consulta de alerta por mês e ano;
- Cálculo de valor gasto, percentual utilizado e saldo restante.

Regra de alerta:

```txt
Até 79% do limite: OK
De 80% até 99%: NEAR_LIMIT
100% ou mais: EXCEEDED
```

---

## Tecnologias utilizadas

### Frontend

- React;
- TypeScript;
- Vite;
- React Router;
- Lucide React.

### Backend

- Node.js;
- Express;
- TypeScript;
- Prisma ORM;
- Zod;
- JWT;
- BcryptJS;
- Helmet;
- express-rate-limit;
- cookie-parser;
- CORS.

### Banco de dados e serviços

- PostgreSQL hospedado no Supabase;
- Prisma Client para acesso aos dados;
- Prisma Migrate para evolução do schema;
- Brevo para envio do e-mail de redefinição de senha;
- Render para deploy do backend;
- Vercel para deploy do frontend.

---

## Arquitetura

```txt
Frontend: React + TypeScript + Vite
        |
        | HTTP / JSON
        v
Backend: Node.js + Express + TypeScript
        |
        | Prisma ORM
        v
Banco de dados: PostgreSQL hospedado no Supabase

Serviços complementares:
- Brevo: envio de e-mail para redefinição de senha
- Render: hospedagem da API
- Vercel: hospedagem da aplicação web
```

### Estrutura principal

```txt
Fintrack/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── config/
│       ├── middlewares/
│       ├── modules/
│       │   ├── auth/
│       │   ├── budgets/
│       │   ├── categories/
│       │   ├── dashboard/
│       │   └── transactions/
│       ├── services/
│       ├── routes.ts
│       └── server.ts
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vercel.json
└── README.md
```

---

## Modelo de dados

O schema Prisma utiliza quatro entidades principais:

- `User`: usuário da aplicação e dados temporários de recuperação de senha;
- `Category`: categoria de receita ou despesa associada ao usuário;
- `Transaction`: movimentação financeira;
- `Budget`: orçamento mensal definido pelo usuário.

### Campos adicionais de transação

```txt
paymentMethod String?   Forma de pagamento da despesa
account       String?   Conta de recebimento da receita
isSettled     Boolean   Indica se o lançamento foi pago ou recebido
```

---

## Segurança

O projeto inclui medidas básicas de proteção para uso em produção:

- Senhas armazenadas com hash Bcrypt;
- JWT com expiração de sete dias;
- Sessão principal enviada em cookie `HttpOnly`;
- Cookie `Secure` e `SameSite=None` em produção;
- Autorização alternativa por header `Authorization: Bearer TOKEN`;
- Dados financeiros filtrados pelo usuário autenticado;
- Validação de entrada com Zod;
- CORS configurável por variável de ambiente;
- Headers HTTP de segurança com Helmet;
- Limite global de 200 requisições a cada 15 minutos;
- Limite de cinco tentativas de login a cada 15 minutos;
- Limite de três solicitações de recuperação de senha a cada 15 minutos;
- Token de redefinição de senha salvo como hash e válido por 15 minutos;
- Credenciais externas armazenadas em variáveis de ambiente.

---

## Endpoints da API

### Saúde da API

```http
GET /health
```

### Autenticação

```http
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
PUT  /auth/me
```

### Categorias

```http
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

### Transações

```http
GET    /transactions
GET    /transactions/:id
POST   /transactions
PUT    /transactions/:id
DELETE /transactions/:id
```

Filtros aceitos na listagem:

```http
GET /transactions?startDate=2026-04-12&endDate=2026-04-15&type=EXPENSE&categoryId=UUID&isSettled=false&paymentMethod=Pix
```

Exemplo de criação de uma despesa pendente:

```json
{
  "description": "Conta de internet",
  "amount": 120,
  "type": "EXPENSE",
  "date": "2026-05-20",
  "categoryId": "id-da-categoria",
  "paymentMethod": "Boleto",
  "isSettled": false
}
```

Exemplo de criação de uma receita:

```json
{
  "description": "Salário mensal",
  "amount": 2500,
  "type": "INCOME",
  "date": "2026-05-20",
  "categoryId": "id-da-categoria",
  "account": "Conta principal",
  "isSettled": true
}
```

### Dashboard

```http
GET /dashboard/summary
GET /dashboard/summary?month=5&year=2026
```

### Orçamentos

```http
GET    /budgets
POST   /budgets
PUT    /budgets/:id
DELETE /budgets/:id
GET    /budgets/alerts?month=5&year=2026
```

---

## Rotas do frontend

### Públicas

```txt
/login
/register
/forgot-password
/reset-password
```

### Protegidas

```txt
/dashboard
/transactions
/transactions/new
/budgets
/profile
/categories
```

A rota `/categories` continua disponível, mas a criação de categorias também pode ser realizada diretamente durante o cadastro de uma transação.

---

## Como executar localmente

### Pré-requisitos

- Node.js 22;
- npm;
- Git;
- Banco PostgreSQL ou projeto configurado no Supabase;
- Conta Brevo configurada para testar o envio de e-mails.

### 1. Clonar o repositório

```bash
git clone https://github.com/nicolass200/Fintrack.git
cd Fintrack
```

### 2. Configurar e iniciar o backend

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public"
JWT_SECRET="substitua_por_uma_chave_forte"
PORT=3333
NODE_ENV="development"
APP_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"
BREVO_API_KEY="sua_chave_api_da_brevo"
BREVO_SENDER_EMAIL="email_remetente_verificado"
BREVO_SENDER_NAME="FinTrack"
```

Gere o Prisma Client e execute as migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Inicie a API:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3333`.

Teste a rota de saúde:

```http
GET http://localhost:3333/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "message": "FinTrack API is running"
}
```

### 3. Configurar e iniciar o frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Por padrão, o frontend utiliza a API disponível em:

```txt
http://localhost:3333
```

Para utilizar outro endereço, crie `frontend/.env`:

```env
VITE_API_URL="http://localhost:3333"
```

O Vite informará no terminal a URL local do frontend, normalmente `http://localhost:5173`.

---

## Variáveis de ambiente

### Backend

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `DATABASE_URL` | Sim | Conexão PostgreSQL, incluindo o banco hospedado no Supabase |
| `JWT_SECRET` | Sim | Assinatura e validação dos tokens JWT |
| `PORT` | Não | Porta da API. Valor padrão: `3333` |
| `NODE_ENV` | Recomendado | Use `production` no ambiente publicado |
| `APP_URL` | Recomendado | URL do frontend utilizada no link de redefinição de senha |
| `CORS_ORIGIN` | Recomendado | Origens permitidas, separadas por vírgula |
| `TRUST_PROXY` | Recomendado no Render | Use `true` em ambiente atrás de proxy |
| `BREVO_API_KEY` | Sim para redefinição de senha | Chave da API da Brevo |
| `BREVO_SENDER_EMAIL` | Sim para redefinição de senha | Remetente autorizado na Brevo |
| `BREVO_SENDER_NAME` | Não | Nome do remetente. Valor padrão: `FinTrack` |

### Frontend

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `VITE_API_URL` | Não | URL da API. Valor local padrão: `http://localhost:3333` |

Nunca publique arquivos `.env` nem inclua chaves privadas no código-fonte.

---

## Deploy

### Backend no Render

Configuração esperada para o serviço:

```txt
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm run start
```

Variáveis recomendadas no Render:

```env
DATABASE_URL="url_do_supabase"
JWT_SECRET="chave_forte"
NODE_ENV="production"
TRUST_PROXY="true"
APP_URL="https://seu-frontend.vercel.app"
CORS_ORIGIN="https://seu-frontend.vercel.app"
BREVO_API_KEY="sua_chave_api_da_brevo"
BREVO_SENDER_EMAIL="email_remetente_verificado"
BREVO_SENDER_NAME="FinTrack"
```

O Render fornece a variável `PORT` automaticamente.

### Frontend na Vercel

Configuração esperada:

```txt
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Para utilizar o proxy configurado em `frontend/vercel.json`, defina:

```env
VITE_API_URL="/api"
```

O arquivo `frontend/vercel.json` também redireciona rotas internas para `index.html`, permitindo atualizar páginas como `/dashboard` sem receber erro `404`.

Ao alterar o endereço do backend no Render, atualize o destino do proxy no arquivo `frontend/vercel.json`.

---

## Scripts disponíveis

### Backend

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

---

## Testes manuais recomendados

1. Criar um novo usuário e verificar as categorias padrão;
2. Fazer logout e login;
3. Criar uma despesa paga e outra pendente;
4. Criar uma receita recebida e outra pendente;
5. Criar uma nova categoria durante o cadastro de transação;
6. Verificar filtros por intervalo de datas no extrato;
7. Conferir saldo, pendências e últimas movimentações no dashboard;
8. Criar um orçamento e verificar os alertas;
9. Solicitar redefinição de senha e testar o código enviado pela Brevo;
10. Editar o nome no perfil;
11. Alterar o idioma no perfil e recarregar a página;
12. Conferir a navegação em desktop e em dispositivo móvel.

As rotas protegidas funcionam com cookie autenticado. Para testar a API manualmente, também é possível enviar o token:

```txt
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## Status atual

- [x] Backend modular em Express e TypeScript;
- [x] Banco PostgreSQL hospedado no Supabase;
- [x] Prisma configurado com migrations;
- [x] Autenticação e sessão por cookie `HttpOnly`;
- [x] CRUD de categorias;
- [x] Categorias padrão para novos usuários;
- [x] CRUD de transações com dados adicionais;
- [x] Extrato com filtros por intervalo de datas;
- [x] Dashboard financeiro;
- [x] Orçamentos mensais e alertas;
- [x] Frontend integrado;
- [x] Layout responsivo e navegação mobile;
- [x] Recuperação de senha por e-mail com Brevo;
- [x] Edição de nome no perfil;
- [x] Seleção de idioma no perfil;
- [x] Preparação para deploy no Render e na Vercel;

---

## Melhorias futuras

- Adicionar testes automatizados;
- Concluir a internacionalização das telas;
- Persistir a escolha de idioma no banco de dados;
- Implementar importação de extrato CSV;
- Criar suporte a despesas recorrentes;
- Evoluir o campo de conta para uma entidade estruturada;
- Adicionar monitoramento e formalizar uma política de backup.

---

## Autores

Projeto desenvolvido como trabalho de extensão universitária do curso de Engenharia de Software do iCEV.

- Nicolas Rodrigues;
- Iaggo Vinicius.
