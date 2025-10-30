export interface HistoryChange {
  id: number;
  user_id: number;
  entity_type: string;
  entity_id: number;
  operation: string;
  timestamp: number;
}
