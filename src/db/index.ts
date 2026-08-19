import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && typeof window === "undefined") {
  console.warn("WARNING: DATABASE_URL environment variable is missing.");
}

// Pool connection for high performance
export const poolConnection = databaseUrl ? mysql.createPool(databaseUrl) : null;

export const db = poolConnection ? drizzle(poolConnection, { schema, mode: "default" }) : null;
