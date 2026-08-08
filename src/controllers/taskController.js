// Controller layer: handles HTTP requests, validates input, invokes model operations,
// and sends back JSON responses. Controllers contain the app logic for each route.
const categoryModel = require("../models/categoryModel");
const taskModel = require("../models/taskModel");
const { taskResponse, taskListResponse } = require("../views/taskView");

const STATUSES = new Set(["in_progress", "completed"]);

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeTaskInput(body, partial = false) {
  const errors = [];
  const data = {};

  if (!partial || body.title !== undefined) {
    const title = String(body.title || "").trim();
    if (!title) errors.push("Title is required");
    else data.title = title;
  }

  if (body.description !== undefined) {
    data.description =
      body.description === null ? null : String(body.description).trim();
  }

  if (body.status !== undefined) {
    if (!STATUSES.has(body.status))
      errors.push("Status must be in_progress or completed");
    else data.status = body.status;
  }

  if (body.due_date !== undefined) {
    if (!partial) {
      // create: due_date is required
      if (!body.due_date) {
        errors.push("Due date is required");
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.due_date))) {
        errors.push("Due date must use YYYY-MM-DD");
      } else {
        const dateObj = new Date(`${body.due_date}T00:00:00.000Z`);
        // compare against today's date (UTC midnight) to prevent past dates
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (dateObj < today) {
          errors.push("Due date cannot be in the past");
        } else {
          data.due_date = dateObj;
        }
      }
    } else {
      // partial update: explicit null/empty is not allowed
      if (!body.due_date) {
        errors.push("Due date cannot be null");
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.due_date))) {
        errors.push("Due date must use YYYY-MM-DD");
      } else {
        const dateObj = new Date(`${body.due_date}T00:00:00.000Z`);
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        if (dateObj < today) {
          errors.push("Due date cannot be in the past");
        } else {
          data.due_date = dateObj;
        }
      }
    }
  }

  if (!partial || body.category_id !== undefined) {
    const categoryId = Number(body.category_id);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      errors.push("Category id is required");
    } else {
      data.category_id = categoryId;
    }
  }

  return { data, errors };
}

// Controller action for GET /api/tasks
// - reads query params
// - validates filters
// - asks the model for tasks
// - returns formatted JSON through the view helper
async function list(req, res, next) {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    // default limit 10 and hard-cap at 10 to enforce small pages for UI/mobile
    const limit = Math.min(parsePositiveInt(req.query.limit, 10), 10);
    const where = { user_id: req.user.id, deletedAt: null };

    if (req.query.status) {
      if (!STATUSES.has(req.query.status)) {
        return res.status(400).json({ message: "Invalid status filter" });
      }
      where.status = req.query.status;
    }

    if (req.query.category_id) {
      const categoryId = Number(req.query.category_id);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({ message: "Invalid category_id filter" });
      }
      where.category_id = categoryId;
    }

    if (req.query.search) {
      where.title = { contains: String(req.query.search) };
    }

    const [total, tasks] = await Promise.all([
      taskModel.count(where),
      taskModel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return res.json(
      taskListResponse(tasks, {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      }),
    );
  } catch (error) {
    return next(error);
  }
}

// Controller action for GET /api/tasks/:id
// - parses the task id
// - checks ownership with the model
// - returns a single task response
async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ message: "Invalid task id" });

    const task = await taskModel.findOwnedById(id, req.user.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    return res.json(taskResponse(task));
  } catch (error) {
    return next(error);
  }
}

// Controller action for POST /api/tasks
// - validates the request body
// - checks that the category exists
// - creates the task with the model
// - returns the created task
async function create(req, res, next) {
  try {
    const { data, errors } = normalizeTaskInput(req.body);
    if (errors.length)
      return res.status(400).json({ message: "Validation failed", errors });

    const category = await categoryModel.findById(data.category_id);
    if (!category)
      return res.status(400).json({ message: "Category does not exist" });

    const task = await taskModel.create({ ...data, user_id: req.user.id });
    return res.status(201).json(taskResponse(task));
  } catch (error) {
    return next(error);
  }
}

// Controller action for PUT /api/tasks/:id
// - validates the provided task id
// - loads the existing task for authorization
// - validates partial update input
// - updates the task through the model
async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ message: "Invalid task id" });

    const existing = await taskModel.findOwnedById(id, req.user.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const { data, errors } = normalizeTaskInput(req.body, true);
    if (errors.length)
      return res.status(400).json({ message: "Validation failed", errors });

    if (data.category_id) {
      const category = await categoryModel.findById(data.category_id);
      if (!category)
        return res.status(400).json({ message: "Category does not exist" });
    }

    const task = await taskModel.update(id, data);
    return res.json(taskResponse(task));
  } catch (error) {
    return next(error);
  }
}

// Controller action for DELETE /api/tasks/:id
// - validates the task id
// - confirms the task belongs to the user
// - performs a soft delete via the model
async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ message: "Invalid task id" });

    const existing = await taskModel.findOwnedById(id, req.user.id);
    if (!existing) return res.status(404).json({ message: "Task not found" });

    const task = await taskModel.softDelete(id);
    return res.json({ message: "Task deleted", data: task });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
