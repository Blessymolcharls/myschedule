import { Task } from '../models/Task.js';
import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { DynamicReschedulingService } from '../services/dynamicReschedulingService.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, categoryId, search } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (categoryId) filter.categoryId = categoryId;
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(filter).populate('categoryId').sort({ deadline: 1, priority: -1, createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      ...req.body,
      userId: req.user._id,
    });
    const populated = await Task.findById(task._id).populate('categoryId');
    res.status(201).json({ success: true, task: populated });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, userId: req.user._id }).populate('categoryId');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    ).populate('categoryId');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // If status changed to completed, invoke handler
    if (req.body.status === 'completed' && !task.completedAt) {
      await DynamicReschedulingService.handleTaskCompleted(req.user._id, id);
    }

    res.json({ success: true, task });
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await DynamicReschedulingService.handleTaskCompleted(req.user._id, id);
    const task = await Task.findById(id).populate('categoryId');
    res.json({ success: true, task, reschedulingResult: result });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    // Clean up associated schedule events
    await ScheduleEvent.deleteMany({ taskId: id, userId: req.user._id });

    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
