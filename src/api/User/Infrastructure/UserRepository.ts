import * as SQLite from "expo-sqlite";
import { User } from "../Domain/User";
import { GetUserDataOutput } from "../Application/Users/GetUserDataOutput";

const db = SQLite.openDatabase("yourwardrobe.db");

// prosta obietnicowa nakładka na tx.executeSql
function exec<T = any>(
  sql: string,
  params: any[] = []
): Promise<SQLite.SQLResultSet> {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, err) => {
          reject(err);
          return true;
        }
      );
    });
  });
}

/**
 * Zwraca listę (0/1) aktywnych userów.
 * Jeśli chcesz konkretną definicję „aktywny”, zawęź WHERE:
 *   WHERE deleted_at IS NULL AND kind = 'guest'
 */
export async function getActiveUser(
  limit = 1,
  offset = 0
): Promise<GetUserDataOutput> {
  const where = `WHERE u.deleted_at IS NULL`;
  const countSql = `SELECT COUNT(*) as cnt FROM users u ${where}`;
  const listSql = `
    SELECT u.id, u.kind, u.email, u.role, u.created_at, u.updated_at, u.deleted_at
    FROM users u
    ${where}
    ORDER BY u.created_at ASC
    LIMIT ? OFFSET ?
  `;

  const countRes = await exec(countSql);
  const total = (countRes.rows.item(0)?.cnt as number) ?? 0;

  const listRes = await exec(listSql, [limit, offset]);
  const data: User[] = [];
  for (let i = 0; i < listRes.rows.length; i++) {
    data.push(listRes.rows.item(i) as User);
  }

  return {
    data,
    pagination: { limit, offset, total },
  };
}
