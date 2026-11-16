import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const payload = (user) => ({
  token: sign(user._id),
  user: { id: user._id, name: user.name, email: user.email },
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }
  const user = await User.create({ name, email, password });
  res.status(201).json(payload(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Email or password is incorrect' });
  }
  res.json(payload(user));
});

export const me = (req, res) => {
  const { _id, name, email } = req.user;
  res.json({ user: { id: _id, name, email } });
};
