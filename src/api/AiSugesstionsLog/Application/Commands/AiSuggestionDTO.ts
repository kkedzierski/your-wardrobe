import { AiSuggestionCommand } from "./AiSuggestionCommand";

export interface AiSuggestionDTO extends AiSuggestionCommand {
  id: number;
  created_at: number;
}
