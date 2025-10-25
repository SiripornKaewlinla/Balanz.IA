const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
const Category = require('../models/Categories');
const mongoose = require('mongoose');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const resolveCategoryId = async (category, userId) => {
  if (mongoose.Types.ObjectId.isValid(category)) {
    return new mongoose.Types.ObjectId(category);
  }
  const found = await Category.findOne({ name: category, userId });
  return found ? found._id : null;
};

const parseDate = (val) => {
  if (!val) return null;
  const d = val.includes('T') ? new Date(val) : new Date(`${val}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
};

// Create
router.post('/', authMiddleware, async (req, res) => {
  const { amount, type, category, date, notes, image } = req.body || {};
  try {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense' });
    }
    const categoryId = await resolveCategoryId(category, req.user.userId);
    if (!categoryId) return res.status(400).json({ message: 'Category not found' });
    const d = parseDate(date);
    if (!d) return res.status(400).json({ message: 'Invalid date' });

    const created = await Transaction.create({
      userId: req.user.userId,
      amount: parseFloat(amount),
      type,
      category: categoryId,
      date: d,
      notes: notes || '',
      image: typeof image === 'string' ? image : ''
    });
    const populated = await Transaction.findById(created._id).populate('category', 'name icon type');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Read (list) with filters
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { month, from, to, type, category, page, limit } = req.query;
    const q = { userId: req.user.userId };

    if (type && ['income', 'expense'].includes(type)) q.type = type;
    if (category) {
      const cid = await resolveCategoryId(category, req.user.userId);
      if (cid) q.category = cid;
    }
    if (month && /^(\d{4})-(\d{2})$/.test(month)) {
      const [y, m] = month.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const end = new Date(Date.UTC(y, m, 1, 0, 0, 0));
      q.date = { $gte: start, $lt: end };
    } else if (from || to) {
      const s = parseDate(from) || new Date(0);
      const e = parseDate(to) || new Date(8640000000000000);
      q.date = { $gte: s, $lte: e };
    }

    const wantsPagination = page !== undefined || limit !== undefined;
    const pg = Number(page || 1);
    const lm = Number(limit || 1000);
    const skip = (pg - 1) * lm;
    if (wantsPagination) {
      const [items, total] = await Promise.all([
        Transaction.find(q).sort({ date: -1 }).skip(skip).limit(lm).populate('category', 'name icon type'),
        Transaction.countDocuments(q),
      ]);
      return res.json({ items, total, page: pg, limit: lm });
    } else {
      const items = await Transaction.find(q).sort({ date: -1 }).limit(lm).populate('category', 'name icon type');
      return res.json(items);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { amount, type, category, date, notes, image } = req.body || {};
    const update = {};
    if (amount !== undefined) {
      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return res.status(400).json({ message: 'Amount must be a positive number' });
      update.amount = parseFloat(amount);
    }
    if (type) {
      if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Type must be either income or expense' });
      update.type = type;
    }
    if (category) {
      const cid = await resolveCategoryId(category, req.user.userId);
      if (!cid) return res.status(400).json({ message: 'Category not found' });
      update.category = cid;
    }
    if (date) {
      const d = parseDate(date);
      if (!d) return res.status(400).json({ message: 'Invalid date' });
      update.date = d;
    }
    if (notes !== undefined) update.notes = notes;
    if (image !== undefined) update.image = typeof image === 'string' ? image : '';

    const updated = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      update,
      { new: true }
    ).populate('category', 'name icon type');
    if (!updated) return res.status(404).json({ message: 'Transaction not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Delete
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const removed = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!removed) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;
