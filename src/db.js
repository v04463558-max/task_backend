const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const buildUrlFromParts = () => {
  const host = process.env.DB_HOST || process.env.DB_HOSTNAME;
  const user = process.env.DB_USERNAME || process.env.DB_USER;
  const pass = process.env.DB_PASSWORD;
  const name = process.env.DATABASE || process.env.DB_NAME;
  const port = process.env.DB_PORT;
  const protocol = process.env.DB_PROTOCOL || "mysql";

  if (host && user && pass && name) {
    const auth = `${encodeURIComponent(user)}:${encodeURIComponent(pass)}`;
    const hostPort = port ? `${host}:${port}` : host;
    return `${protocol}://${auth}@${hostPort}/${name}`;
  }

  return null;
};

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.RAILWAY_DATABASE_URL ||
  process.env.PRISMA_DATABASE_URL ||
  process.env.MYSQL_URL ||
  buildUrlFromParts();

const missingDatabaseError = new Error(
  "Missing database connection URL. Set DATABASE_URL in Railway environment variables and redeploy. " +
    "If your Railway database uses a different name, also try RAILWAY_DATABASE_URL, PRISMA_DATABASE_URL, MYSQL_URL, or provide DB_HOST/DB_USERNAME/DB_PASSWORD/DATABASE/DB_PORT.",
);

let prisma;
if (databaseUrl) {
  prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
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
