import { FixedCommitment } from '../models/FixedCommitment.js';
import { DynamicReschedulingService } from '../services/dynamicReschedulingService.js';

export const getCommitments = async (req, res, next) => {
  try {
    const commitments = await FixedCommitment.find({ userId: req.user._id }).sort({ startTime: 1 });
    res.json({ success: true, commitments });
  } catch (err) {
    next(err);
  }
};

export const createCommitment = async (req, res, next) => {
  try {
    const commitment = await FixedCommitment.create({
      ...req.body,
      userId: req.user._id,
    });

    // Auto trigger rescheduling around this new fixed block
    await DynamicReschedulingService.rescheduleUserSchedule(req.user._id);

    res.status(201).json({ success: true, commitment });
  } catch (err) {
    next(err);
  }
};

export const updateCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commitment = await FixedCommitment.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!commitment) return res.status(404).json({ success: false, message: 'Commitment not found' });

    await DynamicReschedulingService.rescheduleUserSchedule(req.user._id);

    res.json({ success: true, commitment });
  } catch (err) {
    next(err);
  }
};

export const deleteCommitment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commitment = await FixedCommitment.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!commitment) return res.status(404).json({ success: false, message: 'Commitment not found' });

    await DynamicReschedulingService.rescheduleUserSchedule(req.user._id);

    res.json({ success: true, message: 'Commitment deleted successfully' });
  } catch (err) {
    next(err);
  }
};
