-- --------------------------------------------
-- Migracja: 20251022151045_create_initial_schema.up.sql
-- Cel: Utworzenie początkowego schematu bazy danych dla "Your Wardrobe"
-- UWAGA: expo-sqlite nie obsługuje natywnego RLS. Zasady bezpieczeństwa muszą być egzekwowane na poziomie aplikacji! 
-- Dotyczy tabel: users, cloth, cloth_photos, categories, tags, cloth_tags, outfits, outfit_items, ai_suggestions_log, duplicate_map, history_changes
-- --------------------------------------------
-- Tabela użytkowników
create table if not exists users (
    id integer primary key autoincrement,
    email text,
    role text default 'ROLE_USER' not null,
    created_at integer not null,
    updated_at integer not null,
    deleted_at integer
);
-- Tabela ubrań
create table if not exists cloth (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    name text not null,
    description text,
    category_id integer references categories(id),
    color text,
    brand text,
    season text,
    location text,
    created_at integer not null,
    updated_at integer not null,
    deleted_at integer
);
-- Tabela zdjęć ubrań
create table if not exists cloth_photos (
    id integer primary key autoincrement,
    cloth_id integer not null references cloth(id) on delete cascade,
    user_id integer not null references users(id) on delete cascade,
    file_path text not null,
    hash text not null,
    main integer not null default 0,
    created_at integer not null,
    deleted_at integer
);
-- Tabela kategorii
create table if not exists categories (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    name text not null,
    created_at integer not null,
    updated_at integer not null,
    deleted_at integer,
    unique(user_id, name)
);
-- Tabela tagów
create table if not exists tags (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    name text not null,
    created_at integer,
    updated_at integer,
    unique(user_id, name)
);
-- Wiązanie cloth <-> tag
create table if not exists cloth_tags (
    cloth_id integer not null references cloth(id) on delete cascade,
    tag_id integer not null references tags(id) on delete cascade,
    primary key(cloth_id, tag_id)
);
-- Stylizacje
create table if not exists outfits (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    name text,
    description text,
    created_at integer not null,
    updated_at integer not null,
    deleted_at integer
);
-- Wiązania outfit_items
create table if not exists outfit_items (
    outfit_id integer not null references outfits(id) on delete cascade,
    cloth_id integer not null references cloth(id) on delete cascade,
    primary key(outfit_id, cloth_id)
);
-- Logi podpowiedzi AI
create table if not exists ai_suggestions_log (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    cloth_id integer references cloth(id),
    input text,
    suggested_category text,
    suggested_tags text,
    confidence real,
    user_decision text,
    created_at integer not null
);
-- Mapa duplikatów zdjęć
create table if not exists duplicate_map (
    photo_id integer not null references cloth_photos(id) on delete cascade,
    duplicate_of_photo_id integer not null references cloth_photos(id) on delete cascade,
    created_at integer,
    primary key(photo_id, duplicate_of_photo_id)
);
-- Historia zmian (audyt)
create table if not exists history_changes (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    entity_type text not null,
    entity_id integer not null,
    operation text not null,
    timestamp integer not null
);
-- Indeksy dla wydajności
create index if not exists idx_cloth_user_id on cloth(user_id);
create index if not exists idx_photo_cloth_id on cloth_photos(cloth_id);
create index if not exists idx_category_user_id on categories(user_id);
create index if not exists idx_tags_user_id on tags(user_id);
create index if not exists idx_outfit_user_id on outfits(user_id);
create index if not exists idx_tags_name_user_id on tags(name, user_id);
create unique index if not exists main_photo_per_cloth on cloth_photos(cloth_id) where main = 1;
