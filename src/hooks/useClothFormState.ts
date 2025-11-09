import { useState } from "react";

type AddClothFromPhotoViewModel = {
  photos: File[];
  mainImageIndex: number; // Dodane pole
  name: string;
  description: string;
  categoryId: number | null;
  tags: number[];
  color: string;
  brand: string;
  season: string;
  location: string;
  aiSuggestions?: any;
};

type ErrorViewModel = {
  field: string;
  message: string;
};

const initialState: AddClothFromPhotoViewModel = {
  photos: [],
  mainImageIndex: 0,
  name: "",
  description: "",
  categoryId: null,
  tags: [],
  color: "",
  brand: "",
  season: "",
  location: "",
  aiSuggestions: undefined,
};

export const useClothFormState = () => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState<ErrorViewModel[]>([]);

  // Obsługa zmiany głównego zdjęcia
  const setMainImageIndex = (idx: number) => {
    setValues((prev) => ({ ...prev, mainImageIndex: idx }));
  };

  const onChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const e: ErrorViewModel[] = [];
    if (!values.photos || values.photos.length === 0)
      e.push({
        field: "photos",
        message: "Wymagane przynajmniej jedno zdjęcie.",
      });
    setErrors(e);
    return e.length === 0;
  };

  return {
    values,
    setValues,
    errors,
    setErrors,
    onChange,
    setMainImageIndex,
    validate,
  };
};
