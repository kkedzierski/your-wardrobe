// Najprostszy typ wejściowy z walidacją na poziomie kontrolera.
// Pola kategorii i tagów zostawiamy na przyszłość (opcjonalne).

export type EditClothInput = {
  clothId: number; // wymagane
  userId?: string; // wymagane
  description?: string;
  color?: string;
  brand?: string;
  location?: string;
  // future:
  categoryIds?: string[];
  tagIds?: string[];
};
