# Quick Start Guide - Supplier Portal

## 🚀 Cách test Supplier Portal (Frontend only)

### 1. Chuẩn bị

```bash
cd d:\FastDeli\project\web
npm install
npm run dev
```

### 2. Truy cập Supplier Portal

```
http://localhost:3000/supplier
```

### 3. Login với Demo Account

Trên trang login sẽ thấy box màu xanh với credentials:

```
Email: supplier@fastdeli.com
Password: supplier123
```

**Lưu ý**: Hiện tại backend chưa có, nên login sẽ fail. Để test UI:

### 4. Bypass Authentication (Testing only)

Tạm thời comment out auth check trong `SupplierLayout.tsx`:

```typescript
// Comment these lines temporarily
// useEffect(() => {
//   if (!isLoading && !isAuthenticated && pathname !== '/supplier/login') {
//     router.push('/supplier/login');
//   }
// }, [isAuthenticated, isLoading, pathname, router]);
```

### 5. Test các trang

#### Dashboard (`/supplier/dashboard`)
- Xem stats cards (Revenue, Orders, Foods, Rating)
- Xem recent orders list
- Click quick actions

#### Orders (`/supplier/orders`)
- Filter theo status
- Search orders
- Click "Chi tiết" để xem order detail modal
- Test quick actions (Xác nhận, Từ chối, etc.)

#### Menu (`/supplier/menu`)
- Click "Thêm món mới" để test form modal
- Test form validation
- Test category dropdown
- Test image URL preview
- Test save/cancel buttons

#### Settings (`/supplier/settings`)
- Xem form layout
- Test các input fields
- Test time pickers
- Test number inputs
- Test save button

## 🎨 Testing Components

### StatsCard
```typescript
import StatsCard from '@/app/supplier/components/StatsCard';
import { DollarSign } from 'lucide-react';

<StatsCard
  title="Doanh thu"
  value="15,000,000₫"
  subtitle="Hôm nay: 500,000₫"
  icon={<DollarSign size={24} className="text-green-600" />}
  iconBgColor="bg-green-100"
  trend={12.5}
/>
```

### StatusBadge
```typescript
import StatusBadge from '@/app/supplier/components/StatusBadge';

<StatusBadge status="pending" variant="order" />
<StatusBadge status="paid" variant="payment" />
<StatusBadge status="active" variant="restaurant" />
```

### Modal
```typescript
import Modal from '@/app/supplier/components/Modal';

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Chi tiết đơn hàng"
  size="md"
>
  Content here
</Modal>
```

### EmptyState
```typescript
import EmptyState from '@/app/supplier/components/EmptyState';
import { ShoppingBag } from 'lucide-react';

<EmptyState
  icon={<ShoppingBag size={48} />}
  title="Chưa có đơn hàng nào"
  description="Đơn hàng mới sẽ hiển thị ở đây"
  action={{
    label: "Làm mới",
    onClick: () => reload()
  }}
/>
```

### LoadingSpinner
```typescript
import LoadingSpinner from '@/app/supplier/components/LoadingSpinner';

<LoadingSpinner size="md" text="Đang tải..." />
<LoadingSpinner size="lg" fullScreen />
```

## 🛠️ Testing Utilities

```typescript
import { 
  formatCurrency, 
  formatDateTime, 
  getRelativeTime,
  isValidEmail,
  ORDER_STATUS_CONFIG 
} from '@/app/supplier/lib/utils';

// Format currency
formatCurrency(150000); // "150.000₫"

// Format datetime
formatDateTime("2026-01-08T10:30:00"); // "08/01/2026, 10:30"

// Relative time
getRelativeTime("2026-01-08T09:30:00"); // "1 giờ trước"

// Validation
isValidEmail("test@email.com"); // true
isValidPhone("0901234567"); // true

// Status config
ORDER_STATUS_CONFIG.pending.label; // "Chờ xác nhận"
```

## 📱 Responsive Testing

Test trên các breakpoints:

- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px (iPad)
- **Desktop**: 1440px (Laptop)

### Chrome DevTools
1. F12 → Toggle device toolbar (Ctrl+Shift+M)
2. Select device
3. Test navigation, forms, modals

## Checklist kiểm tra UI

- [ ] Login page hiển thị đúng demo credentials
- [ ] Dashboard stats cards render correctly
- [ ] Orders filter và search hoạt động
- [ ] Menu form modal mở/đóng smooth
- [ ] Settings form layout responsive
- [ ] Header mobile menu hoạt động
- [ ] Loading states xuất hiện khi cần
- [ ] Empty states hiển thị đúng message
- [ ] Icons render correctly (Lucide)
- [ ] Colors consistent (Orange theme)

## 🐛 Known Issues (chờ backend)

1. **Authentication**: Login fails vì chưa có backend API
2. **Data Loading**: Tất cả API calls sẽ fail
3. **Image Upload**: Cần integrate Cloudinary
4. **Real-time**: Chưa có WebSocket notifications

## 🔜 Next: Backend Implementation

Sau khi test UI xong, cần implement:

1. `POST /api/auth/login` - Return `restaurant_id` với token
2. `GET /api/supplier/restaurants/:id/statistics` - Dashboard stats
3. `GET /api/supplier/restaurants/:id/orders` - Order list
4. `PATCH /api/supplier/orders/:id/status` - Update order status
5. `POST /api/supplier/foods` - Create food
6. `PATCH /api/supplier/foods/:id` - Update food

---

**Happy Testing! 🎉**
