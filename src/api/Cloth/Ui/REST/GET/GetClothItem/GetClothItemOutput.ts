// Kontrakt wyjściowy dla UI (prosty, jawny – bez obiektów domenowych).
export type GetClothItemOutput = {
  id: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  season?: string | null;
  location?: string | null;
  category?: {
    id: number;
    name: string;
  } | null;
  tags?: { id: number; name: string }[];
};
