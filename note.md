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