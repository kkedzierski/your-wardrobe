import { Cloth } from "../../../Domain/Cloth";

export interface GetClothesOutput {
  data: Cloth[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}
