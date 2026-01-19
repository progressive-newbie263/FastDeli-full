thay đổi quan trọng phải nhớ: 
- chưa nghĩ ra cách xử lí phần metadata, lỗi của chúng là khi đặt ở layout, 
metadata ghi đè title trong đó lên mọi route khác sau lần reload đầu
- Buộc phải xóa hết metadata từ mọi layout đi. xong làm thủ công document.title ở từng file một
- tiếp theo sẽ xử lí phần database cho nhà hàng + người dùng


--------------------------------------------------------------------------------
GIT PUSH, 16-6-2025
- thêm 1 dependencies "Joi" vào node modules

--------------------------------------------------------------------------------
GIT PUSH, 21-6-2025 highlights:
- kết nối cloudinary (điện toán đám mây cho phép người dùng upload ảnh avatar mong muốn)
và tích hợp với frontend.
- chưa nối backend, nên tại push 21-6-2025 ảnh đại diện tự mất sau khi đăng xuất

--------------------------------------------------------------------------------
GIT PUSH, 24-6-2025 highlights:
- hoàn thiện tính năng 'avatar' của người dùng.

--------------------------------------------------------------------------------
GIT PUSH, 7-7-2025 highlights:
- build 1 vài nhà hàng clone để test thử.
- lưu ý cách dùng của 'container' trong tailwind.
- thay nó bằng : "w-full  max-w-screen-2xl  mx-auto" 

--------------------------------------------------------------------------------
GIT PUSH, 21-7-2025 highlights: 
- bản vá quan trọng.
- dùng "OpenStreetMap" làm tính năng bản đồ: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
- Lí do chọn nó thay vì "google map API": Thử nghiệm lần đầu nên chưa có kinh nghiệm. 
Open street map dễ dùng, chả cần cài đặt gì cả. Quan trọng nhất là mình ko cần nhập thẻ
tín dụng hay tài khoản ngân hàng gì cả
- Đã có 1 vài xác nhận cụ thể: Nếu cho phép lấy địa chỉ thì mới lấy được địa chỉ người dùng.
Còn nếu họ ko cho phép, sẽ chưa lấy được địa chỉ của họ.
- Tiếp theo nhiệm vụ sẽ là tìm cách lấy ra địa chỉ của mình và dùng nó app vào tính các
địa chỉ lân cận (khoảng cách giữa nhà hàng đến địa chỉ hiện tại của mình).


--------------------------------------------------------------------------------
GIT PUSH, 23-7-2025 highlights: 
- bản vá nhỏ/microupdate
- sửa UX 1 chút. thay đổi các alert thành các toast
- thêm tính năng tạm thời anti-spam. Khi đang tìm địa chỉ nó fix sang icon loading.

-----------------------------------------------------------------------------
GIT PUSH, 2x-7-2025 highlights:
User bấm "Đặt hàng" 
→ handlePlaceOrder() chạy (checkout/page.tsx)
→ Cập nhật localStorage 
→ Dispatch event 'cart-updated' (Xử lí bên cart luôn).
→ Header nhận event
→ Header gọi lại getTotalItemsFromCart()
→ setCartQuantity() với số mới
→ UI Header cập nhật ngay lập tức


-----------------------------------------------------------------------------
GIT PUSH, 16-8-2025:
Thiết kế trang payment. DÙng GPT tạo phần sinh QR code (function custom luôn).
-> sau khi bấm đặt hàng ở checkout thì nó sẽ điều hướng sang trang payment thay vì
tự động hoàn thiện order như trước đó
-> note: tạm thời, tính năng thanh toán sẽ là: đưa ra hóa đơn và 1 QR ảo kèm mã QR xác
định của nó thôi. Người dùng sẽ có cách skip thanh toán và coi như đã chuyển tiền thành công
khi bấm nút thanh toán (Kiểu đơn 0 đồng trá hình).
-> với tính năng phức tạp này, cho đến lúc hiểu rõ hơn thì ko nên làm thẳng cái thanh 
toán QR vào
-> Với "order id" thì tạo nó dựa theo "thời gian đặt hàng". Vì thời gian ấy là 1 thuộc tính độc nhất.
Tuy nhiên, vẫn có thể hi hữu xảy ra trường hợp kiểu này: thời gian trong console.log tính theo ms, nhưng
2 user có thể dính chung 1 thời gian nào đó


-----------------------------------------------------------------------------
GITPUSH, 18-9-2025:
-----------------------------------------------------------------------------
Đây là 1 BIG UPDATE. Sửa lại 1 số tính năng + hiển thị các đơn hàng
Chỉnh sửa khá nhiều trong csdl
Sửa lại 1 chút trong bảng 'restaurants' trong database, khi mà thay 2 thuộc tính restaurant_id và restaurant_name thành 'id' và 'name'
Sẽ thực thi đoạn ở dưới:

