import { AllowedExt } from "../../../../Infrastructure/AllowedExt";

export interface CreateFromPhotoInput {
  forceExt?: AllowedExt; // np. wymuś "jpg"
  main?: boolean; // czy oznaczyć jako główne zdjęcie (domyślnie true)
}
