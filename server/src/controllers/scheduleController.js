import { ScheduleEvent } from '../models/ScheduleEvent.js';
import { FixedCommitment } from '../models/FixedCommitment.js';
import { DynamicReschedulingService } from '../services/dynamicReschedulingService.js';
import { ConflictDetectionService } from '../services/conflictDetectionService.js';
import { AvailabilityService } from '../services/availabilityService.js';
import { UserPreference } from '../models/UserPreference.js';

export const getScheduleEvents = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (startDate && endDate) {
      filter.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const events = await ScheduleEvent.find(filter).populate('taskId').sort({ startTime: 1 });
    const commitments = await FixedCommitment.find({ userId: req.user._id });

    res.json({
      success: true,
      events,
      commitments,
    });
  } catch (err) {
    next(err);
  }
};

export const runAutoSchedule = async (req, res, next) => {
  try {
    const { startDate, daysAhead = 7 } = req.body;
    const result = await DynamicReschedulingService.rescheduleUserSchedule(
      req.user._id,
      startDate ? new Date(startDate) : new Date(),
      daysAhead
    );

    const updatedEvents = await ScheduleEvent.find({
      userId: req.user._id,
      startTime: { $gte: startDate ? new Date(startDate) : new Date() },
    }).populate('taskId');

    res.json({
      success: true,
      message: 'Intelligent schedule generated successfully',
      result,
      events: updatedEvents,
    });
  } catch (err) {
    next(err);
  }
};

export const updateScheduleEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, isLocked, status } = req.body;

    const event = await ScheduleEvent.findOne({ _id: id, userId: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Schedule event not found' });

    if (startTime && endTime) {
      // Check for conflicts with existing locked events or commitments
      const existingEvents = await ScheduleEvent.find({
        userId: req.user._id,
        _id: { $ne: id },
      });
      const commitments = await FixedCommitment.find({ userId: req.user._id });
      const expandedCommitments = AvailabilityService.expandCommitmentsForDate(commitments, new Date(startTime));

      const conflicts = ConflictDetectionService.findConflicts(
        { startTime, endTime, id },
        [...existingEvents, ...expandedCommitments]
      );

      if (conflicts.length > 0 && req.body.force !== true) {
        return res.status(409).json({
          success: false,
          message: 'Time slot has conflicts',
          conflicts,
        });
      }

      event.startTime = new Date(startTime);
      event.endTime = new Date(endTime);
      event.allocatedMinutes = Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60));
    }

    if (isLocked !== undefined) event.isLocked = isLocked;
    if (status) event.status = status;

    await event.save();
    const populated = await ScheduleEvent.findById(id).populate('taskId');

    res.json({ success: true, event: populated });
  } catch (err) {
    next(err);
  }
};

export const checkConflict = async (req, res, next) => {
  try {
    const { startTime, endTime, eventId } = req.body;
    if (!startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'startTime and endTime are required' });
    }

    const existingEvents = await ScheduleEvent.find({ userId: req.user._id });
    const commitments = await FixedCommitment.find({ userId: req.user._id });
    const expandedCommitments = AvailabilityService.expandCommitmentsForDate(commitments, new Date(startTime));

    const conflicts = ConflictDetectionService.findConflicts(
      { startTime, endTime, id: eventId },
      [...existingEvents, ...expandedCommitments]
    );

    res.json({
      success: true,
      hasConflict: conflicts.length > 0,
      conflicts,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteScheduleEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await ScheduleEvent.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!event) return res.status(404).json({ success: false, message: 'Schedule event not found' });

    res.json({ success: true, message: 'Schedule event removed' });
  } catch (err) {
    next(err);
  }
};
