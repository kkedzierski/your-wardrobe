import * as FileSystem from "expo-file-system/legacy";
import { AllowedExt } from "../../Infrastructure/AllowedExt";

type SaveImageParams = {
  srcUri: string;
  targetDir: string;
  hash: string;
  fileName?: string;
  mimeType?: string;
  forceExt?: AllowedExt;
};

export async function saveImage(p: SaveImageParams) {
  const ext = (p.forceExt ?? detectExt(p)).toLowerCase() as AllowedExt;

  await FileSystem.makeDirectoryAsync(p.targetDir, {
    intermediates: true,
  }).catch(() => {});
  const destUri = `${p.targetDir}${p.hash}.${ext}`;
  const destInfo = await FileSystem.getInfoAsync(destUri);

  if (!destInfo.exists) {
    await FileSystem.copyAsync({ from: p.srcUri, to: destUri });
  }
  return { destUri, ext };
}

function detectExt(p: SaveImageParams): AllowedExt {
  const fromName = p.fileName?.split(".").pop()?.toLowerCase();
  if (fromName && isAllowed(fromName)) return fromName as AllowedExt;

  const fromMime = p.mimeType?.split("/").pop()?.toLowerCase();
  if (fromMime && isAllowed(fromMime)) return fromMime as AllowedExt;

  return "jpg" as AllowedExt;
}

function isAllowed(x: string) {
  return ["jpg", "jpeg", "png", "webp"].includes(x);
}
