// api/Cloth/Ui/REST/GET/GetClothesCollectionOutput.ts
export type GetClothesCollectionOutput = {
  items: {
    id: number;
    name: string;
    thumbUrl?: string;
  }[];
};