ALTER TABLE restaurants
RENAME COLUMN restaurant_id TO id;


ALTER TABLE restaurants
RENAME COLUMN restaurant_name TO name;

ALTER TABLE foods DROP CONSTRAINT foods_restaurant_id_fkey;
ALTER TABLE orders DROP CONSTRAINT orders_restaurant_id_fkey;

ALTER TABLE foods
ADD CONSTRAINT foods_restaurant_id_fkey
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);

ALTER TABLE orders
ADD CONSTRAINT orders_restaurant_id_fkey
FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);



-----------------------------------------------------------------------------
GITPUSH, 23-9-2025:
-----------------------------------------------------------------------------
+ trước đó database bị lỗi 1 vài index nên cần phải viết lại 1 số index (idx_...)
Nó giúp cải thiện rất nhanh chóng tốc độ reload trang (f5)
Ở lần đầu, nó mất tầm 10-12s do 'postgre warmup'. Những lần f5 sau đó thì còn 0.5s, hoàn toàn ổn áp.
cải thiện 1 chút code, khi sửa lại router /orders, với việc làm page.tsx như 1 client layout bọc file trước đó
thay vì viết nguyên code trong page.tsx như trước đó. 

+ Viết thêm 1 hàm rerender state của nút hủy (sau 5p tự động rerender nút từ active sang inactive).

+ file food_deli_db trước đó sẽ đổi sang food_deli_deb_prefixed (do nhiều lần fetch và chỉnh sửa đã làm nó loạn vcl).
file food_deli_db mới sẽ là 1 bản gọn gàng, tinh giản, đảm bảo các index ko bị lỗi. Cải thiện tốc độ reload f5 web.


-----------------------------------------------------------------------------
------------------------------GITPUSH, 2-10-2025-----------------------------

+ trước hết, trong mỗi orders sẽ có thể áp dụng 1 mã khuyến mãi (nếu có). Giới hạn hiện tại là 1 đơn chỉ áp dụng 1 mã.
+ ý tưởng sẽ là: Ở giao diện thanh toán (payment page). Sẽ cho phép người dùng chọn giữa các phương thức promotions.
+ Sẽ đan xen giữa : promotions từ chính Grabfood (nên để nó phèn phèn tí, mặc định phải có) để nếu nhà hàng có ưu đãi thì
ăn ưu đãi từ nhà hàng. Nếu ko có ưu đãi thì để cái ưu đãi phèn này gánh 1 tí tiền 
+ Có lẽ trước hết chỉ nên làm 1 phương thức thanh toán ảo. Tương đối khó làm 2 cái qr với momo, vì kể cả có chuyển xèng thành công thì nó vẫn là liên quan đến tiền thật, việc thật.
+ Bản vá thử nghiệm (mini patch)
+ Hiển thị các promotions ra bên người dùng.
+ Có thể rollback lại sau cái push hôm 23/9/2025 nếu bị lỗi. Bản vá nhỏ, ko cần lo quá


-----------------------------------------------------------------------------
------------------------------GITPUSH, 3-10-2025-----------------------------

+ đến hiện tại kiểm thử vẫn đang chạy ổn, đúng ý muốn



-----------------------------------------------------------------------------
------------------------------GITPUSH, ?-10-2025-----------------------------

Số chữ số       thập phân	      Độ chính xác tương ứng	
Ví dụ
2	              ~1.1 km	         Chỉ cần biết thành phố lớn
3	              ~110 m	         Khu phố / block
4	              ~11 m	           Đủ để xác định ngôi nhà
5	              ~1.1 m	         Rất chính xác, đủ để định vị cửa hàng/nhà riêng
6	              ~0.11 m (11 cm)	 Độ chính xác cao, thừa cho food delivery
7+	            < 1 cm	         Mức GPS chuyên dụng (không cần cho app food)
=> làm bản đồ quán ăn thì có thể dùng 5-6 chữ số thập phân cho kinh/vĩ độ để lấy chính xác được
vị trí quán ăn, vị trí người dùng, ....




-----------------------------------------------------------------------------
------------------------------GITPUSH, 30-11-2025-----------------------------

Danh sach cac api endpoint dang co (dan vao terminal):

+ cd server/food-service
+ Get-ChildItem -Recurse routes\* | Select-String "router\.(get|post|put|delete)"



-----------------------------------------------------------------------------
------------------------------GITPUSH, 12-1-2025-----------------------------

