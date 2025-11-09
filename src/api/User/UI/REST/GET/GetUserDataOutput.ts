import { User } from "../../../Domain/User";

export interface GetUserOutput {
  data: User | null;
}
