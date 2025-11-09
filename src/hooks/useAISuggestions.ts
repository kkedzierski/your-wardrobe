import { useState } from "react";

type AISuggestions = {
  name?: string;
  category?: string;
  season?: string;
  color?: string;
  brand?: string;
};

export const useAISuggestions = () => {
  const [aiSuggestions, setAISuggestions] = useState<AISuggestions | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchAISuggestions = async (photo: File) => {
    setLoading(true);
    // TODO: Integracja z API pobierającym sugestie AI
    setLoading(false);
  };

  const acceptSuggestion = (field: string) => {
    // Zatwierdzanie pojedynczej propozycji
  };

  return { aiSuggestions, fetchAISuggestions, acceptSuggestion, loading };
};
