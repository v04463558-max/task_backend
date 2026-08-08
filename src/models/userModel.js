const prisma = require("../db");

const publicSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
};

// Find user ID
function findById(id) {
  return prisma.user.findUnique({
    where: { id: Number(id) },
    select: publicSelect,
  });
}

// Find user by email
function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
  });
}

function create({ name, email, password }) {
  return prisma.user.create({
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password,
    },
  });
}

module.exports = {
  publicSelect,
  findById,
  findByEmail,
  create,
};
