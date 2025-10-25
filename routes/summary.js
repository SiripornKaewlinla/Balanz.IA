const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Categories');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// GET /api/summary
// Returns totals, monthly charts (last 6 months), and totals by category
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Totals by type
    const totalsAgg = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const incomeTotal = totalsAgg.find(t => t._id === 'income')?.total || 0;
    const expenseTotal = totalsAgg.find(t => t._id === 'expense')?.total || 0;

    // Last 6 months labels
    const labels = [];
    const monthBounds = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1, 0, 0, 0));
      const start = new Date(d);
      const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0));
      labels.push(start.toLocaleString('th-TH', { month: 'short', year: '2-digit' }));
      monthBounds.push({ start, end });
    }

    // Monthly income/expense for last 6 months
    const monthlyAgg = await Transaction.aggregate([
      { $match: { userId, date: { $gte: monthBounds[0].start, $lt: monthBounds[5].end } } },
      {
        $group: {
          _id: {
            y: { $year: { $toDate: '$date' } },
            m: { $month: { $toDate: '$date' } },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income = Array(labels.length).fill(0);
    const expense = Array(labels.length).fill(0);
    monthlyAgg.forEach(row => {
      // Map back to index in labels by matching year/month
      for (let i = 0; i < monthBounds.length; i++) {
        const s = monthBounds[i].start;
        if (s.getUTCFullYear() === row._id.y && (s.getUTCMonth() + 1) === row._id.m) {
          if (row._id.type === 'income') income[i] = row.total;
          else if (row._id.type === 'expense') expense[i] = row.total;
          break;
        }
      }
    });

    // Totals by category (join to get names/types)
    const byCategoryAgg = await Transaction.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: Category.collection.name,
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          total: 1,
          name: { $ifNull: ['$category.name', 'Unknown'] },
          type: { $ifNull: ['$category.type', 'expense'] },
        },
      },
    ]);

    return res.json({
      totals: {
        incomeTotal,
        expenseTotal,
        net: incomeTotal - expenseTotal,
      },
      monthly: { labels, income, expense },
      byCategory: byCategoryAgg,
    });
  } catch (err) {
    console.error('Summary error:', err);
    return res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;

