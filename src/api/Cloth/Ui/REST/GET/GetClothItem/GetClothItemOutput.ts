// Kontrakt wyjściowy dla UI (prosty, jawny – bez obiektów domenowych).
export type GetClothItemOutput = {
  id: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  color?: string | null;
  season?: string | null;
  location?: string | null;
  thumbUrl?: string | null;
  photos?: { id: number; url: string; main: boolean; createdAt: number }[];
  category?: {
    id: number;
    name: string;
  } | null;
  tags?: { id: number; name: string }[];
};
