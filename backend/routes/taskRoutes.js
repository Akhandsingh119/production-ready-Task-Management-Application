const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validateTask } = require('../middleware/validator');

router.route('/').get(protect, getTasks).post(protect, validateTask, createTask);
router
  .route('/:id')
  .get(protect, getTaskById)
  .put(protect, validateTask, updateTask)
  .delete(protect, deleteTask);

module.exports = router;
