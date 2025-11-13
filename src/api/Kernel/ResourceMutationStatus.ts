export const ResourceMutationStatus = {
  SUCCESS: "success",
  NOT_FOUND: "not_found",
  IN_USE: "in_use", // nie można usunąć, bo powiązania
  VALIDATION_ERROR: "validation_error",
  FORBIDDEN: "forbidden",
  CONFLICT: "conflict", // np. duplikat
} as const;

export type ResourceMutationStatus =
  (typeof ResourceMutationStatus)[keyof typeof ResourceMutationStatus];
