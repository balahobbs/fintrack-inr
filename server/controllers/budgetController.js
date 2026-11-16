import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const monthRange = (month) => {
  const [y, m] = month.split('-').map(Number);
  return { start: new Date(Date.UTC(y, m - 1, 1)), end: new Date(Date.UTC(y, m, 1)) };
};

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const list = asyncHandler(async (req, res) => {
  const month = req.query.month || currentMonth();
  const { start, end } = monthRange(month);
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const [budgets, spent] = await Promise.all([
    Budget.find({ user: userId, month }).sort({ category: 1 }).lean(),
    Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
    ]),
  ]);
  const spentMap = Object.fromEntries(spent.map((s) => [s._id, s.total]));
  res.json(budgets.map((b) => ({ ...b, spent: spentMap[b.category] || 0 })));
});

// Create or update the budget for a category in a month
export const upsert = asyncHandler(async (req, res) => {
  const { category, limit, month } = req.body;
  const budget = await Budget.findOneAndUpdate(
    { user: req.user._id, category, month },
    { limit },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(budget);
});

export const remove = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!budget) return res.status(404).json({ message: 'Budget not found' });
  res.json({ message: 'Budget deleted' });
});
