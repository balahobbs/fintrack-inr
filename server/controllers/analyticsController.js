import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { monthRange, currentMonth } from './budgetController.js';

export const summary = asyncHandler(async (req, res) => {
  const month = req.query.month || currentMonth();
  const { start, end } = monthRange(month);
  const userId = new mongoose.Types.ObjectId(req.user._id);

  // 6-month window ending at the selected month
  const trendStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - 5, 1));

  const [totals, byCategory, trend] = await Promise.all([
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: start, $lt: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { user: userId, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    Transaction.aggregate([
      { $match: { user: userId, date: { $gte: trendStart, $lt: end } } },
      {
        $group: {
          _id: { month: { $dateToString: { format: '%Y-%m', date: '$date' } }, type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const income = totals.find((t) => t._id === 'income')?.total || 0;
  const expense = totals.find((t) => t._id === 'expense')?.total || 0;

  // Fill missing months with zeros so charts have a continuous axis
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(Date.UTC(trendStart.getUTCFullYear(), trendStart.getUTCMonth() + i, 1)).toISOString().slice(0, 7);
    return {
      month: m,
      income: trend.find((t) => t._id.month === m && t._id.type === 'income')?.total || 0,
      expense: trend.find((t) => t._id.month === m && t._id.type === 'expense')?.total || 0,
    };
  });

  res.json({
    month,
    income,
    expense,
    balance: income - expense,
    savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
    byCategory: byCategory.map((c) => ({ category: c._id, total: c.total })),
    monthly,
  });
});
