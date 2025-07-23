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
