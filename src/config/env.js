const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 4000,
  jwtSecret: process.env.JWT_SECRET || "change-this-secret-in-production",
  jwtExpiresInSeconds:
    Number(process.env.JWT_EXPIRES_IN_SECONDS) || 60 * 60 * 24 * 7,
};

module.exports = env;
