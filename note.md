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