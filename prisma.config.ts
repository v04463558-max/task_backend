// Prisma CLI config (migrate / generate). Runtime connection uses src/db.js.
import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Same resolution order as src/config/env.js so `prisma migrate deploy`
 * works on Railway when only MYSQL_URL / MYSQLHOST… are injected.
 */
function resolveDatabaseUrl(): string {
  const fromParts = (): string | undefined => {
    const host =
      process.env.MYSQLHOST ||
      process.env.MYSQL_HOST ||
      process.env.DB_HOST ||
      process.env.DB_HOSTNAME;
    const user =
      process.env.MYSQLUSER ||
      process.env.MYSQL_USER ||
      process.env.DB_USERNAME ||
      process.env.DB_USER;
    const pass =
      process.env.MYSQLPASSWORD ??
      process.env.MYSQL_PASSWORD ??
      process.env.DB_PASSWORD;
    const name =
      process.env.MYSQLDATABASE ||
      process.env.MYSQL_DATABASE ||
      process.env.DATABASE ||
      process.env.DB_NAME;
    const port =
      process.env.MYSQLPORT ||
      process.env.MYSQL_PORT ||
      process.env.DB_PORT;

    if (host && user != null && user !== "" && pass != null && name) {
      const auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
      const hostPort = port ? `${host}:${port}` : host;
      return `mysql://${auth}@${hostPort}/${name}`;
    }
    return undefined;
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
