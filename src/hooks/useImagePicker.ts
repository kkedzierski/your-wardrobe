import { useState } from "react";

export const useImagePicker = (initialImages: File[] = []) => {
  const [images, setImages] = useState<File[]>(initialImages);

  const addImage = (file: File) => {
    // Walidacja rozmiaru itp. + dodanie pliku
  };

  const removeImage = (index: number) => {
    // Usunięcie zdjęcia po indeksie
  };

  const setMainImage = (index: number) => {
    // Zmiana głównego zdjęcia
  };

  return { images, addImage, removeImage, setMainImage };
};
