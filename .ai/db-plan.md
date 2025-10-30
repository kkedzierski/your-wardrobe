# Schemat bazy danych – Your Wardrobe (SQLite/Expo-SQLite)

## 1. Lista tabel z kolumnami, typami danych i ograniczeniami

### users

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `email` TEXT
- `role` TEXT DEFAULT 'ROLE_USER' NOT NULL
- `created_at` INTEGER NOT NULL
- `updated_at` INTEGER NOT NULL
- `deleted_at` INTEGER -- dla soft-delete

### cloth

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `name` TEXT NOT NULL
- `description` TEXT
- `category_id` INTEGER REFERENCES categories(id)
- `color` TEXT
- `brand` TEXT
- `season` TEXT
- `location` TEXT
- `created_at` INTEGER NOT NULL
- `updated_at` INTEGER NOT NULL
- `deleted_at` INTEGER

### cloth_photos

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `cloth_id` INTEGER NOT NULL REFERENCES cloth(id) ON DELETE CASCADE
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `file_path` TEXT NOT NULL
- `hash` TEXT NOT NULL -- perceptual hash/podst. hash do deduplikacji po MVP
- `main` INTEGER NOT NULL DEFAULT 0 -- BOOL, tylko jedno TRUE na cloth_id
- `created_at` INTEGER NOT NULL
- `deleted_at` INTEGER

### categories

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `name` TEXT NOT NULL
- `created_at` INTEGER NOT NULL
- `updated_at` INTEGER NOT NULL
- `deleted_at` INTEGER
- UNIQUE(user_id, name) -- nazwy kategorii unikalne per user

### tags

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `name` TEXT NOT NULL
- `created_at` INTEGER
- `updated_at` INTEGER
- UNIQUE(user_id, name)

### cloth_tags

- `cloth_id` INTEGER NOT NULL REFERENCES cloth(id) ON DELETE CASCADE
- `tag_id` INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
- PRIMARY KEY(cloth_id, tag_id)

### outfits

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `name` TEXT
- `description` TEXT
- `created_at` INTEGER NOT NULL
- `updated_at` INTEGER NOT NULL
- `deleted_at` INTEGER

### outfit_items

- `outfit_id` INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE
- `cloth_id` INTEGER NOT NULL REFERENCES cloth(id) ON DELETE CASCADE
- PRIMARY KEY(outfit_id, cloth_id)

### ai_suggestions_log

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `cloth_id` INTEGER REFERENCES cloth(id)
- `input` TEXT
- `suggested_category` TEXT
- `suggested_tags` TEXT
- `confidence` REAL
- `user_decision` TEXT -- accept/edit
- `created_at` INTEGER NOT NULL

### history_changes

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `user_id` INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- `entity_type` TEXT NOT NULL
- `entity_id` INTEGER NOT NULL
- `operation` TEXT NOT NULL -- insert/update/delete
- `timestamp` INTEGER NOT NULL

## 2. Relacje między tabelami

- Jeden user → wiele cloth, outfits, categories, tags, ai_suggestions_log
- Jeden cloth → wiele cloth_photos, cloth_tags, outfit_items
- Wiele-to-wielu: cloth_tags (wiele tagów do cloth, unikalność per user)
- Wiele-to-wielu: outfit_items (wiele cloth w outfit, jedno cloth w wielu outfitach)
- categories/ tags powiązane z userem i edytowalne (per user)

## 3. Indeksy

- `CREATE INDEX idx_cloth_user_id ON cloth(user_id);`
- `CREATE INDEX idx_photo_cloth_id ON cloth_photos(cloth_id);`
- `CREATE INDEX idx_category_user_id ON categories(user_id);`
- `CREATE INDEX idx_tags_user_id ON tags(user_id);`
- `CREATE INDEX idx_outfit_user_id ON outfits(user_id);`
- `CREATE INDEX idx_tags_name_user_id ON tags(name, user_id);`
- `CREATE UNIQUE INDEX main_photo_per_cloth ON cloth_photos(cloth_id) WHERE main = 1;`
- Indeksy na `deleted_at` dla szybkiego filtrowania aktywnych rekordów opcjonalnie

## 4. Zasady SQLite/Expo-SQLite (bezpośrednie RLS, uwagi)

- SQLite nie wspiera natywnego RLS, ale należy zawsze filtrować dane po `user_id` na poziomie zapytań aplikacji.
- Należy stosować ON DELETE CASCADE w FK, aby zapewnić twarde usuwanie powiązanych rekordów.
- Soft-delete realizowany przez pole `deleted_at` – rekordy z tym polem ≠ NULL nie są widoczne w głównych widokach aplikacji.
- Jeden rekord głównego zdjęcia (main=1) wymaga walidacji aplikacyjnej (unikatowość per cloth_id).

## 5. Dodatkowe uwagi/wyjaśnienia

- Wszystkie dane ściśle powiązane z user_id – pozwala to na separację, eksport, kasowanie.
- Backup JSON generowany na podstawie tabel powiązanych z userem, bez historii usunięć.
- Atrybuty (color, brand, season, location) typu TEXT – elastyczność i prostota MVP.
- Rozszerzenie RLS lub audytu/permissions na POZA MVP.
- Wybrane kolumny dat typu INTEGER (Unix epoch millis lub sekundy).
- Brak enumów, lookup tables w MVP – można rozszerzyć pod rozbudowę po MVP.
