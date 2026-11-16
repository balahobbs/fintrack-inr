import Transaction from '../models/Transaction.js';
import asyncHandler from '../middleware/asyncHandler.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const list = asyncHandler(async (req, res) => {
  const { type, category, search, from, to } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);

  const filter = { user: req.user._id };
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (search) filter.description = { $regex: escapeRegex(String(search)), $options: 'i' };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

export const create = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  const tx = await Transaction.create({ user: req.user._id, type, amount, category, description, date });
  res.status(201).json(tx);
});

export const update = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  const tx = await Transaction.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { type, amount, category, description, date },
    { new: true, runValidators: true }
  );
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  res.json(tx);
});

export const remove = asyncHandler(async (req, res) => {
  const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!tx) return res.status(404).json({ message: 'Transaction not found' });
  res.json({ message: 'Transaction deleted' });
});
