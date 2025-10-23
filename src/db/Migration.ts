export type MigrationResult = {
  success: boolean;
  error?: string;
};

export class Migration {
  id: string;
  sql: string;

  constructor(id: string, sql: string) {
    this.id = id;
    this.sql = sql;
  }
}
