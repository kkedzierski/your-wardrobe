import { AllowedExt } from "../../Infrastructure/AllowedExt";

/** Co zwraca handler (DTO do Api.ok) */
export interface CreateClothFromPhotoDTO {
  clothId: number | string;
  destUri: string;
  hash: string;
  ext: AllowedExt;
}
