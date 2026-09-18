# 📱 Di Động Việt (didongviet.vn) - Hệ Thống Bán Lẻ Công Nghệ & Quản Trị Toàn Diện

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