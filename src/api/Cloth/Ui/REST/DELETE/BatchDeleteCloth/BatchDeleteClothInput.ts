// src/api/Cloth/Ui/REST/DELETE/BatchDeleteCloth/BatchDeleteClothInput.ts

/**
 * BatchDeleteClothInput
 *
 * Wejście do batchowego usuwania ubrań.
 * - clothIds: lista ID > 0 (wymagana)
 * - userId: opcjonalne — jeśli chcesz wymusić sprawdzanie właściciela
 *
 * Cała logika walidacji i limitowania (np. max 200 ID)
 * znajduje się w BatchDeleteClothController.
 */
export type BatchDeleteClothInput = {
  clothIds: number[];
  userId?: string;
};
