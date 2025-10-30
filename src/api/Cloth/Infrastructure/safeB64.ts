// Utility: cross-platform base64 encoding for Uint8Array
export const safeB64 = (bytes: Uint8Array): string => {
  if (typeof btoa !== "undefined") {
    return btoa(
      bytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
  }
  try {
    return Buffer.from(bytes).toString("base64");
  } catch (e) {
    throw new Error("Base64 encoding is not supported in this environment.");
  }
};
