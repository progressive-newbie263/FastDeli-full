# Supplier Portal - Trang quản lý cho Nhà hàng đối tác

## Tổng quan

Supplier Portal là một hệ thống quản lý đầy đủ cho các nhà hàng đối tác trên nền tảng FastDeli. Tương tự như trang quản lý của GrabFood cho merchant, portal này cung cấp đầy đủ các tính năng cần thiết để điều hành nhà hàng trực tuyến.

## Các trang đã hoàn thiện

### 1. 🏠 Dashboard (`/supplier/dashboard`)
- **Mô tả**: Trang tổng quan hiển thị các chỉ số quan trọng
- **Tính năng**:
  - Thống kê doanh thu (tổng và hôm nay)
  - Số lượng đơn hàng (tổng, hôm nay, chờ xác nhận)
  - Số lượng món ăn (tổng và đang bán)
  - Đánh giá trung bình
  - Thông báo đơn hàng chờ xác nhận
  - Danh sách đơn hàng gần đây
  - Quick actions (đơn chờ, quản lý menu, cài đặt)

### 2. 📦 Orders (`/supplier/orders`)
- **Mô tả**: Quản lý tất cả đơn hàng từ khách hàng
- **Tính năng**:
  - Xem danh sách đơn hàng với phân trang
  - Lọc theo trạng thái (pending, processing, delivering, delivered, cancelled)
  - Tìm kiếm theo mã đơn, tên khách hàng, SĐT
  - Cập nhật trạng thái đơn hàng (xác nhận, từ chối, chuẩn bị, giao)
  - Modal chi tiết đơn hàng đầy đủ
  - Quick actions cho từng trạng thái

### 3. 🍽️ Menu (`/supplier/menu`)
- **Mô tả**: Quản lý thực đơn và món ăn
- **Tính năng**:
  - Xem danh sách món ăn dạng grid với hình ảnh
  - Tìm kiếm món ăn
  - Thêm món ăn mới (modal form)
  - Sửa thông tin món ăn (modal form)
  - Xóa món ăn
  - Bật/tắt trạng thái bán (toggle availability)
  - Hiển thị giá, danh mục, mô tả
  - Upload hình ảnh món ăn (URL)

### 4. 📊 Analytics (`/supplier/analytics`)
- **Mô tả**: Phân tích và báo cáo chi tiết
- **Tính năng**:
  - Chọn khoảng thời gian (7/14/30 ngày)
  - Thống kê doanh thu với biểu đồ
  - Tổng đơn hàng và xu hướng
  - Giá trị đơn trung bình
  - Performance score
  - Biểu đồ doanh thu theo ngày (bar chart)
  - Giờ cao điểm (peak hours)
  - Top món ăn bán chạy

### 5. ⭐ Reviews (`/supplier/reviews`)
- **Mô tả**: Xem đánh giá từ khách hàng
- **Tính năng**:
  - Tổng quan đánh giá (rating trung bình, tổng số)
  - Phân bố rating (1-5 sao) với biểu đồ
  - Lọc theo số sao
  - Danh sách đánh giá chi tiết
  - Hiển thị thông tin khách hàng
  - Ngày đánh giá
  - Nội dung comment
  - Tên món ăn được đánh giá (nếu có)

### 6. 👤 Profile (`/supplier/profile`)
- Bỏ

### 7. ⚙️ Settings (`/supplier/settings`)
- **Mô tả**: Cài đặt tổng quát cho nhà hàng
- **Tính năng**:
  - Tương tự Profile nhưng có thêm:
  - Tọa độ GPS (latitude, longitude)
  - Hiển thị trạng thái nhà hàng (active/pending/rejected)
  - Reset form về giá trị ban đầu

### 8. 🔐 Login (`/supplier/login`)
- **Mô tả**: Trang đăng nhập dành cho restaurant owners
- **Tính năng**:
  - Form đăng nhập với email/password
  - Validation
  - JWT authentication
  - Redirect về dashboard sau khi login thành công

## Components được sử dụng

### Layout & Structure
- `SupplierLayout.tsx` - Layout chính với header, main content area, footer
- `SupplierHeader.tsx` - Navigation bar với menu items, user info, logout
- `ProtectedRoute` - Tự động redirect nếu chưa authenticated

### UI Components
- `Modal.tsx` - Modal component tái sử dụng
- `EmptyState.tsx` - Hiển thị khi không có dữ liệu
- `LoadingSpinner.tsx` - Loading state
- `StatsCard.tsx` - Card hiển thị thống kê
- `StatusBadge.tsx` - Badge cho trạng thái đơn hàng

## Context & State Management

