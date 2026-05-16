# 🛍️ Vitrina Shop

**Sua vitrine digital com pedidos no WhatsApp**

Sistema completo de catálogo online para estabelecimentos. Uma solução self-hosted para gerenciar produtos com variações, controle de estoque e checkout direto via WhatsApp.

![Badge](https://img.shields.io/badge/React-19.2-blue)
![Badge](https://img.shields.io/badge/TypeScript-5.8-blue)
![Badge](https://img.shields.io/badge/TanStack_Start-1.16-purple)
![Badge](https://img.shields.io/badge/Supabase-2.10-green)
![Badge](https://img.shields.io/badge/Tailwind-4.2-cyan)

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Capturas de Tela](#capturas-de-tela)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Deploy](#deploy)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**Vitrina Shop** é um sistema de catálogo digital desenvolvido para **estabelecimentos únicos** que desejam ter sua própria vitrine online. Ideal para lojas de roupas, acessórios, calçados e qualquer negócio que precise gerenciar produtos com variações (tamanhos, cores, numerações).

### 🌟 Características Principais

- 🏪 **App para Estabelecimento Único** — Um usuário administrador gerencia tudo
- 💼 **Painel Administrativo Completo** — Gerencie produtos, categorias e loja
- 🛍️ **Catálogo Público** — Link único para compartilhar com clientes
- 📱 **Checkout WhatsApp** — Clientes finalizam compras pelo WhatsApp
- 🎨 **Variações Complexas** — Tamanho, cor e numeração por produto
- 📦 **Controle de Estoque** — Acompanhe disponibilidade por variação
- 🚀 **Performance** — Construído com tecnologias modernas e rápidas
- 📱 **Mobile-First** — Interface responsiva e otimizada para smartphones

### 💡 Diferencial

Diferente de plataformas SaaS, o Vitrina Shop é:
- ✅ **Self-hosted** — Você tem controle total dos seus dados
- ✅ **Sem mensalidades** — Hospede onde quiser
- ✅ **Customizável** — Código aberto para adaptações
- ✅ **Privado** — Apenas um usuário admin por instalação
- ✅ **Simples** — Foco no essencial, sem complexidade desnecessária

---

## ⚡ Funcionalidades

### 🔐 Área Administrativa (Acesso Único)

- **Autenticação Simplificada**
  - Login seguro via email/senha
  - Acesso restrito ao proprietário do estabelecimento
  - Sessão persistente

- **🏪 Gerenciamento de Loja**
  - Configuração de nome, slug (URL) e descrição
  - Upload de logo e banner
  - Informações de contato (WhatsApp, Instagram, etc)
  - Configuração de frete e política de envio
  - Customização de cores e tema (em desenvolvimento)

- **📦 Gestão de Produtos**
  - Cadastro completo com múltiplas imagens
  - Upload de imagens com preview instantâneo
  - Variações complexas (Cor, Tamanho, Numeração)
  - Controle de estoque por variação
  - Preço e preço promocional
  - SKU e código de barras
  - Status (publicado/rascunho)
  - Produtos em destaque
  - Edição e exclusão

- **🗂️ Categorias e Organização**
  - Departamentos principais
  - Subcategorias ilimitadas
  - Estrutura hierárquica
  - Reordenação por arrastar (drag & drop)

- **📊 Dashboard**
  - Listagem completa de produtos
  - Busca e filtros avançados
  - Paginação otimizada
  - Estatísticas rápidas (em desenvolvimento)

### 🛍️ Vitrine Pública (Para Clientes)

- **Navegação Intuitiva**
  - Página inicial com produtos em destaque
  - Listagem por categorias e departamentos
  - Busca de produtos
  - Filtros dinâmicos
  - Banner e informações da loja

- **Experiência de Compra**
  - Visualização detalhada de produtos
  - Galeria de imagens com carousel
  - Seleção de variações (cor, tamanho, numeração)
  - Visualização de estoque disponível
  - Adição ao carrinho
  - Sistema de favoritos
  - Carrinho de compras persistente

- **Checkout via WhatsApp**
  - Resumo completo do pedido
  - Mensagem formatada automaticamente
  - Envio direto para WhatsApp da loja
  - Include preço total e itens selecionados

- **Interface Moderna**
  - Design responsivo (mobile e desktop)
  - Carregamento otimizado
  - Animações suaves
  - Toast notifications
  - Scroll infinito (em desenvolvimento)

---

## � Capturas de Tela

> ℹ️ _Em breve: screenshots das principais telas do sistema_

**Áreas principais:**
- Página inicial pública
- Tela de produto (com variações)
- Carrinho de compras
- Painel administrativo
- Gerenciamento de produtos
- Configuração da loja

---

## 🚀 Tecnologias

Este projeto foi construído com as melhores tecnologias modernas:

### Frontend

- **[React 19](https://react.dev/)** — Biblioteca JavaScript para interfaces de usuário
- **[TypeScript 5.8](https://www.typescriptlang.org/)** — JavaScript com tipagem estática
- **[TanStack Start](https://tanstack.com/start/)** — Framework full-stack React moderno
- **[TanStack Router](https://tanstack.com/router/)** — Roteamento type-safe e file-based
- **[TanStack Query](https://tanstack.com/query/)** — Gerenciamento de estado assíncrono
- **[Tailwind CSS 4](https://tailwindcss.com/)** — Framework CSS utility-first de última geração
- **[Radix UI](https://www.radix-ui.com/)** — Componentes acessíveis e não estilizados
- **[Lucide React](https://lucide.dev/)** — Biblioteca de ícones SVG moderna

### Backend & Infraestrutura

- **[Supabase](https://supabase.com/)** — Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Storage (para imagens)
  - Row Level Security
- **[Vite](https://vite.dev/)** — Build tool ultra-rápida com HMR

### Ferramentas & Bibliotecas

- **[React Hook Form](https://react-hook-form.com/)** — Gerenciamento performático de formulários
- **[Zod](https://zod.dev/)** — Validação de schemas TypeScript-first
- **[Sonner](https://sonner.emilkowal.ski/)** — Toast notifications elegantes
- **[Embla Carousel](https://www.embla-carousel.com/)** — Carousels modernos e acessíveis
- **[class-variance-authority](https://cva.style/)** — Gerenciamento de variantes de componentes
- **[clsx](https://github.com/lukeed/clsx)** — Utilitário para classes condicionais

### Qualidade de Código

- **[ESLint](https://eslint.org/)** — Linting de código JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** — Formatação de código consistente

### Deploy (Opcional)

- **[Cloudflare Workers](https://workers.cloudflare.com/)** — Edge computing para deploy rápido
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — Hospedagem de sites estáticos

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **[Node.js](https://nodejs.org/)** versão 18 ou superior
- **npm** (incluído com Node.js) ou **yarn** ou **pnpm**
- **[Git](https://git-scm.com/)**
- Conta no **[Supabase](https://supabase.com/)** (plano gratuito disponível)
- _(Opcional)_ Conta no **[Cloudflare](https://cloudflare.com/)** para deploy

---

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/vitrina-shop.git
cd vitrina-shop
```

### 2. Instale as dependências

```bash
npm install
```

Ou use seu gerenciador de pacotes preferido:

```bash
# Yarn
yarn install

# PNPM
pnpm install
```

---

## ⚙️ Configuração

### 1. Configure o Supabase

#### 1.1. Crie um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/) e faça login
2. Clique em **"New Project"**
3. Preencha os dados e aguarde a criação do projeto

#### 1.2. Obtenha as credenciais

1. No painel do Supabase, vá em **Settings → API**
2. Copie:
   - **Project URL** (`URL`)
   - **anon public** key (`API Key`)

### 2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

> ⚠️ **Importante**: Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

### 3. Configure o Banco de Dados

#### 3.1. Execute as migrations

O projeto inclui as migrations SQL necessárias na pasta `supabase/migrations/`. Para aplicá-las:

**Opção A: Via Supabase Dashboard (Recomendado)**

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Abra o arquivo `supabase/migrations/20260508200116_98201c88-21d8-40b7-b978-21203b6a36a8.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor e execute

**Opção B: Via Supabase CLI**

```bash
# Instale a CLI do Supabase
npm install -g supabase

# Faça login
supabase login

# Link com seu projeto
supabase link --project-ref seu-project-ref

# Aplique as migrations
supabase db push
```

#### 3.2. Estrutura das Tabelas

O banco de dados inclui as seguintes tabelas principais:

- **`stores`** — Informações da loja (nome, logo, whatsapp, etc)
- **`categories`** — Categorias e departamentos de produtos
- **`products`** — Produtos cadastrados
- **`product_images`** — Imagens dos produtos (múltiplas por produto)
- **`product_variants`** — Variações (cor, tamanho, numeração + estoque)

### 4. Configure a Autenticação (Usuário Admin)

#### 4.1. Crie o usuário administrador

Como este é um app de estabelecimento único, você precisa criar **apenas um usuário** administrador:

**Via Supabase Dashboard:**

1. Acesse **Authentication → Users**
2. Clique em **"Add user"**
3. Escolha **"Create new user"**
4. Preencha:
   - Email: seu-email@exemplo.com
   - Password: sua_senha_segura
   - Auto Confirm User: ✅ _(marque esta opção)_
5. Clique em **Create user**

**Via SQL Editor (alternativa):**

```sql
-- Substitua os valores abaixo
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'seu-email@exemplo.com',
  crypt('sua_senha_segura', gen_salt('bf')),
  NOW()
);
```

> 💡 **Dica**: Guarde bem essas credenciais, pois serão usadas para acessar o painel administrativo.

### 5. Configure o Storage (para imagens)

#### 5.1. Crie os buckets

1. No Supabase, vá em **Storage**
2. Crie dois buckets:
   - **`products`** (para imagens de produtos)
   - **`stores`** (para logos e banners)
3. Configure ambos como **públicos**:
   - Clique no bucket → **Policies** → **New Policy**
   - Selecione template **"Allow public read access"**
   - Aplique a policy

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

## 🗺️ Roadmap

Funcionalidades planejadas para versões futuras:

- [ ] **Analytics** — Dashboard com estatísticas de visualizações e cliques
- [ ] **Múltiplas lojas** — Suporte para mais de um estabelecimento
- [ ] **Gestão de pedidos** — Histórico e status de pedidos
- [ ] **Cupons de desconto** — Sistema de cupons e promoções
- [ ] **Avaliações** — Clientes podem avaliar produtos
- [ ] **Modo escuro** — Alternância de tema claro/escuro
- [ ] **Notificações** — Avisos de novos pedidos via email/push
- [ ] **SEO** — Meta tags otimizadas por produto
- [ ] **PWA** — Progressive Web App installable
- [ ] **Exportação de dados** — CSV/Excel de produtos e pedidos
- [ ] **API pública** — Integrações com outros sistemas

---

## ❓ FAQ (Perguntas Frequentes)

<details>
<summary><strong>Como adiciono mais de um usuário administrador?</strong></summary>
<br>

Este sistema foi projetado para **um único usuário administrador** por instalação. Se você precisar de múltiplos usuários, será necessário implementar um sistema de permissões e roles.

</details>

<details>
<summary><strong>Posso usar outro banco de dados além do Supabase?</strong></summary>
<br>

Sim, mas exigirá refatoração significativa. O código usa o cliente do Supabase extensivamente. Você precisaria:
- Substituir `@supabase/supabase-js` por outro client
- Reescrever a camada de autenticação
- Adaptar as queries do banco de dados

</details>

<details>
<summary><strong>Como adiciono mais variações além de cor, tamanho e numeração?</strong></summary>
<br>

No banco de dados, a tabela `product_variants` armazena essas variações. Para adicionar novos tipos:
1. Adicione campos na tabela `product_variants`
2. Ajuste os formulários em `src/routes/admin.produtos.*.tsx`
3. Atualize a interface de seleção no produto público

</details>

<details>
<summary><strong>O sistema processa pagamentos?</strong></summary>
<br>

Não. O Vitrina Shop é focado em **catálogo e checkout via WhatsApp**. O pagamento é negociado diretamente entre você e seu cliente via WhatsApp/PIX/transferência/etc.

</details>

<details>
<summary><strong>Posso customizar as mensagens do WhatsApp?</strong></summary>
<br>

Sim! As mensagens são geradas em `src/lib/cart.ts` (função de formatação do carrinho). Você pode editar o template da mensagem lá.

</details>

<details>
<summary><strong>Como faço backup dos dados?</strong></summary>
<br>

Use as ferramentas do Supabase:
1. **Via Dashboard**: Database → Backups
2. **Via CLI**: `supabase db dump > backup.sql`

Também faça backup das imagens no Storage.

</details>

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Se você deseja melhorar o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Sugestões e Bugs

- Use as [Issues](https://github.com/seu-usuario/vitrina-shop/issues) para reportar bugs
- Use as [Discussions](https://github.com/seu-usuario/vitrina-shop/discussions) para sugestões

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome](https://github.com/seu-usuario)

---

## 📞 Suporte

- 📧 Email: seu-email@exemplo.com
- 💬 WhatsApp: [Clique aqui](https://wa.me/5583994043126)
- 🐙 GitHub: [Issues](https://github.com/seu-usuario/vitrina-shop/issues)

---

## ⭐ Demonstração

> 🚀 **[Ver demonstração ao vivo](https://vitrina-shop.exemplo.com)**

---

<div align="center">

**Se este projeto foi útil para você, considere dar uma ⭐!**

Made with ❤️ and TypeScript

</div>
