export interface AiSuggestionLog {
  id: number;
  user_id: number;
  cloth_id?: number | null;
  input?: string | null;
  suggested_category?: string | null;
  suggested_tags?: string | null;
  confidence?: number | null;
  user_decision?: string | null;
  created_at: number;
}
