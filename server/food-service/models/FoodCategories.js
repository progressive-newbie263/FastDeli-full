const { foodPool } = require('../config/db');

class FoodCategory {
  static async getAll() {
    const result = await foodPool.query(`SELECT * FROM food_categories ORDER BY category_id`);
    return result.rows;
  }
}

module.exports = FoodCategory;