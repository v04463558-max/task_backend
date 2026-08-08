const categoryModel = require('../models/categoryModel');

async function list(req, res, next) {
  try {
    const categories = await categoryModel.findAll();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Validation failed', errors: ['Name is required'] });
    }

    const category = await categoryModel.create(name);
    return res.status(201).json({ data: category });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const existing = await categoryModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Validation failed', errors: ['Name is required'] });
    }

    const category = await categoryModel.update(id, name);
    return res.json({ data: category });
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const existing = await categoryModel.findById(id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    const category = await categoryModel.softDelete(id);
    return res.json({ message: 'Category deleted', data: category });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
};
