const Task = require('../models/Task');
const asyncHandler = require('express-async-handler');

// @desc    Get all user tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const status = req.query.status ? { status: req.query.status } : {};

  const count = await Task.countDocuments({ user: req.user._id, ...keyword, ...status });
  const tasks = await Task.find({ user: req.user._id, ...keyword, ...status })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ tasks, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;

  const task = new Task({
    title,
    description,
    status: status || 'pending',
    user: req.user._id,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task && task.user.toString() === req.user._id.toString()) {
    res.json(task);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;

  const task = await Task.findById(req.params.id);

  if (task && task.user.toString() === req.user._id.toString()) {
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (task && task.user.toString() === req.user._id.toString()) {
    await Task.deleteOne({ _id: task._id });
    res.json({ message: 'Task removed' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
};
