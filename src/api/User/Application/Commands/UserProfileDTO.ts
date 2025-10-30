import { User } from "../../Domain/User";
export interface UserProfileDTO
  extends Pick<User, "id" | "email" | "created_at" | "updated_at"> {}
