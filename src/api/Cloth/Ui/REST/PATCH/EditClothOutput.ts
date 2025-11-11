// Zazwyczaj przy PATCH zwracamy zaktualizowany obiekt domenowy.
// Minimalny kształt na potrzeby UI; można rozszerzyć w przyszłości.

export type EditClothOutput = {
  id: string;
  description?: string;
  color?: string;
  brand?: string;
  location?: string;
  updatedAt: string; // ISO
};