### SupplierAuthContext
- Quản lý authentication state
- User và Restaurant data
- Login/Logout functions
- Auto-refresh restaurant data
- Loading states

## API Integration

### SupplierAPI (`lib/api.ts`)
Tất cả các API calls đều được tổ chức trong class SupplierAPI:

**Authentication:**
- `login(email, password)` - Đăng nhập
- `getProfile()` - Lấy thông tin user
- `clearAuth()` - Clear token khi logout

**Restaurant:**
- `getMyRestaurant()` - Lấy thông tin nhà hàng
- `updateRestaurant(id, data)` - Cập nhật thông tin

**Foods/Menu:**
- `getMyFoods(restaurantId, page, limit)` - Danh sách món ăn
- `createFood(restaurantId, data)` - Tạo món mới
- `updateFood(foodId, data)` - Cập nhật món
- `deleteFood(foodId)` - Xóa món
- `toggleFoodAvailability(foodId, status)` - Bật/tắt món

**Orders:**
- `getMyOrders(restaurantId, page, limit, status)` - Danh sách đơn hàng
- `getOrderById(orderId)` - Chi tiết đơn hàng
- `updateOrderStatus(orderId, status)` - Cập nhật trạng thái

**Statistics & Analytics:**
- `getStatistics(restaurantId)` - Thống kê tổng quan
- `getRevenueChart(restaurantId, days)` - Dữ liệu biểu đồ

**Reviews:**
- `getReviews(restaurantId, page, limit)` - Danh sách đánh giá

**Categories:**
- `getCategories()` - Danh sách danh mục món ăn

## Types & Interfaces

Tất cả types được định nghĩa trong `types/index.ts`:
- `Restaurant` - Thông tin nhà hàng
- `Food` - Món ăn
- `Order` - Đơn hàng
- `OrderItem` - Item trong đơn hàng
- `SupplierStats` - Thống kê
- `Review` - Đánh giá
- `FoodCategory` - Danh mục
- `ApiResponse<T>` - Response format

## Styling

- **Framework**: TailwindCSS
- **Icons**: Lucide React
- **Design System**: 
  - Primary color: Orange (#F97316)
  - Neutral: Gray scale
  - Success: Green
  - Error: Red
  - Warning: Yellow

## Navigation Structure

```
/supplier
├── /login              - Trang đăng nhập
├── /dashboard          - Tổng quan
├── /orders             - Quản lý đơn hàng
├── /menu               - Quản lý thực đơn
├── /analytics          - Phân tích & báo cáo
├── /reviews            - Đánh giá từ khách hàng
├── /profile            - Thông tin nhà hàng
└── /settings           - Cài đặt
```

## Backend Requirements

Các API endpoints cần có từ backend:

### Food Service (port 5001)
```
GET    /api/supplier/my-restaurant
PATCH  /api/supplier/restaurants/:id
GET    /api/supplier/restaurants/:id/statistics
GET    /api/supplier/restaurants/:id/orders
GET    /api/supplier/restaurants/:id/foods
POST   /api/supplier/restaurants/:id/foods
PATCH  /api/supplier/foods/:id
DELETE /api/supplier/foods/:id
PATCH  /api/supplier/foods/:id/availability
GET    /api/supplier/orders/:id
PATCH  /api/supplier/orders/:id/status
GET    /api/supplier/restaurants/:id/reviews
GET    /api/categories
```

### Auth Service (port 5000)
```
POST   /api/auth/login
GET    /api/auth/profile
```

## Environment Variables

```env
NEXT_PUBLIC_AUTH_API_URL=http://localhost:5000
NEXT_PUBLIC_FOOD_API_URL=http://localhost:5001
```

## Features Highlights

- Fully responsive design (mobile, tablet, desktop)
- Real-time order notifications
- Image preview for foods and restaurant
- Search and filter functionality
- Modal forms for CRUD operations
- Loading states and error handling
- Protected routes with authentication
- Optimistic UI updates
- Currency formatting (VNĐ)
- Date/time formatting (Vietnamese locale)
- Status badges with color coding
- Quick actions for common tasks
- Charts and data visualization

## Future Enhancements

Các tính năng có thể thêm sau:
- [ ] Real-time notifications (WebSocket)
- [ ] Push notifications
- [ ] Export reports (PDF/Excel)
- [ ] Advanced analytics (revenue forecast)
- [ ] Coupons & discounts management
- [ ] Opening hours scheduler
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Image upload (not just URL)
- [ ] Bulk operations for foods
- [ ] Customer chat/messaging

---

**Developed for FastDeli Project**
**Last Updated**: February 24, 2026