* push của 12-1 là 1 push lớn. Nó ảnh hưởng nhiều đến các trang admin-ui và supplier
* Rất nhiều api sẽ được copilot gen (nó khó với trình mình hiện tại -_-)
* Do quên chưa comment lại nhiều chỗ nên giờ mình sẽ lục lại các file .js backend
* Ưu tiên chú thích lại công dụng và đường lối thiết kế các api đó. (ưu tiên: cao).



========================================================================================
========================================================================================
=============================       BIG UPDATE      ====================================
========================================================================================
========================================================================================


-----------------------------------------------------------------------------
------------------------------GITPUSH, 15-1-2025-----------------------------

* SUPPLIER PORTAL - PHASE 1 (BACKEND & FLOW)
* Định hướng: Cải thiện hạ tầng Backend cho chủ nhà hàng (Supplier). Tích hợp luồng Auth.

1. Database & Migration (3 SQL Scripts riêng biệt)
- **db-shared-deli** (1_supplier_migration_users.sql): 
  + Tạo 3 users mới với role 'restaurant_owner' (băm mật khẩu bằng bcrypt trước khi insert).
  + sử dụng file "generate-supplier-passwords.js": 
    cd server/auth-service
    node generate-supplier-passwords.js
  
- **db-food-deli** (2_supplier_migration_restaurants.sql):
  + Sửa owner_id từ VARCHAR → INTEGER (FK tham chiếu đến users.user_id trong db-shared-deli).
  + Thêm verification_status (pending/approved/rejected), documents (JSONB).
  + Tạo index idx_restaurants_owner_id tăng tốc truy vấn theo chủ sở hữu.
  
- **Helper Script** (3_link_restaurants_helper.sql):
  Gắn restaurants với owners tương ứng (UPDATE restaurants SET owner_id = ...)

2. Backend - Food Service
- Middleware: supplierAuth.js.
  Chặn xác thực JWT, kiểm tra role restaurant_owner và quyền sở hữu (ownership) đối với nhà hàng trước khi cho phép can thiệp dữ liệu.
  
- Controller: supplierController.js. 
  Thực thi 12 hàm xử lý (Thống kê Dashboard, Quản lý đơn hàng, CRUD Menu/Food, Review).
  
- Routes: Bổ sung 15 API endpoints tại /api/supplier/*.

3. Backend - Auth Service (Cross-Database Query)
- Login Flow: Cập nhật loginController.js thực hiện query liên database.
  + Bước 1: Query db-shared-deli để xác thực user (email/password/role).
  + Bước 2: Query db-food-deli để lấy restaurant_id dựa trên owner_id.
  
- Response: Trả về thêm restaurant_id, name, verification_status trong JWT/Body khi chủ nhà hàng đăng nhập thành công.

4. Frontend - Supplier Portal Integration
- API Client (web/app/supplier/lib/api.ts): Chuyển USE_MOCK_DATA = false sang Real API.
- State: Lưu restaurant_id vào localStorage sau khi login để gọi API đúng context.

5. API Endpoints Chính (15 endpoints)
- GET /api/supplier/statistics: Doanh thu (delivered), số lượng món, đánh giá trung bình.
- GET /api/supplier/orders: Danh sách đơn hàng (filter, search, pagination).
- PATCH /api/supplier/orders/:id/status: Xác nhận/Hủy/Chuyển trạng thái đơn hàng.
- GET/POST/PATCH/DELETE /api/supplier/foods: Quản lý thực đơn của nhà hàng.
- GET /api/supplier/reviews: Xem danh sách đánh giá.
- PATCH /api/supplier/restaurant: Cập nhật thông tin nhà hàng.

6. Bảo mật & Authorization
- Cơ chế xác thực 2 lớp: 
  (1) Token hợp lệ (verifyToken middleware).
  (2) owner_id trong restaurants.owner_id khớp với userId trong JWT token.
  
- Fix lỗi CORS giữa Frontend (Port 3000) và Backend (Port 5001).

7. Documentation & Testing
- SUPPLIER_IMPLEMENTATION_GUIDE.md: Hướng dẫn chi tiết 60+ trang.
- postman-collection-supplier.json: Collection test 15 API endpoints.
- generate-supplier-passwords.js: Helper script tạo bcrypt hash.

8. Nhiệm vụ tiếp theo (Phase 2):
- Tích hợp Cloudinary cho upload ảnh món ăn.
- Hệ thống đăng ký đối tác (Partner Registration) & Upload giấy phép kinh doanh.
- Real-time thông báo đơn hàng mới qua Socket.io.
- Email verification cho restaurant owners mới.