TechStack, atm:

ReactJS, NextJS, NodeJS, Express, docker (future)
Thinking Flow:

Bước 1: Khởi tạo dự án:
Dùng next, express cho backend và react/next cho frontend
Bước 2: Mở rộng dự án:

Phân tích thiết kế hệ thống:
*) Vẽ sơ đồ use case hệ thống (delay) *) Vẽ sơ đồ use case thành phần (đăng nhập, đăng kí, ...) (triển khai) *) vẽ biểu đồ flow chart cho các trang service (food, bike, ship)
Bước : Microservice, phân phối

tư tưởng chủ đạo của microservice: Microservice sẽ là 'chia nhỏ các service'. Có nghĩa là, từ 1 website, thay vì dùng chung hết 1 database và 1 port thì chia nó ra thành các db và các port backend riêng biệt
Chúng sẽ chạy hoàn toàn độc lập. Nếu 1 port sập thì các port kia ko bị ảnh hưởng. Nhược điểm đáng nói sẽ là khó để build và vận hành, microservice khá phức tạp. Tuy nhiên, bù lại thì nếu chạy được, microservice có tốc độ rất nhanh
Docker sẽ giúp chạy các microservice nhanh chóng. Thay vì mất công cd x => node index.js một cách vô ích
