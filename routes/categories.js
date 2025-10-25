const express = require('express');
const jwt = require('jsonwebtoken');
const Category = require('../models/Categories');
const Transaction = require('../models/Transaction');

const router = express.Router();

// ใช้ JWT_SECRET จาก env แต่มีค่า fallback สำหรับ dev
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

// GET /api/categories — คืนรายการหมวดหมู่ และสร้างค่าเริ่มต้นให้ผู้ใช้ถ้ายังไม่มี
router.get('/', authMiddleware, async (req, res) => {
  try {
    // รายการหมวดหมู่เริ่มต้นแบบปลอดภัย (UTF-8 ปกติ)
    const defaultCategories = [
      // รายรับ
      { name: 'เงินเดือน', icon: '💼', type: 'income' },
      { name: 'โบนัส', icon: '🎁', type: 'income' },
      { name: 'ลงทุน', icon: '📈', type: 'income' },
      { name: 'ของขวัญ', icon: '🎉', type: 'income' },
      { name: 'รายรับอื่นๆ', icon: '➕', type: 'income' },
      // รายจ่าย
      { name: 'อาหาร', icon: '🍚', type: 'expense' },
      { name: 'เดินทาง', icon: '🚌', type: 'expense' },
      { name: 'ชอปปิง', icon: '🛍️', type: 'expense' },
      { name: 'บิล/ค่าสาธารณูปโภค', icon: '📄', type: 'expense' },
      { name: 'สุขภาพ', icon: '🏥', type: 'expense' },
      { name: 'บันเทิง', icon: '🎬', type: 'expense' },
      { name: 'การศึกษา', icon: '📚', type: 'expense' },
      { name: 'ท่องเที่ยว', icon: '✈️', type: 'expense' },
      { name: 'ของใช้จ่ายประจำบ้าน', icon: '🛒', type: 'expense' },
      { name: 'อื่นๆ', icon: '📁', type: 'expense' },
    ];

    // อัปเสิร์ตเพื่อให้มีหมวดพื้นฐานอย่างน้อยหนึ่งชุดสำหรับผู้ใช้คนนี้
    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { name: cat.name, userId: req.user.userId, type: cat.type },
        { name: cat.name, icon: String(cat.icon), type: cat.type, userId: req.user.userId },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const categories = await Category.find({ userId: req.user.userId }).sort({ type: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// POST /api/categories — เพิ่มหมวดหมู่
router.post('/', authMiddleware, async (req, res) => {
  const { name, icon, type } = req.body || {};
  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type ต้องเป็น "income" หรือ "expense"' });
  }
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'ต้องระบุชื่อหมวดหมู่' });
  }
  try {
    const existingCategory = await Category.findOne({ name, userId: req.user.userId, type });
    if (existingCategory) {
      return res.status(400).json({ message: 'มีหมวดหมู่นี้อยู่แล้ว' });
    }
    const category = new Category({
      name,
      icon: icon ? String(icon) : '📁',
      type,
      userId: req.user.userId,
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// DELETE /api/categories/:categoryId — ลบหมวดหมู่ และย้ายธุรกรรมไปที่ "อื่นๆ"
router.delete('/:categoryId', authMiddleware, async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'ไม่พบหมวดหมู่' });
    }
    if (category.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Category.deleteOne({ _id: categoryId });

    // หา/สร้างหมวด "อื่นๆ" ของประเภทเดียวกัน
    let otherCategory = await Category.findOne({ name: 'อื่นๆ', type: category.type, userId: req.user.userId });
    if (!otherCategory) {
      otherCategory = new Category({ name: 'อื่นๆ', icon: '📁', type: category.type, userId: req.user.userId });
      await otherCategory.save();
    }

    // ย้ายธุรกรรมที่อ้างอิงหมวดนี้ไปหมวด "อื่นๆ"
    await Transaction.updateMany(
      { category: category._id, userId: req.user.userId },
      { $set: { category: otherCategory._id } }
    );

    res.json({ message: 'ลบหมวดหมู่แล้ว และย้ายธุรกรรมไปที่ "อื่นๆ"' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

