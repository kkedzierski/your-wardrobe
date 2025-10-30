// src/services/validation/validatePhotoInput.ts

import {
  ApiErrorCode,
  ApiResponse,
} from "../../../../../../Kernel/ApiResponse";

export interface ValidatedPhoto {
  blob: Blob;
  mimeType: string;
  size: number;
}

export function validatePhotoInput(
  photo: unknown
): ApiResponse<ValidatedPhoto> {
  if (!photo) {
    return new ApiResponse<ValidatedPhoto>({
      ok: false,
      code: ApiErrorCode.BAD_REQUEST,
      message: "No photo file in the request.",
      logInfo: true,
      customLogMessage: "validatePhotoInput: missing photo blob",
    });
  }

  if (
    typeof photo !== "object" ||
    !(
      photo instanceof Blob ||
      // @ts-ignore RN może nie mieć File, ale web/testy mogą
      photo instanceof File
    )
  ) {
    return new ApiResponse<ValidatedPhoto>({
      ok: false,
      code: ApiErrorCode.BAD_REQUEST,
      message: "Photo must be a File or Blob type.",
      logInfo: true,
      customLogMessage: "validatePhotoInput: invalid photo object",
    });
  }

  // @ts-ignore
  const mimeType = photo.type || "application/octet-stream";
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(mimeType)) {
    return new ApiResponse<ValidatedPhoto>({
      ok: false,
      code: ApiErrorCode.BAD_REQUEST,
      message: "Only JPG or PNG files are accepted.",
    });
  }

  // @ts-ignore
  const size = photo.size ?? 0;
  if (size > 5 * 1024 * 1024) {
    return new ApiResponse<ValidatedPhoto>({
      ok: false,
      code: ApiErrorCode.BAD_REQUEST,
      message: "The photo size limit is 5MB.",
    });
  }

  // happy path
  return new ApiResponse<ValidatedPhoto>({
    ok: true,
    data: {
      blob: photo as Blob,
      mimeType,
      size,
    },
  });
}
