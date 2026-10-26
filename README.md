# 📱 didong - Hệ Thống Bán Lẻ Công Nghệ & Quản Trị Toàn Diện

> **Chuyển Giao Giá Trị Vượt Trội**  
> Dự án Fullstack mô phỏng hệ thống thương mại điện tử Di Động Việt (`https://didongviet.vn/`) với đầy đủ phân hệ dành cho **Khách Hàng (Customer)** và **Quản Trị Viên (Admin Hub)**.

---

## 🚀 Đang Chạy Sẵn Sàng (Live Local)
- **Địa chỉ truy cập Website:** [http://localhost:5000](http://localhost:5000)
- **Cổng Port:** `5000`

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend:** HTML5 Semantic, CSS3 (Di Động Việt Red `#be0014` Branding, Modern Flexbox & Grid, Glassmorphism, Micro-animations), JavaScript ES6+ (Async/Await, REST API Fetching, LocalStorage State, VietQR dynamic engine).
- **Backend:** Node.js, Express.js (RESTful APIs, Static File Hosting, CORS, Body-parser).
- **Database:** Dual-Engine:
  - Tích hợp sẵn cơ chế lưu trữ bền vững JSON Data Store (`backend/data/store.json`) chạy 100% độc lập, không yêu cầu cài đặt phần mềm bên ngoài.
  - Sẵn sàng kết nối MongoDB Atlas Cloud qua Mongoose khi cấu hình `MONGO_URI`.

---

## ✨ Danh Sách Tính Năng

### 1. Phân Hệ Khách Hàng (Customer Storefront)
- 🔴 **Giao diện thương hiệu Di Động Việt:** Tone màu đỏ đặc trưng `#be0014`, logo nhận diện, slogan *"Chuyển Giao Giá Trị Vượt Trội"*.
- 🔍 **Thanh tìm kiếm thông minh (Live Search):** Tự động gợi ý sản phẩm ngay khi gõ phím kèm ảnh, giá bán và giá niêm yết.
- 📂 **Thanh menu đa danh mục:**
  - Điện thoại (iPhone, Samsung Galaxy, Xiaomi, OPPO...)
  - MacBook & Laptop
  - Tablet & iPad
  - Hệ sinh thái Apple
  - Máy cũ Like New 99%
  - Phụ kiện (Cáp sạc, sạc dự phòng...)
  - Đồng hồ thông minh
  - Âm thanh (Loa Marshall, tai nghe AirPods, JBL)
- ⚡ **Flash Sale đếm ngược thời gian thực:** Đồng hồ đếm ngược Giờ:Phút:Giây, thanh tiến trình "Đã bán X suất" trực quan.
- 🎯 **Bộ lọc & Sắp xếp chuyên sâu:** Lọc theo Hãng (Apple, Samsung, Xiaomi...), mức giá (< 5 triệu, 5-15 triệu, 15-25 triệu, > 25 triệu), sắp xếp theo bán chạy, giá tăng/giảm, giảm giá sốc, đánh giá.
- 📱 **Chi tiết sản phẩm (Quick View Modal):** Chọn phiên bản dung lượng (128GB, 256GB, 512GB, 1TB) giá tự nhảy động, chọn màu sắc (Titan Sa Mạc, Titan Tự Nhiên...), bảng thông số kỹ thuật (Màn hình, Chip, RAM, Camera, Pin, OS).
- ⚖️ **So sánh sản phẩm (Compare Tool):** Chọn tối đa 3 sản phẩm để so sánh thông số cấu hình và giá đặt cạnh nhau.
- 🛒 **Giỏ hàng & Áp mã Voucher:** Thêm/sửa số lượng, xóa, nhập voucher giảm giá (`DIDONGVIET500`, `DDV200`, `HSSV`, `FREESHIP`).
- 💳 **Thanh toán VietQR động:** Chọn phương thức COD, Trả góp 0%, hoặc Quét mã VietQR tự sinh mã QR ngân hàng thật kèm số tiền và nội dung chuyển khoản.
- 🚚 **Tra cứu đơn hàng (Order Tracking):** Tra cứu theo Mã đơn (VD: `DDV-9821`) hoặc Số điện thoại. Hiển thị thanh tiến trình 5 bước: *Chờ xác nhận ➜ Đã xác nhận ➜ Đang chuẩn bị ➜ Đang giao ➜ Hoàn thành*.
- 🔄 **Công cụ Thu Cũ Đổi Mới (Trade-in Valuation):** Trợ lý tính giá máy cũ 3 bước, tự động cộng tiền Trợ Giá 2.000.000đ của Di Động Việt, đặt lịch thu máy tận nhà hoặc tại chi nhánh.
- 🏪 **Hệ thống cửa hàng (Store Locator):** Tra cứu hơn 50+ chi nhánh Di Động Việt tại TP.HCM, Hà Nội, Đà Nẵng, Bình Dương.
- 🤖 **Trợ lý Chatbot AI Di Động Việt:** Nút chat góc phải tư vấn tầm giá, chính sách bảo hành 1 đổi 1 trong 33 ngày, thủ tục trả góp 0%.

---

### 2. Phân Hệ Quản Trị Viên (Admin Hub)
Truy cập bằng nút **"Quản Trị Admin"** trên Header góc phải:
- 📊 **Dashboard Thống kê:** Tổng doanh thu, Tổng đơn hàng, Số đơn chờ duyệt, Khách hàng, Sản phẩm tồn kho, Biểu đồ cơ cấu danh mục.
- 📦 **Quản lý Sản phẩm (CRUD):** Thêm sản phẩm mới, Chỉnh sửa thông tin, Xóa sản phẩm, Bật/Tắt Flash Sale, quản lý giá và tồn kho.
- 📑 **Quản lý Đơn hàng:** Xem toàn bộ đơn hàng khách đặt, đổi trạng thái đơn hàng trực tiếp (*Chờ xác nhận -> Đã xác nhận -> Đang chuẩn bị -> Đang giao -> Hoàn thành / Hủy*).
- 👥 **Quản lý Khách hàng:** Theo dõi hội viên, xếp hạng (VIP Kim Cương, Hội Viên Vàng, Bạc), tổng chi tiêu.
- 🔄 **Quản lý Thu Cũ Đổi Mới:** Tiếp nhận các hồ sơ thẩm định máy cũ của khách hàng.
- 🎟️ **Quản lý Khuyến Mãi / Voucher:** Quản lý danh sách voucher đang áp dụng trên hệ thống.

---

## 💻 Cách Khởi Động Dự Án

### 1. Cài đặt thư viện:
```bash
cd backend
npm install
```

### 2. Chạy Server:
```bash
node server.js
```
Truy cập trình duyệt tại: **http://localhost:5000**

## Deploy lên Jenkins và AWS EC2

Repo có sẵn `Jenkinsfile` để build Docker image, kiểm tra HTTP smoke test, rồi deploy trên EC2. Vì Jenkins controller hiện chạy trên Windows, pipeline dùng chính EC2 Ubuntu làm Linux build agent có label `linux-docker`; image được build và chạy trên EC2, không cần Docker Desktop trên Windows.

### Chuẩn bị EC2

1. Trên Ubuntu EC2, cài Java 17 trở lên và Docker Engine. User `ubuntu` phải chạy được `docker` không cần `sudo` (thường bằng cách thêm user vào nhóm `docker`, rồi đăng nhập lại; nhóm này có quyền tương đương root).
2. `t3.micro` có ít RAM cho Jenkins agent, build Docker và app cùng lúc. Nếu gặp lỗi hết bộ nhớ, dừng các dịch vụ không cần thiết hoặc đổi instance sang loại có ít nhất 2 GiB RAM.
3. Trong Security Group, cho phép SSH (TCP 22) chỉ từ public IP của Jenkins controller; mở TCP 5000 chỉ từ IP của bạn để kiểm tra website. Không mở cổng Jenkins 8080 ra Internet công cộng.

### Chuẩn bị Jenkins

1. Đưa mã nguồn và `Jenkinsfile` lên GitHub; tạo Jenkins Pipeline job, chọn **Pipeline script from SCM**, cấu hình Git URL/branch `main` và script path `Jenkinsfile`.
2. Cài plugin **SSH Build Agents** và **Credentials Binding**. Trong **Manage Jenkins → Nodes**, thêm node mới với label `linux-docker`, chọn phương thức **Launch agents via SSH**, nhập Public DNS của EC2 và remote root directory như `/home/ubuntu/jenkins-agent`.
3. Tạo Jenkins credential kiểu **SSH Username with private key** cho node SSH, dùng username `ubuntu` và private key EC2. Cấu hình host key verification an toàn; không tắt kiểm tra host key. Node phải kết nối được từ Jenkins controller và lệnh `docker` chạy được.
4. Tạo credential kiểu **Secret text**, ID `shopphone-admin-password`, với mật khẩu admin mạnh. Không lưu private key hay mật khẩu trong Git.
5. Chạy Build. Jenkins sẽ checkout source trên agent EC2, build/test image rồi thay container `didong`. Mật khẩu admin chỉ được truyền từ Jenkins Credentials khi deploy.

Pipeline giữ dữ liệu JSON trong Docker volume `didong-data` qua các lần deploy và thử khôi phục image trước nếu app mới không qua health check. Truy cập website tại `http://<EC2_PUBLIC_DNS>:5000`; với website public, nên đặt reverse proxy/TLS trước app thay vì mở cổng này cho toàn Internet.