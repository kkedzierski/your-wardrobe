import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { ClothFromPhotoDTO } from "../Commands/ClothFromPhotoDTO";
import { CreateClothFromPhotoCommand } from "../Commands/CreateClothFromPhotoCommand";
import { AppException } from "../../../Kernel/AppException";
import { safeB64 } from "../../Infrastructure/safeB64";
import { HashService } from "./HashService";
import { PhotoStorageService } from "./PhotoStorageService";

export class CreateClothFromPhotoHandler {
  static async handle(
    command: CreateClothFromPhotoCommand
  ): Promise<ClothFromPhotoDTO> {
    // 1. Hash
    const sha256 = await HashService.getPhotoHash(command.photo);
    // 2. Photo save
    const fileUri = await PhotoStorageService.savePhoto(command.photo, sha256);
    // 3. (docelowo: zapis rekordu, itd. - tu tylko szkielet DTO, ID zero)
    const now = Date.now();
    return {
      id: 0,
      name: command.name ?? "Nowe ubranie",
      photos: [
        {
          id: 0,
          cloth_id: 0,
          user_id: command.userId,
          file_path: fileUri,
          hash: sha256,
          main: true,
          created_at: now,
          deleted_at: null,
        },
      ],
      ai_suggestions: undefined,
    };
  }
}
