-- --------------------------------------------
-- Migracja: 20251022151045_create_initial_schema.down.sql
-- Cel: Cofnięcie początkowego schematu bazy danych dla "Your Wardrobe"
-- UWAGA: expo-sqlite nie obsługuje natywnego RLS. Zasady bezpieczeństwa muszą być egzekwowane na poziomie aplikacji! 
-- --------------------------------------------
DROP TABLE IF EXISTS migrations;
DROP INDEX IF EXISTS main_photo_per_cloth;
DROP INDEX IF EXISTS idx_tags_name_user_id;
DROP INDEX IF EXISTS idx_outfit_user_id;
DROP INDEX IF EXISTS idx_tags_user_id;
DROP INDEX IF EXISTS idx_category_user_id;
DROP INDEX IF EXISTS idx_photo_cloth_id;
DROP INDEX IF EXISTS idx_cloth_user_id;
DROP TABLE IF EXISTS history_changes;
DROP TABLE IF EXISTS duplicate_map;
DROP TABLE IF EXISTS ai_suggestions_log;
DROP TABLE IF EXISTS outfit_items;
DROP TABLE IF EXISTS outfits;
DROP TABLE IF EXISTS cloth_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS cloth_photos;
DROP TABLE IF EXISTS cloth;
DROP TABLE IF EXISTS users;
