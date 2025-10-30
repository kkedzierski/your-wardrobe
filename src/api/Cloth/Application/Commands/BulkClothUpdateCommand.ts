export interface BulkClothUpdateCommand {
  item_ids: number[];
  attribute: "category_id" | "color" | "brand" | "season" | "location";
  value: string | number;
}
