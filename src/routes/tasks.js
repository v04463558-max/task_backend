// The route definitions are the entry points for incoming API requests.
const express = require("express");
const taskController = require("../controllers/taskController");

const router = express.Router();

router.get("/", taskController.list);
router.get("/:id", taskController.getById);
router.post("/", taskController.create);
router.put("/:id", taskController.update);
router.delete("/:id", taskController.remove);

module.exports = router;
