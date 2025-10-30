export interface PhotoCreateCommand {
  file: File | Blob; // FormData upload
  hash?: string;
  main?: boolean;
}
