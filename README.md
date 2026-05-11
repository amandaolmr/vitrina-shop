# 🛍️ Vitrina Shop

**Catálogo digital com pedidos no WhatsApp**

Uma plataforma completa para criar sua loja online de forma simples e rápida. Monte seu catálogo de produtos, gerencie variações, controle estoque e receba pedidos direto no WhatsApp.

![Badge](https://img.shields.io/badge/React-19.2-blue)
![Badge](https://img.shields.io/badge/TypeScript-5.8-blue)
![Badge](https://img.shields.io/badge/TanStack_Start-1.16-purple)
![Badge](https://img.shields.io/badge/Supabase-2.10-green)
![Badge](https://img.shields.io/badge/Tailwind-4.2-cyan)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**Vitrina Shop** é uma solução moderna para pequenos e médios empreendedores que desejam ter presença online sem complicação. Ideal para lojas de roupas, acessórios e outros produtos que necessitam de variações (tamanhos, cores, numerações).

### Por que usar o Vitrina?

- ✅ **Simples como o Instagram** — Interface intuitiva e moderna
- ✅ **Pedidos no WhatsApp** — Seus clientes finalizam compras pelo WhatsApp
- ✅ **Variações de produto** — Tamanhos, cores e numerações em um único produto
- ✅ **Controle de estoque** — Acompanhe disponibilidade em tempo real
- ✅ **Catálogo público** — Link único para compartilhar sua loja
- ✅ **Painel administrativo** — Gerencie produtos, categorias e configurações
- ✅ **Responsivo** — Funciona perfeitamente em desktop e mobile

---

## ⚡ Funcionalidades

### Para o Lojista (Admin)

- 🏪 **Gerenciamento de Loja**
  - Configuração de nome, descrição e logo
  - Banner personalizado
  - Informações de frete e atendimento
- 📦 **Gestão de Produtos**
  - Cadastro com múltiplas imagens
  - Variações (cor, tamanho, numeração)
  - SKU e código de barras
  - Controle de estoque por variação
  - Preço e preço comparativo (desconto)
  - Produtos em destaque
- 🗂️ **Categorias**
  - Departamentos e subcategorias
  - Organização hierárquica
  - Reordenação por arrastar

- 📊 **Dashboard**
  - Visão geral de produtos
  - Filtros e busca avançada
  - Paginação de listagens

### Para o Cliente (Vitrine)

- 🛒 **Experiência de Compra**
  - Navegação por categorias e departamentos
  - Busca de produtos
  - Filtros por categoria
  - Visualização detalhada do produto
  - Carousel de imagens
  - Seleção de variações
  - Carrinho de compras
  - Finalização via WhatsApp

- 📱 **Interface Moderna**
  - Design responsivo
  - Carregamento rápido
  - Animações suaves
  - Toast notifications
  - Sistema de favoritos

---

## 🚀 Tecnologias

Este projeto foi construído com as melhores tecnologias modernas:

### Frontend

- **[React 19](https://react.dev/)** — Biblioteca JavaScript para interfaces
- **[TypeScript](https://www.typescriptlang.org/)** — JavaScript com tipagem estática
- **[TanStack Start](https://tanstack.com/start/)** — Framework full-stack React
- **[TanStack Router](https://tanstack.com/router/)** — Roteamento type-safe
- **[TanStack Query](https://tanstack.com/query/)** — Gerenciamento de estado assíncrono
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Framework CSS utility-first
- **[Radix UI](https://www.radix-ui.com/)** — Componentes acessíveis e não estilizados
- **[Lucide React](https://lucide.dev/)** — Ícones SVG modernos

### Backend & Infraestrutura

- **[Supabase](https://supabase.com/)** — Backend as a Service (PostgreSQL, Auth, Storage)
- **[Cloudflare Workers](https://workers.cloudflare.com/)** — Edge computing
- **[Vite](https://vite.dev/)** — Build tool ultra-rápida

### Ferramentas de Desenvolvimento

- **[ESLint](https://eslint.org/)** — Linting de código
- **[Prettier](https://prettier.io/)** — Formatação de código
- **[React Hook Form](https://react-hook-form.com/)** — Gerenciamento de formulários
- **[Zod](https://zod.dev/)** — Validação de schemas
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications elegantes
- **[Embla Carousel](https://www.embla-carousel.com/)** — Carousels modernos

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** versão 18 ou superior
- **npm** ou **yarn** ou **pnpm**
- **Git**
- Conta no **[Supabase](https://supabase.com/)** (gratuita)
- Conta no **[Cloudflare](https://cloudflare.com/)** (opcional, para deploy)

---

## 🔧 Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/vitrina-shop.git
   cd vitrina-shop
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

---

## ⚙️ Configuração

### 1. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com/) e crie um novo projeto
2. Vá em **Settings → API** e copie:
   - `Project URL`
   - `anon public key`

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 3. Configure o Banco de Dados

Execute as migrations do Supabase:

```bash
# Inicie o Supabase localmente (opcional)
npx supabase init
npx supabase start

# Ou aplique as migrations no projeto remoto
npx supabase db push
```

#### Estrutura das Tabelas

O projeto utiliza as seguintes tabelas principais:

- **`stores`** — Informações das lojas
- **`products`** — Produtos cadastrados
- **`product_images`** — Imagens dos produtos
- **`product_variants`** — Variações (cor, tamanho, numeração)
- **`categories`** — Categorias e departamentos
- **`orders`** — Pedidos realizados (opcional)

### 4. Configure a Autenticação

No painel do Supabase:

1. Vá em **Authentication → Providers**
2. Habilite o provedor de **Email**
3. Configure as URLs de redirecionamento:
   - Development: `http://localhost:5173/auth`
   - Production: `https://seu-dominio.com/auth`

---

## 🎮 Uso

### Desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build

Gere a versão de produção:

```bash
npm run build
```

### Preview

Visualize o build de produção localmente:

```bash
npm run preview
```

### Lint e Formatação

```bash
# Verificar problemas de código
npm run lint

# Formatar código
npm run format
```

---

## 📁 Estrutura do Projeto

```
vitrina-shop/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes reutilizáveis (Radix + Tailwind)
│   │   ├── ProductCard.tsx
│   │   ├── StoreBanner.tsx
│   │   ├── StoreFilters.tsx
│   │   └── ...
│   │
│   ├── routes/             # Rotas da aplicação (TanStack Router)
│   │   ├── __root.tsx      # Layout raiz
│   │   ├── index.tsx       # Landing page
│   │   ├── auth.tsx        # Autenticação
│   │   ├── admin/          # Painel administrativo
│   │   │   ├── produtos/   # CRUD de produtos
│   │   │   ├── categorias/ # Gerenciar categorias
│   │   │   └── loja/       # Configurações da loja
│   │   └── loja/           # Vitrine pública
│   │       ├── $slug/      # Página da loja
│   │       ├── produto/    # Detalhes do produto
│   │       └── carrinho/   # Carrinho de compras
│   │
│   ├── integrations/       # Integrações externas
│   │   └── supabase/       # Cliente e tipos Supabase
│   │
│   ├── lib/                # Utilitários e helpers
│   │   ├── auth-context.tsx
│   │   ├── store-context.ts
│   │   ├── cart.ts
│   │   ├── favorites.ts
│   │   └── utils.ts
│   │
│   ├── hooks/              # Custom React hooks
│   │   └── use-mobile.tsx
│   │
│   ├── router.tsx          # Configuração do router
│   ├── server.ts           # Entry point do servidor
│   └── styles.css          # Estilos globais (Tailwind)
│
├── supabase/               # Configurações e migrations
│   ├── config.toml
│   └── migrations/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── wrangler.jsonc          # Config Cloudflare Workers
├── components.json         # Config shadcn/ui
└── README.md
```

---

## 🚢 Deploy

### Cloudflare Pages (Recomendado)

1. **Instale Wrangler CLI**

   ```bash
   npm install -g wrangler
   ```

2. **Faça login no Cloudflare**

   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   npm run build
   wrangler pages deploy dist
   ```

### Vercel

1. Instale a Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Netlify

1. Instale a Netlify CLI:

   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

> **⚠️ Importante:** Configure as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) no painel da plataforma de deploy escolhida.

---

## 🎨 Personalização

### Temas e Cores

As cores são configuráveis via Tailwind CSS. Edite o arquivo `src/styles.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  /* ... */
}
```

### Componentes UI

Os componentes da pasta `src/components/ui/` são baseados no **shadcn/ui** e podem ser customizados individualmente.

Para adicionar novos componentes:

```bash
npx shadcn@latest add [component-name]
```

---
