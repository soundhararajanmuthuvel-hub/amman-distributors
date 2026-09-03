import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl && typeof window === "undefined") {
  console.warn("WARNING: DATABASE_URL environment variable is missing.");
}

// Pool connection for high performance with Aiven SSL support
export const poolConnection = databaseUrl
  ? mysql.createPool({
      uri: databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    })
  : null;

export const db = poolConnection ? drizzle(poolConnection, { schema, mode: "default" }) : null;

export async function closeDbPool() {
  if (poolConnection) {
    console.log("[Aiven MySQL] Closing connection pool...");
    await poolConnection.end();
    console.log("[Aiven MySQL] Connection pool closed.");
  }
}
