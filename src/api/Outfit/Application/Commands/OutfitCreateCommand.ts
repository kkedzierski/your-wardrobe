export interface OutfitCreateCommand {
  name?: string | null;
  description?: string | null;
  items?: number[]; // cloth ids
}
