const FoodCategory = require('../models/FoodCategories');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await FoodCategory.getAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách danh mục' });
  }
};
