# Palpiteiro Pro - Configuração do Supabase

Copie e cole APENAS o código SQL abaixo no seu **SQL Editor** do Supabase:

```sql
-- 1. Tabela de Perfis
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Palpites
create table if not exists public."Predictions" (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users on delete cascade not null,
  match_id text not null,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, match_id)
);

-- 3. Segurança (RLS)
alter table public.profiles enable row level security;
alter table public."Predictions" enable row level security;

-- 4. Políticas Profiles (Usa blocos anônimos para evitar erro se já existirem)
do $$ begin
  create policy "Perfis públicos são visíveis para todos" on public.profiles for select using (true);
exception when others then null; end $$;

do $$ begin
  create policy "Usuários podem atualizar o próprio perfil" on public.profiles for update using (auth.uid() = id);
exception when others then null; end $$;

-- 5. Políticas Predictions
do $$ begin
  create policy "Palpites são visíveis para todos" on public."Predictions" for select using (true);
exception when others then null; end $$;

do $$ begin
  create policy "Usuários podem inserir os próprios palpites" on public."Predictions" for insert with check (auth.uid() = user_id);
exception when others then null; end $$;

do $$ begin
  create policy "Usuários podem atualizar os próprios palpites" on public."Predictions" for update using (auth.uid() = user_id);
exception when others then null; end $$;

-- 6. Trigger Automação
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```