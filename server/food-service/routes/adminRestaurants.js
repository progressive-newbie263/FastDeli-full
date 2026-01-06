const express = require('express');
const router = express.Router();
const AdminRestaurantController = require('../controllers/admin-restaurantController');
// const { verifyToken, isAdmin } = require('../middleware/auth'); // Uncomment khi có auth

/* note:
  - Tạm thời bỏ qua validation cho các api này..
  - Cải thiện sau trong tương lai gần.
*/

/* API Admin Restaurants
  * 1. GET http://localhost:5001/api/admin/restaurants/statistics.
      - Lấy thống kê (đặt trước :id route)
      - response: trả về "active_count", "inactive_count", "pending_count", "rejected_count", ...
  
  * 2. GET /api/admin/restaurants - Lấy danh sách với phân trang
      - note: chưa làm 'total_foods'. 
  * 3. GET /api/admin/restaurants/:id - Lấy chi tiết nhà hàng
      - tạm thời hoàn chỉnh.
  * 4. PATCH /api/admin/restaurants/:id/status - Cập nhật trạng thái
  
  * 5. POST /api/admin/restaurants/:id/approve - Phê duyệt nhà hàng
  
  * 6. POST /api/admin/restaurants/:id/reject - Từ chối nhà hàng
*/

router.get('/statistics', AdminRestaurantController.getStatistics); // 1. get statistics
router.get('/', AdminRestaurantController.getAllRestaurants); // 2, get all with pagination
router.get('/:id', AdminRestaurantController.getRestaurantById); // 3. get restaurant by id
router.get('/:id/foods', AdminRestaurantController.getFoodsByRestaurantId); 
router.patch('/:id/status', AdminRestaurantController.updateStatus); // 4. update status
router.post('/:id/approve', AdminRestaurantController.approveRestaurant); // 5. approve restaurant
router.post('/:id/reject', AdminRestaurantController.rejectRestaurant); // 6. reject restaurant


module.exports = router;