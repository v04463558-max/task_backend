// Prisma CLI config (migrate / generate). Runtime connection uses src/db.js.
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Same resolution as src/config/env.js so `prisma migrate deploy`
 * works with DB_* vars locally and on Railway.
 */
function resolveDatabaseUrl(): string {
  const fromParts = (): string | undefined => {
    const host =
      process.env.DB_HOST ||
      process.env.MYSQLHOST ||
      process.env.MYSQL_HOST ||
      process.env.DB_HOSTNAME ||
      "localhost";
    const user =
      process.env.DB_USERNAME ||
      process.env.DB_USER ||
      process.env.MYSQLUSER ||
      process.env.MYSQL_USER ||
      "";
    const pass =
      process.env.DB_PASSWORD ??
      process.env.MYSQLPASSWORD ??
      process.env.MYSQL_PASSWORD ??
      "";
    const name =
      process.env.DATABASE ||
      process.env.DB_NAME ||
      process.env.MYSQLDATABASE ||
      process.env.MYSQL_DATABASE ||
      "";
    const port =
      process.env.DB_PORT ||
      process.env.MYSQLPORT ||
      process.env.MYSQL_PORT ||
      "3306";

    if (!user || !name) return undefined;

    const auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
    const hostPort = port ? `${host}:${port}` : host;
    return `mysql://${auth}@${hostPort}/${name}`;
  };

  const value =
    process.env.DATABASE_URL ||
    process.env.MYSQL_URL ||
    process.env.MYSQL_PRIVATE_URL ||
    process.env.MYSQL_PUBLIC_URL ||
    process.env.RAILWAY_DATABASE_URL ||
    process.env.PRISMA_DATABASE_URL ||
    fromParts();

  return value?.trim() || "";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: resolveDatabaseUrl(),
  },
});
