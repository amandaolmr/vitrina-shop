
-- Enum app_role
create type public.app_role as enum ('admin');

-- Stores
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  slug text not null unique,
  name text not null,
  description text,
  logo_url text,
  banner_url text,
  whatsapp text,
  theme_color text default '#0f172a',
  created_at timestamptz not null default now()
);
create index on public.stores(owner_id);

-- User roles per store
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  store_id uuid not null references public.stores(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, store_id, role)
);
create index on public.user_roles(user_id);

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.categories(store_id);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  compare_at_price numeric(10,2),
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on public.products(store_id);
create index on public.products(category_id);

-- Product images
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.product_images(product_id);

-- Product variants
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  color text,
  numbering text,
  stock int not null default 0,
  sku text,
  created_at timestamptz not null default now()
);
create index on public.product_variants(product_id);

-- Security definer function
create or replace function public.has_store_role(_user_id uuid, _store_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and store_id = _store_id and role = _role
  )
$$;

-- Trigger: auto-create admin role when store is created
create or replace function public.handle_new_store()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, store_id, role)
  values (new.owner_id, new.id, 'admin');
  return new;
end;
$$;

create trigger on_store_created
after insert on public.stores
for each row execute function public.handle_new_store();

-- Enable RLS
alter table public.stores enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

-- Policies: stores
create policy "stores public read" on public.stores for select using (true);
create policy "stores owner insert" on public.stores for insert to authenticated with check (auth.uid() = owner_id);
create policy "stores admin update" on public.stores for update to authenticated using (public.has_store_role(auth.uid(), id, 'admin'));
create policy "stores admin delete" on public.stores for delete to authenticated using (public.has_store_role(auth.uid(), id, 'admin'));

-- Policies: user_roles
create policy "user_roles self read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_store_role(auth.uid(), store_id, 'admin'));
create policy "user_roles admin insert" on public.user_roles for insert to authenticated with check (public.has_store_role(auth.uid(), store_id, 'admin'));
create policy "user_roles admin delete" on public.user_roles for delete to authenticated using (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Policies: categories
create policy "categories public read" on public.categories for select using (true);
create policy "categories admin all" on public.categories for all to authenticated using (public.has_store_role(auth.uid(), store_id, 'admin')) with check (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Policies: products
create policy "products public read" on public.products for select using (active = true);
create policy "products admin read" on public.products for select to authenticated using (public.has_store_role(auth.uid(), store_id, 'admin'));
create policy "products admin all" on public.products for all to authenticated using (public.has_store_role(auth.uid(), store_id, 'admin')) with check (public.has_store_role(auth.uid(), store_id, 'admin'));

-- Policies: product_images
create policy "product_images public read" on public.product_images for select using (true);
create policy "product_images admin all" on public.product_images for all to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and public.has_store_role(auth.uid(), p.store_id, 'admin')))
  with check (exists (select 1 from public.products p where p.id = product_id and public.has_store_role(auth.uid(), p.store_id, 'admin')));

-- Policies: product_variants
create policy "product_variants public read" on public.product_variants for select using (true);
create policy "product_variants admin all" on public.product_variants for all to authenticated
  using (exists (select 1 from public.products p where p.id = product_id and public.has_store_role(auth.uid(), p.store_id, 'admin')))
  with check (exists (select 1 from public.products p where p.id = product_id and public.has_store_role(auth.uid(), p.store_id, 'admin')));

-- Storage bucket
insert into storage.buckets (id, name, public) values ('store-assets', 'store-assets', true)
on conflict (id) do nothing;

create policy "store-assets public read" on storage.objects for select using (bucket_id = 'store-assets');
create policy "store-assets auth upload" on storage.objects for insert to authenticated with check (bucket_id = 'store-assets');
create policy "store-assets auth update" on storage.objects for update to authenticated using (bucket_id = 'store-assets');
create policy "store-assets auth delete" on storage.objects for delete to authenticated using (bucket_id = 'store-assets');
