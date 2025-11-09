import { AllowedExt } from "../../Infrastructure/AllowedExt";

export interface CreateClothFromPhotoCommand {
  srcUri: string;
  fileName: string | null;
  mimeType: string | null;
  targetDir: string;
  forceExt?: AllowedExt;
  main: boolean; // w komendzie już bez ? – handler ma dostać pełne dane
}
