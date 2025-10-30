export interface AiSuggestionCommand {
  cloth_id?: number | null;
  input?: string | null;
  suggested_category?: string | null;
  suggested_tags?: string | null;
  confidence?: number | null;
  user_decision?: string | null;
}
