# Palpiteiro Pro - Configuração do Supabase

Para que o aplicativo funcione corretamente, você precisa executar o seguinte SQL no **SQL Editor** do seu painel do Supabase:

```sql
-- 1. Tabela de Perfis (ligada ao Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Palpites
create table public."Predictions" (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users on delete cascade not null,
  match_id text not null,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, match_id) -- Impede palpites duplicados para o mesmo jogo
);

-- 3. Habilitar RLS (Segurança)
alter table public.profiles enable row level security;
alter table public."Predictions" enable row level security;

-- 4. Políticas para Perfis
create policy "Perfis públicos são visíveis para todos" on public.profiles for select using (true);
create policy "Usuários podem atualizar o próprio perfil" on public.profiles for update using (auth.uid() = id);

-- 5. Políticas para Palpites
create policy "Palpites são visíveis para todos" on public."Predictions" for select using (true);
create policy "Usuários podem inserir os próprios palpites" on public."Predictions" for insert with check (auth.uid() = user_id);
create policy "Usuários podem atualizar os próprios palpites" on public."Predictions" for update using (auth.uid() = user_id);

-- 6. Trigger para criar perfil automaticamente no cadastro
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### O que este script faz:
1. **Sincronização**: Cria um perfil automaticamente sempre que um novo usuário se cadastrar.
2. **Segurança**: Garante que um usuário não consiga alterar o palpite de outro.
3. **Integridade**: O índice `unique(user_id, match_id)` garante que cada usuário tenha apenas um palpite por jogo.
