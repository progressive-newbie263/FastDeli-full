# Supplier Portal - FastDeli

## Cấu trúc đã tạo

### Core Files
- `types/index.ts` - TypeScript interfaces và types
- `lib/api.ts` - API utilities cho gọi backend
- `lib/utils.ts` - **NEW** Helper functions (formatCurrency, formatDateTime, etc.)
- `contexts/SupplierAuthContext.tsx` - Authentication context
- `layout.tsx` - Root layout với AuthProvider
- `page.tsx` - Entry point (redirect logic)

### Components
- `components/SupplierLayout.tsx` - Main layout wrapper
- `components/SupplierHeader.tsx` - Navigation header
- `components/StatsCard.tsx` - **NEW** Reusable stats card component
- `components/StatusBadge.tsx` - **NEW** Status badge component
- `components/Modal.tsx` - **NEW** Modal dialog component
- `components/EmptyState.tsx` - **NEW** Empty state component
- `components/LoadingSpinner.tsx` - **NEW** Loading spinner component

### Pages
- `login/page.tsx` - Đăng nhập cho restaurant owners
- `dashboard/page.tsx` - Tổng quan thống kê
- `orders/page.tsx` - Quản lý đơn hàng
- `menu/page.tsx` - Quản lý thực đơn (CRUD món ăn)
- `settings/page.tsx` - Cài đặt nhà hàng

## Tính năng chính

### Dashboard
- Hiển thị thống kê: Doanh thu, đơn hàng, số món ăn, đánh giá
- Danh sách đơn hàng gần đây
- Cảnh báo đơn hàng chờ xác nhận
- Quick actions

### Quản lý đơn hàng
- Xem danh sách đơn hàng với filter theo trạng thái
- Tìm kiếm theo mã đơn, tên khách, SĐT
- Xác nhận/Từ chối đơn hàng
- Cập nhật trạng thái (pending → confirmed → processing → delivering)
- Xem chi tiết đơn hàng

### Quản lý thực đơn
- Grid view các món ăn
- Thêm/Sửa/Xóa món ăn
- Toggle trạng thái bán/ngừng bán
- Upload hình ảnh món ăn
- Phân loại theo danh mục

### Cài đặt
- Cập nhật thông tin nhà hàng
- Cài đặt giờ hoạt động
- Cài đặt phí giao hàng, đơn tối thiểu
- Cập nhật vị trí (tọa độ)

## Backend APIs cần implement

### Auth Service
```
POST /api/auth/login - Đăng nhập (đã có)
GET /api/auth/profile - Lấy thông tin user (đã có)
```

### Food Service - Supplier Routes
**Cần tạo mới:**
```
GET /api/supplier/restaurants/:id/statistics - Thống kê dashboard
GET /api/supplier/restaurants/:id/orders - Danh sách đơn hàng
GET /api/supplier/orders/:id - Chi tiết đơn hàng
PATCH /api/supplier/orders/:id/status - Cập nhật trạng thái đơn

POST /api/supplier/foods - Tạo món ăn mới
PATCH /api/supplier/foods/:id - Cập nhật món ăn
DELETE /api/supplier/foods/:id - Xóa món ăn
PATCH /api/supplier/foods/:id/availability - Toggle trạng thái

PATCH /api/supplier/restaurants/:id - Cập nhật thông tin nhà hàng
GET /api/supplier/restaurants/:id/revenue-chart - Biểu đồ doanh thu
GET /api/supplier/restaurants/:id/reviews - Danh sách đánh giá
```

## Notes quan trọng

### 1. Database Schema
Cần thêm cột `owner_id` vào bảng `restaurants` để link với user:
```sql
ALTER TABLE restaurants ADD COLUMN owner_id INTEGER REFERENCES users(user_id);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
```

### 2. Authentication Flow
- Login kiểm tra `role = 'restaurant_owner'`
- Token lưu vào `localStorage` với key `supplier_token`
- Backend cần trả về `restaurant_id` của owner sau khi login

### 3. Authorization Middleware
Backend cần middleware để:
- Verify token
- Check role = 'restaurant_owner'
- Ensure supplier chỉ truy cập restaurant của họ

### 4. Environment Variables
Thêm vào `.env.local`:
```
NEXT_PUBLIC_AUTH_API_URL=http://localhost:5000
NEXT_PUBLIC_FOOD_API_URL=http://localhost:5001
```

## Tiếp theo cần làm

1. **Backend APIs** - Implement các endpoints supplier trong `server/food-service/routes/supplierRoutes.js`
2. **Database Migration** - Thêm `owner_id` vào restaurants table
3. **Auth Enhancement** - Backend trả về `restaurant_id` khi login
4. **Image Upload** - Integrate Cloudinary cho upload hình món ăn
5. **Real-time Updates** - WebSocket cho thông báo đơn hàng mới
6. **Testing** - Test toàn bộ flow từ login → quản lý

## Cách chạy

```bash
# Navigate to web folder
cd web

# Install dependencies (nếu chưa)
npm install

# Run development server
npm run dev

# Truy cập supplier portal
http://localhost:3000/supplier
```

## Cải tiến đã thực hiện ✨

### Code Quality
- ✅ Fix TypeScript errors (category_id type issues)
- ✅ Thêm proper type conversion cho form data
- ✅ Tạo reusable utility functions
- ✅ Tạo reusable UI components

### UI/UX Improvements  
- ✅ Better loading states với text descriptions
- ✅ Better error handling với retry buttons
- ✅ Demo credentials hiển thị trên login page
- ✅ Avatar fallback với initials
- ✅ Improved responsive design
- ✅ Better empty states
- ✅ Helper text cho form fields

### Components Created
- `StatsCard` - Reusable stats display
- `StatusBadge` - Multi-variant status badges
- `Modal` - Flexible modal dialog
- `EmptyState` - Consistent empty states
- `LoadingSpinner` - Loading indicator

### Utilities Added
- Currency formatting
- Date/time formatting  
- Relative time display
- Email/phone validation
- Price validation
- Text truncation
- Debounce function
- Clipboard copy
- And more...

## Demo Credentials 🔑
**Tài khoản demo hiển thị trên login page:**
```
Email: supplier@fastdeli.com
Password: supplier123
Role: restaurant_owner
```

**Note:** Backend cần tạo user này trong database với role `restaurant_owner` và link đến 1 restaurant.
