const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const env = require("./config/env");

const missingDatabaseError = new Error(
  "Missing database connection. Set DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DATABASE " +
    "(or DATABASE_URL). On Railway you can also link MySQL so MYSQL_* vars are injected.",
);

let prisma;

if (env.databaseUrl) {
  // Prisma 7: runtime connections go through a driver adapter.
  const adapter = new PrismaMariaDb(env.databaseUrl);
  prisma = new PrismaClient({ adapter });
} else {
  console.error(missingDatabaseError.message);

  // Proxy so require() never throws — server can still boot / health-check.
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
