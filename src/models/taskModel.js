// handle HTTP requests or responses directly.
const prisma = require("../db");
// Find a task by ID that belongs to a specific user and is not deleted.
function findOwnedById(id, userId) {
  return prisma.task.findFirst({
    where: { id: Number(id), user_id: userId, deletedAt: null },
    include: { category: true },
  });
}

function count(where) {
  return prisma.task.count({ where });
}
// Find tasks with optional filters, pagination, and sorting.
function findMany({ where, skip, take }) {
  return prisma.task.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    skip,
    take,
  });
}

function create(data) {
  return prisma.task.create({
    data,
    include: { category: true },
  });
}

function update(id, data) {
  return prisma.task.update({
    where: { id: Number(id) },
    data,
    include: { category: true },
  });
}

function softDelete(id) {
  return prisma.task.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });
}

module.exports = {
  findOwnedById,
  count,
  findMany,
  create,
  update,
  softDelete,
};
