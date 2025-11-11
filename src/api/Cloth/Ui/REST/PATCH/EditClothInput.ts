// Najprostszy typ wejściowy z walidacją na poziomie kontrolera.
// Pola kategorii i tagów zostawiamy na przyszłość (opcjonalne).

export type EditClothInput = {
  clothId: number; // wymagane
  userId?: string; // wymagane
  name?: string;
  description?: string;
  color?: string;
  brand?: string;
  location?: string;
  categoryId: number;
  tagIds?: number[];
};
