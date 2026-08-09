const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
require("dotenv").config();

/**
 * Build a mysql:// URL from discrete env vars.
 * Covers Railway MySQL plugin vars (MYSQLHOST, …) and common DB_* aliases.
 */
function buildUrlFromParts() {
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
  const protocol = process.env.DB_PROTOCOL || "mysql";

  if (host && user != null && user !== "" && pass != null && name) {
    const auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
    const hostPort = port ? `${host}:${port}` : host;
    return `${protocol}://${auth}@${hostPort}/${name}`;
  }

  return null;
}

function resolveDatabaseUrl() {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.MYSQL_URL,
    process.env.MYSQL_PRIVATE_URL,
    process.env.MYSQL_PUBLIC_URL,
    process.env.RAILWAY_DATABASE_URL,
    process.env.PRISMA_DATABASE_URL,
    buildUrlFromParts(),
  ];

  for (const value of candidates) {
    if (value == null) continue;
    const trimmed = String(value).trim();
    if (trimmed) return trimmed;
  }

  return null;
}

const databaseUrl = resolveDatabaseUrl();

const missingDatabaseError = new Error(
  "Missing database connection URL. Set DATABASE_URL in Railway environment variables and redeploy. " +
    "If your Railway database uses a different name, also try MYSQL_URL, RAILWAY_DATABASE_URL, PRISMA_DATABASE_URL, " +
    "or provide MYSQLHOST/MYSQLUSER/MYSQLPASSWORD/MYSQLDATABASE (or DB_HOST/DB_USERNAME/DB_PASSWORD/DATABASE/DB_PORT).",
);

let prisma;
if (databaseUrl) {
  // Prisma 7 no longer accepts `datasources` on the client constructor.
  // Runtime connections go through a driver adapter.
  const adapter = new PrismaMariaDb(databaseUrl);
  prisma = new PrismaClient({ adapter });
} else {
  console.error(missingDatabaseError.message);

  const createMissingDbProxy = () =>
    new Proxy(() => Promise.reject(missingDatabaseError), {
      apply() {
        return Promise.reject(missingDatabaseError);
      },
      get() {
        return createMissingDbProxy();
      },
    });

  prisma = createMissingDbProxy();
}

module.exports = prisma;
