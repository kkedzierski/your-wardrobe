// src/api/Cloth/Ui/REST/DELETE/DeleteCloth/DeleteClothController.ts
import { Api, ApiErrorCode } from "../../../../../Kernel/ApiResponse";
import { DeleteClothInput } from "./DeleteClothInput";
import { processDeleteCloth } from "../../../../Application/Services/DeleteClothHandler";
import { Logger } from "../../../../../Kernel/Logger";

const M = {
  // EN zdania – tłumaczone po stronie ApiResponse
  UNAUTHORIZED: "Access to the camera is required.", // przyklad (tu raczej nieużyte)
  BAD_INPUT: "Invalid request.",
  NOT_FOUND: "Cloth was not found.",
  FAILED: "Failed to delete cloth.",
  SUCCESS: "Cloth deleted.",
};

export async function deleteCloth(input: DeleteClothInput) {
  try {
    if (!input?.clothId || input.clothId <= 0) {
      return Api.error(ApiErrorCode.BAD_REQUEST, M.BAD_INPUT);
    }

    const { deleted } = await processDeleteCloth({
      clothId: input.clothId,
      userId: input.userId,
    });

    if (!deleted) {
      // Repo zwróciło false → brak rekordu / brak uprawnień / inny soft-fail
      return Api.error(ApiErrorCode.NOT_FOUND, M.NOT_FOUND);
    }

    // Sukces + message (EN; zostanie przetłumaczony do PL na froncie)
    return Api.ok<{ clothId: number }>({ clothId: input.clothId }, M.SUCCESS);
  } catch (e) {
    Logger.error("DeleteClothController error", { error: String(e) });
    return Api.error(ApiErrorCode.INTERNAL, M.FAILED);
  }
}
