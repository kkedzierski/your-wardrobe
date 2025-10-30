import * as FileSystem from "expo-file-system";
import { AppException } from "../../../Kernel/AppException";
import { safeB64 } from "../../Infrastructure/safeB64";

export class PhotoStorageService {
  static getDocDir(): string {
    // Domyślna/lokalna lokalizacja na pliki
    return (
      (FileSystem as any).documentDirectory ||
      (FileSystem as any).cacheDirectory ||
      "./tmp/"
    );
  }

  static async ensurePhotosDir(docDir: string): Promise<string> {
    const photosDir = `${docDir}photos`;
    try {
      // Sprawdź, czy istnieje / utwórz jeśli nie
      // Safari/Expo lub Node może różnić się API - defensywne podejście
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }
    } catch (err) {
      throw new AppException(
        "Unable to create photo directory.",
        "FS_ERROR",
        err
      );
    }
    return photosDir;
  }

  static async savePhoto(blob: Blob, sha256: string): Promise<string> {
    const docDir = this.getDocDir();
    const ext = (blob as any).type === "image/png" ? ".png" : ".jpg";
    const fileName = `photo_${sha256}${ext}`;
    const fileUri = `${docDir}photos/${fileName}`;
    await this.ensurePhotosDir(docDir);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64 = safeB64(uint8Array);
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: "base64",
      });
      return fileUri;
    } catch (err) {
      throw new AppException(
        "Failed to save photo file.",
        "PHOTO_SAVE_ERROR",
        err
      );
    }
  }
}
