import * as Crypto from "expo-crypto";
import { AppException } from "../../../Kernel/AppException";

export class HashService {
  static async getPhotoHash(blob: Blob): Promise<string> {
    try {
      const buf = await blob.arrayBuffer();
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        String.fromCharCode.apply(null, Array.from(new Uint8Array(buf))),
        { encoding: Crypto.CryptoEncoding.HEX }
      );
    } catch (err) {
      throw new AppException(
        "Could not generate file hash.",
        "HASH_ERROR",
        err
      );
    }
  }
}
