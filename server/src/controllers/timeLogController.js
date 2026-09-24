import { TimeTrackingService } from '../services/timeTrackingService.js';
import { TimeLog } from '../models/TimeLog.js';

export const startTimer = async (req, res, next) => {
  try {
    const { taskId, scheduleEventId, notes } = req.body;
    if (!taskId) return res.status(400).json({ success: false, message: 'taskId is required' });

    const session = await TimeTrackingService.startSession(req.user._id, {
      taskId,
      scheduleEventId,
      notes,
    });

    const populated = await TimeLog.findById(session._id).populate('taskId');
    res.status(201).json({ success: true, session: populated });
  } catch (err) {
    next(err);
  }
};

export const stopTimer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { markCompleted } = req.body;

    const result = await TimeTrackingService.stopSession(req.user._id, id, markCompleted);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getActiveTimer = async (req, res, next) => {
  try {
    const active = await TimeTrackingService.getActiveSession(req.user._id);
    res.json({ success: true, activeSession: active });
  } catch (err) {
    next(err);
  }
};

export const logManualTime = async (req, res, next) => {
  try {
    const timeLog = await TimeTrackingService.logManualTime(req.user._id, req.body);
    res.status(201).json({ success: true, timeLog });
  } catch (err) {
    next(err);
  }
};

export const getTimeLogs = async (req, res, next) => {
  try {
    const { taskId, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (taskId) filter.taskId = taskId;
    if (startDate && endDate) {
      filter.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const logs = await TimeLog.find(filter).populate('taskId').sort({ startTime: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};
