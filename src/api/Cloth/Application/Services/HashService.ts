import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";

export async function hashFileSha256Base64(fileUri: string) {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, base64);
}
