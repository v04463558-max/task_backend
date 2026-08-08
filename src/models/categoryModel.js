const prisma = require("../db");

// Get all categories that are not deleted.
function findAll() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { name: "asc" },
  });
}

function findById(id) {
  return prisma.category.findFirst({
    where: { id: Number(id), deletedAt: null },
  });
}

function create(name) {
  return prisma.category.create({
    data: { name: String(name).trim() },
  });
}

function update(id, name) {
  return prisma.category.update({
    where: { id: Number(id) },
    data: { name: String(name).trim() },
  });
}

function softDelete(id) {
  return prisma.category.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  softDelete,
};
