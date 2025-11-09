// src/api/Cloth/Ui/REST/POST/CreateFromPhoto/postCreateFromPhoto.ts
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { CreateFromPhotoInput } from "./CreateFromPhotoInput";
import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { createClothFromPhoto } from "../../../../Application/Services/CreateClothFromPhotoHandler";
import { CreateClothFromPhotoDTO } from "../../../../Application/Commands/CreateFromPhotoDTO";
import { Logger } from "../../../../../Kernel/Logger";

const DEFAULTS = {
  targetDir: FileSystem.documentDirectory + "photos/",
  main: true as boolean,
  allowsEditing: false,
  quality: 0.9,
};

export async function postCreateFromPhoto(input: CreateFromPhotoInput = {}) {
  try {
    // 1) Permissions
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      return Api.error(
        ApiErrorCode.UNAUTHORIZED,
        "Access to the camera is required."
      );
    }

    // 2) Camera
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: DEFAULTS.allowsEditing,
      quality: DEFAULTS.quality,
    });

    if (res.canceled || !res.assets?.[0]?.uri) {
      return Api.error(ApiErrorCode.BAD_REQUEST, "Taking photo was cancelled.");
    }

    const asset = res.assets[0];

    // 3) Command -> handler
    const dto: CreateClothFromPhotoDTO = await createClothFromPhoto({
      srcUri: asset.uri,
      fileName: asset.fileName ?? null,
      mimeType: (asset as any).mimeType ?? null,
      targetDir: DEFAULTS.targetDir,
      forceExt: input.forceExt,
      main: input.main ?? DEFAULTS.main,
    });

    // 4) Success – z komunikatem EN (pasującym do pl.json)
    return Api.ok<CreateClothFromPhotoDTO>(dto, "Photo added to wardrobe.");
  } catch (e: any) {
    Logger.error("CreateFromPhoto", e);
    return Api.error(
      ApiErrorCode.INTERNAL,
      e?.message ?? "Failed to add photo."
    );
  }
}
