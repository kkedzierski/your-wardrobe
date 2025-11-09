import { ClothFromPhotoDTO } from "../api/Cloth/Application/Commands/ClothFromPhotoDTO";

// Minimalna implementacja funkcji API do POSTowania formularza cloth
export async function createClothFromPhoto(
  form: any
): Promise<ClothFromPhotoDTO> {
  // form zawiera wszystkie wartości z formularza
  const data = new FormData();
  (form.photos || []).forEach((photo: File) => data.append("photo[]", photo));
  if (form.name) data.append("name", form.name);
  if (form.description) data.append("description", form.description);
  if (form.categoryId) data.append("category_id", form.categoryId);
  if (form.color) data.append("color", form.color);
  if (form.brand) data.append("brand", form.brand);
  if (form.season) data.append("season", form.season);
  if (form.location) data.append("location", form.location);
  if (form.tags && form.tags.length)
    form.tags.forEach((tagId: number) =>
      data.append("tags[]", tagId.toString())
    );
  if (form.aiSuggestions) data.append("ai_suggestions", "1");

  // TODO: Dodanie obsługi autoryzacji/tokenu jeśli wymagane
  const res = await fetch("/api/clothes/from-photo", {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("Błąd przesyłania formularza: " + res.status);
  return res.json();
}
