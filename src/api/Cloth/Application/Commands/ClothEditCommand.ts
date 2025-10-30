import { Cloth } from "../../Domain/Cloth";
export type ClothEditCommand = Partial<
  Omit<Cloth, "id" | "user_id" | "created_at" | "updated_at" | "deleted_at">
>;
