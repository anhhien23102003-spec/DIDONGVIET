// backend/data/store.js
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname);
const DATA_FILE = path.join(DATA_DIR, 'store.json');

const INITIAL_DATA = {
  products: [
    {
      id: 'prod-001',
      name: 'iPhone 16 Pro Max 256GB',
      category: 'phone',
      brand: 'Apple',
      price: 36990000,
      salePrice: 34490000,
      stock: 45,
      isFlashSale: true,
      soldCount: 38,
      rating: 4.9,
      reviewsCount: 184,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Trợ giá 2 Triệu',
      installment: 'Trả góp 0% - 0đ trả trước',
      storageOptions: ['256GB', '512GB', '1TB'],
      colors: ['Titan Sa Mạc', 'Titan Tự Nhiên', 'Titan Trắng', 'Titan Đen'],
      specs: {
        screen: '6.9 inch Super Retina XDR OLED, 120Hz ProMotion',
        chip: 'Apple A18 Pro (3nm tân tiến nhất)',
        ram: '8GB',
        storage: '256GB',
        rearCamera: '48MP Fusion + 48MP Ultra Wide + 12MP Telephoto 5x',
        frontCamera: '12MP TrueDepth',
        battery: 'Xem video đến 33 giờ, Sạc nhanh 50% trong 30 phút',
        os: 'iOS 18'
      },
      description: 'Siêu phẩm đỉnh cao nhất của Apple với nút Camera Control mới, viền titan chuẩn hàng không vũ trụ và thời lượng pin kỷ lục.'
    },
    {
      id: 'prod-002',
      name: 'iPhone 16 Pro 128GB',
      category: 'phone',
      brand: 'Apple',
      price: 29990000,
      salePrice: 27890000,
      stock: 30,
      isFlashSale: true,
      soldCount: 22,
      rating: 4.9,
      reviewsCount: 96,
      image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Giảm sốc 2.1 Tr',
      installment: 'Trả góp 0%',
      storageOptions: ['128GB', '256GB', '512GB', '1TB'],
      colors: ['Titan Sa Mạc', 'Titan Tự Nhiên', 'Titan Trắng', 'Titan Đen'],
      specs: {
        screen: '6.3 inch Super Retina XDR OLED, 120Hz',
        chip: 'Apple A18 Pro',
        ram: '8GB',
        storage: '128GB',
        rearCamera: '48MP + 48MP + 12MP (Zoom quang 5x)',
        frontCamera: '12MP',
        battery: 'Xem video đến 27 giờ',
        os: 'iOS 18'
      },
      description: 'Kích thước vừa vặn hoàn hảo, trang bị toàn bộ tính năng cao cấp từ dòng Pro Max.'
    },
    {
      id: 'prod-003',
      name: 'Samsung Galaxy S25 Ultra 5G 256GB',
      category: 'phone',
      brand: 'Samsung',
      price: 36990000,
      salePrice: 32990000,
      stock: 50,
      isFlashSale: true,
      soldCount: 42,
      rating: 4.9,
      reviewsCount: 142,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Galaxy AI thế hệ mới',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB', '512GB', '1TB'],
      colors: ['Titan Xanh', 'Titan Bạc', 'Titan Đen'],
      specs: {
        screen: '6.86 inch Dynamic AMOLED 2X, QHD+, 120Hz',
        chip: 'Snapdragon 8 Elite for Galaxy',
        ram: '12GB',
        storage: '256GB',
        rearCamera: '200MP + 50MP + 50MP + 10MP',
        frontCamera: '12MP Dual Pixel',
        battery: '5000 mAh, Sạc nhanh siêu tốc 45W',
        os: 'Android 15, One UI 7'
      },
      description: 'Đỉnh cao trí tuệ nhân tạo Galaxy AI, bút S-Pen tích hợp, khung viền phẳng bo tròn nhẹ cầm cực êm tay.'
    },
    {
      id: 'prod-004',
      name: 'Samsung Galaxy Z Fold6 5G 256GB',
      category: 'phone',
      brand: 'Samsung',
      price: 43990000,
      salePrice: 39490000,
      stock: 18,
      isFlashSale: false,
      soldCount: 12,
      rating: 4.8,
      reviewsCount: 57,
      image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Tặng bảo hiểm rơi vỡ',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB', '512GB'],
      colors: ['Xám Metal', 'Hồng Rose', 'Xanh Navy'],
      specs: {
        screen: 'Chính 7.6 inch + Phụ 6.3 inch Dynamic AMOLED 2X',
        chip: 'Snapdragon 8 Gen 3 for Galaxy',
        ram: '12GB',
        storage: '256GB',
        rearCamera: '50MP + 12MP + 10MP',
        frontCamera: '10MP + 4MP UDC',
        battery: '4400 mAh, Sạc 25W',
        os: 'Android 14'
      },
      description: 'Điện thoại gập siêu mỏng nhẹ, trợ lý đa nhiệm AI dịch thuật trực tiếp 2 màn hình.'
    },
    {
      id: 'prod-005',
      name: 'iPhone 15 128GB Chính Hãng VN/A',
      category: 'phone',
      brand: 'Apple',
      price: 22990000,
      salePrice: 18790000,
      stock: 65,
      isFlashSale: true,
      soldCount: 55,
      rating: 4.8,
      reviewsCount: 310,
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Giá Rẻ Vượt Trội',
      installment: 'Trả góp 0%',
      storageOptions: ['128GB', '256GB'],
      colors: ['Hồng Pastel', 'Xanh Mint', 'Vàng', 'Đen'],
      specs: {
        screen: '6.1 inch Super Retina XDR OLED, Dynamic Island',
        chip: 'Apple A16 Bionic',
        ram: '6GB',
        storage: '128GB',
        rearCamera: '48MP + 12MP Ultra Wide',
        frontCamera: '12MP TrueDepth',
        battery: 'Xem video đến 20 giờ, Cổng USB-C',
        os: 'iOS 18'
      },
      description: 'Dynamic Island thời thượng, camera 48MP sắc nét và cổng sạc USB-C tiện lợi hàng đầu.'
    },
    {
      id: 'prod-006',
      name: 'Xiaomi 14 Ultra 5G 16GB/512GB',
      category: 'phone',
      brand: 'Xiaomi',
      price: 32990000,
      salePrice: 26990000,
      stock: 14,
      isFlashSale: false,
      soldCount: 9,
      rating: 4.9,
      reviewsCount: 44,
      image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Ống kính Leica Đỉnh cao',
      installment: 'Trả góp 0%',
      storageOptions: ['512GB'],
      colors: ['Trắng Da', 'Đen Da'],
      specs: {
        screen: '6.73 inch LTPO AMOLED 120Hz WQHD+',
        chip: 'Snapdragon 8 Gen 3',
        ram: '16GB',
        storage: '512GB',
        rearCamera: 'Hệ 4 camera 50MP cảm biến 1-inch Leica',
        frontCamera: '32MP',
        battery: '5000 mAh, Sạc siêu tốc 90W (Có dây) / 80W (Không dây)',
        os: 'Xiaomi HyperOS'
      },
      description: 'Nhiếp ảnh gia bỏ túi với ống kính quang học Leica Summilux huyền thoại.'
    },
    {
      id: 'prod-007',
      name: 'MacBook Air 13 inch M3 (8GB/256GB)',
      category: 'laptop',
      brand: 'Apple',
      price: 27990000,
      salePrice: 25490000,
      stock: 25,
      isFlashSale: false,
      soldCount: 18,
      rating: 5.0,
      reviewsCount: 88,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Ưu đãi HSSV -500k',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB', '512GB'],
      colors: ['Midnight (Xanh Đen)', 'Starlight (Vàng Ánh Sao)', 'Silver (Bạc)', 'Space Gray'],
      specs: {
        screen: '13.6 inch Liquid Retina, độ sáng 500 nits',
        chip: 'Apple M3 8-core CPU, 8/10-core GPU',
        ram: '8GB Unified Memory',
        storage: '256GB SSD',
        rearCamera: '1080p FaceTime HD camera',
        battery: 'Thời lượng pin lên tới 18 giờ',
        os: 'macOS Sequoia'
      },
      description: 'Mỏng nhẹ bậc nhất thế giới, sức mạnh chip M3 thế hệ mới hỗ trợ xuất 2 màn hình ngoài cùng lúc.'
    },
    {
      id: 'prod-008',
      name: 'MacBook Pro 14 inch M3 Pro (18GB/512GB)',
      category: 'laptop',
      brand: 'Apple',
      price: 49990000,
      salePrice: 46990000,
      stock: 15,
      isFlashSale: false,
      soldCount: 11,
      rating: 4.9,
      reviewsCount: 39,
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Đồ họa Chuyên Nghiệp',
      installment: 'Trả góp 0%',
      storageOptions: ['512GB', '1TB'],
      colors: ['Space Black (Đen Không Gian)', 'Silver'],
      specs: {
        screen: '14.2 inch Liquid Retina XDR, ProMotion 120Hz',
        chip: 'Apple M3 Pro 11-core CPU, 14-core GPU',
        ram: '18GB Unified Memory',
        storage: '512GB SSD',
        battery: 'Thời lượng pin 22 giờ',
        os: 'macOS Sequoia'
      },
      description: 'Quái thú đồ họa và dựng phim chuyên nghiệp trong màu sắc Space Black quyến rũ chống bám vân tay.'
    },
    {
      id: 'prod-009',
      name: 'iPad Pro M4 11 inch Wi-Fi 256GB',
      category: 'tablet',
      brand: 'Apple',
      price: 28990000,
      salePrice: 26990000,
      stock: 20,
      isFlashSale: false,
      soldCount: 15,
      rating: 5.0,
      reviewsCount: 71,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Mỏng chỉ 5.3mm',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB', '512GB', '1TB'],
      colors: ['Space Black', 'Silver'],
      specs: {
        screen: '11 inch Ultra Retina XDR (Tandem OLED hai lớp)',
        chip: 'Apple M4 thế hệ mới nhất với Neural Engine 38 TOPS',
        ram: '8GB',
        storage: '256GB',
        camera: '12MP Sau + 12MP Trước góc siêu rộng ngang',
        battery: 'Pin xem video lướt web 10 giờ',
        os: 'iPadOS 18'
      },
      description: 'Thiết bị mỏng nhất từ trước đến nay của Apple, màn hình OLED 2 lớp Tandem siêu rực rỡ và chip M4 vượt tầm thời đại.'
    },
    {
      id: 'prod-010',
      name: 'iPad Air M2 11 inch Wi-Fi 128GB',
      category: 'tablet',
      brand: 'Apple',
      price: 17490000,
      salePrice: 15790000,
      stock: 35,
      isFlashSale: true,
      soldCount: 29,
      rating: 4.8,
      reviewsCount: 84,
      image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Bán chạy nhất',
      installment: 'Trả góp 0%',
      storageOptions: ['128GB', '256GB'],
      colors: ['Blue Pastel', 'Purple', 'Starlight', 'Space Gray'],
      specs: {
        screen: '11 inch Liquid Retina chống chói True Tone',
        chip: 'Apple M2 mạnh mẽ',
        ram: '8GB',
        storage: '128GB',
        camera: '12MP góc rộng trước và sau',
        battery: 'Lướt web 10 giờ',
        os: 'iPadOS 18'
      },
      description: 'Lựa chọn hoàn hảo cho học tập, ghi chú với bút Apple Pencil Pro và sáng tạo nội dung.'
    },
    {
      id: 'prod-011',
      name: 'Samsung Galaxy Tab S10 Ultra 5G 256GB',
      category: 'tablet',
      brand: 'Samsung',
      price: 33990000,
      salePrice: 29990000,
      stock: 12,
      isFlashSale: false,
      soldCount: 7,
      rating: 4.9,
      reviewsCount: 31,
      image: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Kèm bút S-Pen',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB', '512GB'],
      colors: ['Xám Moonstone', 'Bạc Platinum'],
      specs: {
        screen: '14.6 inch Dynamic AMOLED 2X, 120Hz chống chói',
        chip: 'MediaTek Dimensity 9300+ 4nm',
        ram: '12GB',
        storage: '256GB',
        battery: '11200 mAh, Sạc nhanh 45W, Chống nước IP68',
        os: 'Android 14, One UI 6.1'
      },
      description: 'Máy tính bảng màn hình khổng lồ 14.6 inch, kháng nước bụi IP68, sẵn sàng thay thế laptop di động.'
    },
    {
      id: 'prod-012',
      name: 'Apple Watch Series 10 Nhôm 42mm (GPS)',
      category: 'watch',
      brand: 'Apple',
      price: 11290000,
      salePrice: 10490000,
      stock: 30,
      isFlashSale: true,
      soldCount: 26,
      rating: 4.9,
      reviewsCount: 65,
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Màn hình OLED góc rộng',
      installment: 'Trả góp 0%',
      storageOptions: ['42mm', '46mm'],
      colors: ['Đen Jet Black', 'Vàng Hồng Rose Gold', 'Bạc'],
      specs: {
        screen: 'OLED Always-On rộng hơn 30%, độ sáng 2000 nits',
        chip: 'Apple S10 SiP',
        features: 'Đo điện tâm đồ ECG, Oxy trong máu, Cảnh báo ngưng thở khi ngủ',
        battery: '18 giờ, Sạc nhanh 80% chỉ trong 30 phút',
        waterproof: 'Chống nước 50m'
      },
      description: 'Phiên bản mỏng nhất từng có của Apple Watch cùng lớp vỏ Jet Black bóng bẩy sang trọng.'
    },
    {
      id: 'prod-013',
      name: 'Apple Watch Ultra 2 GPS + Cellular 49mm',
      category: 'watch',
      brand: 'Apple',
      price: 22490000,
      salePrice: 20990000,
      stock: 16,
      isFlashSale: false,
      soldCount: 14,
      rating: 5.0,
      reviewsCount: 52,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Vỏ Titan Đen Siêu Bền',
      installment: 'Trả góp 0%',
      storageOptions: ['49mm'],
      colors: ['Titan Đen Mới', 'Titan Tự Nhiên'],
      specs: {
        screen: 'Màn hình phẳng Sapphire 3000 nits siêu sáng',
        chip: 'Apple S9 SiP thao tác chạm 2 lần Double Tap',
        features: 'GPS băng tần kép L1 & L5 chuẩn xác cao, Còi báo động 86dB',
        battery: '36 giờ sử dụng thông thường, lên đến 72 giờ chế độ nguồn điện thấp',
        waterproof: 'Chống nước 100m, lặn sâu 40m tiêu chuẩn EN13319'
      },
      description: 'Đồng hồ thể thao chuyên nghiệp dành cho vận động viên, thám hiểm và người đam mê hoạt động ngoài trời.'
    },
    {
      id: 'prod-014',
      name: 'Tai nghe Apple AirPods Pro 2 (USB-C MagSafe)',
      category: 'audio',
      brand: 'Apple',
      price: 6190000,
      salePrice: 5390000,
      stock: 80,
      isFlashSale: true,
      soldCount: 71,
      rating: 4.9,
      reviewsCount: 220,
      image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Chống ồn chủ động x2',
      installment: 'Trả góp 0%',
      storageOptions: ['Tiêu chuẩn'],
      colors: ['Trắng'],
      specs: {
        chip: 'Apple H2 cao cấp',
        features: 'Âm thanh thích ứng (Adaptive Audio), Nhận biết cuộc hội thoại, Chống ồn chủ động ANC thế hệ mới',
        battery: 'Lên đến 6 giờ nghe 1 lần, 30 giờ cùng hộp sạc',
        port: 'Cổng USB-C, Hộp sạc tích hợp loa tìm kiếm và móc dây đeo'
      },
      description: 'Chiếc tai nghe không dây chống ồn đỉnh cao hàng đầu thế giới với cổng USB-C tiện dụng.'
    },
    {
      id: 'prod-015',
      name: 'Loa Bluetooth Marshall Emberton II Chính Hãng',
      category: 'audio',
      brand: 'Marshall',
      price: 4290000,
      salePrice: 3490000,
      stock: 35,
      isFlashSale: false,
      soldCount: 28,
      rating: 4.9,
      reviewsCount: 87,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Chống nước IP67',
      installment: 'Trả góp 0%',
      storageOptions: ['Tiêu chuẩn'],
      colors: ['Black & Brass (Đen Viền Đồng)', 'Cream (Kem)'],
      specs: {
        power: '2 loa toàn dải 10W Class D',
        sound: 'Âm thanh đa hướng True Stereophonic 360 độ',
        battery: 'Hơn 30 giờ chơi nhạc liên tục, sạc nhanh 20 phút cho 4 giờ nghe',
        waterproof: 'Chống nước & bụi chuẩn IP67'
      },
      description: 'Chất âm rock kinh điển của Marshall trong một kích thước nhỏ gọn mang theo mọi chuyến đi.'
    },
    {
      id: 'prod-016',
      name: 'Củ sạc nhanh Anker Nano 30W PIQ 3.0 (A2147)',
      category: 'accessory',
      brand: 'Anker',
      price: 450000,
      salePrice: 319000,
      stock: 120,
      isFlashSale: true,
      soldCount: 110,
      rating: 4.8,
      reviewsCount: 350,
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Bảo hành 18 tháng',
      installment: '',
      storageOptions: ['30W'],
      colors: ['Trắng', 'Đen', 'Tím', 'Xanh'],
      specs: {
        power: '30W Power Delivery & PowerIQ 3.0',
        compatible: 'Tương thích iPhone 16/15, iPad, MacBook Air, Galaxy S25',
        tech: 'Công nghệ GaN III tản nhiệt mát mẻ, kích thước siêu nhỏ'
      },
      description: 'Củ sạc GaN siêu nhỏ gọn bỏ túi, sạc nhanh 50% pin cho iPhone chỉ trong 25 phút.'
    },
    {
      id: 'prod-017',
      name: 'Pin sạc dự phòng MagSafe Baseus 10.000mAh 20W',
      category: 'accessory',
      brand: 'Baseus',
      price: 990000,
      salePrice: 690000,
      stock: 85,
      isFlashSale: false,
      soldCount: 63,
      rating: 4.7,
      reviewsCount: 130,
      image: 'https://images.unsplash.com/photo-1609592424300-8cb969f69f83?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1609592424300-8cb969f69f83?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Hít nam châm chắc chắn',
      installment: '',
      storageOptions: ['10000mAh'],
      colors: ['Trắng', 'Xanh', 'Đen'],
      specs: {
        capacity: '10.000 mAh',
        charging: 'Sạc không dây MagSafe 15W + Cổng Type-C 20W PD',
        display: 'Màn hình LED báo % pin thông minh'
      },
      description: 'Hít chặt lưng iPhone không che camera, vừa sạc nhanh có dây vừa sạc không dây tiện lợi.'
    },
    {
      id: 'prod-018',
      name: 'iPhone 14 Pro Max 128GB (Cũ Đẹp 99% Like New)',
      category: 'old',
      brand: 'Apple',
      price: 20500000,
      salePrice: 17890000,
      stock: 22,
      isFlashSale: true,
      soldCount: 19,
      rating: 4.9,
      reviewsCount: 195,
      image: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Bảo Hành 1 Đổi 1 Trong 33 Ngày',
      installment: 'Trả góp 0% - 0 trả trước',
      storageOptions: ['128GB', '256GB'],
      colors: ['Tím Deep Purple', 'Vàng Gold', 'Đen Space Black', 'Bạc'],
      specs: {
        status: 'Máy đẹp 99%, zin nguyên bản 100%, chưa qua sửa chữa',
        battery: 'Pin từ 88% - 95% chất lượng cao',
        warranty: 'Bảo hành 1 đổi 1 trong 33 ngày, bảo hành 6 tháng rơi vỡ',
        screen: '6.7 inch OLED 120Hz ProMotion, Dynamic Island',
        chip: 'Apple A16 Bionic'
      },
      description: 'Lựa chọn số 1 phân khúc máy cũ tại Di Động Việt, kiểm định 32 bước nghiêm ngặt, an tâm tuyệt đối.'
    },
    {
      id: 'prod-019',
      name: 'Samsung Galaxy S23 Ultra 256GB (Cũ Đẹp 99%)',
      category: 'old',
      brand: 'Samsung',
      price: 16900000,
      salePrice: 13990000,
      stock: 14,
      isFlashSale: false,
      soldCount: 11,
      rating: 4.8,
      reviewsCount: 88,
      image: 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1584006682522-dc17d6c0d9ac?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Tiết kiệm 50% so với mua mới',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB'],
      colors: ['Xanh Botanic', 'Đen Phantom'],
      specs: {
        status: 'Đẹp 99% nguyên áp suất, màn hình đẹp không ám ố',
        screen: '6.8 inch Dynamic AMOLED 2X, 120Hz',
        chip: 'Snapdragon 8 Gen 2 for Galaxy',
        camera: '200MP Zoom 100x cực nét'
      },
      description: 'Sở hữu camera zoom 100x đẳng cấp với mức giá vô cùng dễ tiếp cận, kiểm định toàn diện.'
    },
    {
      id: 'prod-020',
      name: 'Ốp lưng Chống sốc MagSafe iPhone 16 Pro Max Torras',
      category: 'accessory',
      brand: 'Torras',
      price: 750000,
      salePrice: 550000,
      stock: 90,
      isFlashSale: false,
      soldCount: 45,
      rating: 4.9,
      reviewsCount: 112,
      image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Chống rơi vỡ chuẩn quân đội 3.6m',
      installment: '',
      storageOptions: ['Tiêu chuẩn'],
      colors: ['Trong suốt', 'Viền Titan Titan Tự Nhiên'],
      specs: {
        material: 'Polycarbonate cao cấp chống ố vàng 10 năm',
        features: 'Vòng nam châm từ tính MagSafe N52 mạnh mẽ'
      },
      description: 'Bảo vệ điện thoại toàn diện không sợ va đập, giữ trọn vẻ đẹp màu titan nguyên bản.'
    },
    {
      id: 'prod-021',
      name: 'Loa Bluetooth Di Động JBL Charge 5',
      category: 'audio',
      brand: 'JBL',
      price: 3990000,
      salePrice: 3190000,
      stock: 40,
      isFlashSale: true,
      soldCount: 35,
      rating: 4.9,
      reviewsCount: 94,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Chống nước bụi IP67',
      installment: 'Trả góp 0%',
      storageOptions: ['Tiêu chuẩn'],
      colors: ['Đen', 'Xanh Rằn Ri', 'Đỏ'],
      specs: {
        power: '40W RMS với củ loa trầm riêng biệt',
        battery: 'Thời gian chơi nhạc lên tới 20 giờ, kiêm sạc dự phòng cho điện thoại',
        features: 'PartyBoost ghép đôi nhiều loa cùng lúc'
      },
      description: 'Âm bass JBL Original Pro Sound mạnh mẽ bùng nổ mọi bữa tiệc dã ngoại.'
    },
    {
      id: 'prod-022',
      name: 'Tai nghe Chống Ồn Sony WH-1000XM5',
      category: 'audio',
      brand: 'Sony',
      price: 8990000,
      salePrice: 7490000,
      stock: 25,
      isFlashSale: false,
      soldCount: 16,
      rating: 5.0,
      reviewsCount: 108,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Chống ồn số 1 thế giới',
      installment: 'Trả góp 0%',
      storageOptions: ['Tiêu chuẩn'],
      colors: ['Đen', 'Bạc Ánh Kim', 'Midnight Blue'],
      specs: {
        driver: 'Bộ màng loa 30mm sợi carbon siêu nhẹ',
        chip: 'Bộ xử lý tích hợp V1 kết hợp HD QN1 với 8 micro chống ồn',
        battery: '30 giờ nghe liên tục, sạc nhanh 3 phút cho 3 giờ nghe'
      },
      description: 'Chuẩn mực tai nghe over-ear chống ồn đỉnh cao cho trải nghiệm âm thanh không tì vết.'
    },
    {
      id: 'prod-023',
      name: 'OPPO Reno12 5G 12GB/256GB',
      category: 'phone',
      brand: 'OPPO',
      price: 12990000,
      salePrice: 10990000,
      stock: 32,
      isFlashSale: true,
      soldCount: 28,
      rating: 4.8,
      reviewsCount: 76,
      image: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Chuyên gia Chân Dung AI',
      installment: 'Trả góp 0%',
      storageOptions: ['256GB'],
      colors: ['Bạc Vũ Trụ', 'Nâu Hoàng Hôn'],
      specs: {
        screen: '6.7 inch AMOLED cong 3D 120Hz 1.07 tỷ màu',
        chip: 'MediaTek Dimensity 7300-Energy 5G',
        camera: '50MP Sony LYT-600 OIS + 32MP Telephoto chân dung',
        battery: '5000 mAh, Siêu sạc nhanh SUPERVOOC 80W'
      },
      description: 'Thiết kế dòng chảy không gian tuyệt đẹp, hỗ trợ tính năng xóa vật thể AI thông minh.'
    },
    {
      id: 'prod-024',
      name: 'Đồng hồ Thể thao Thông minh Garmin Forerunner 165',
      category: 'watch',
      brand: 'Garmin',
      price: 7990000,
      salePrice: 6990000,
      stock: 20,
      isFlashSale: false,
      soldCount: 15,
      rating: 4.9,
      reviewsCount: 53,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
      ],
      badge: 'Màn hình AMOLED Cực Sáng',
      installment: 'Trả góp 0%',
      storageOptions: ['Tiêu chuẩn'],
      colors: ['Đen Xám', 'Trắng Xám', 'Turquoise'],
      specs: {
        screen: '1.2 inch AMOLED cảm ứng sắc nét',
        battery: 'Lên đến 11 ngày ở chế độ đồng hồ thông minh',
        features: 'Kế hoạch tập luyện Garmin Coach, Báo cáo buổi sáng, GPS độ chính xác cao'
      },
      description: 'Người bạn đồng hành hoàn hảo cho chạy bộ và theo dõi sức khỏe thể chất 24/7.'
    }
  ],

  vouchers: [
    { code: 'DIDONGVIET500', discount: 500000, minOrder: 10000000, desc: 'Giảm ngay 500.000đ cho đơn hàng từ 10.000.000đ' },
    { code: 'DDV200', discount: 200000, minOrder: 4000000, desc: 'Giảm ngay 200.000đ cho đơn từ 4.000.000đ' },
    { code: 'HSSV', discount: 300000, minOrder: 5000000, desc: 'Ưu đãi Học sinh - Sinh viên giảm thêm 300.000đ' },
    { code: 'FREESHIP', discount: 50000, minOrder: 500000, desc: 'Miễn phí vận chuyển hỏa tốc 1H trị giá 50.000đ' }
  ],

  orders: [
    {
      id: 'DDV-9821',
      createdAt: '2026-09-04 14:30',
      customerName: 'Nguyễn Văn An',
      phone: '0903123456',
      address: '123 Hai Bà Trưng, Phường Bến Nghé, Quận 1, TP.HCM',
      deliveryMethod: '1h',
      paymentMethod: 'vietqr',
      items: [
        {
          id: 'prod-001',
          name: 'iPhone 16 Pro Max 256GB',
          storage: '256GB',
          color: 'Titan Sa Mạc',
          price: 34490000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
        }
      ],
      voucherCode: 'DIDONGVIET500',
      discountAmount: 500000,
      totalAmount: 33990000,
      status: 'pending',
      paymentStatus: 'paid'
    },
    {
      id: 'DDV-9820',
      createdAt: '2026-09-04 11:15',
      customerName: 'Trần Thị Mai',
      phone: '0918765432',
      address: '45 Nguyễn Chí Thanh, Ba Đình, Hà Nội',
      deliveryMethod: 'store',
      paymentMethod: 'cod',
      items: [
        {
          id: 'prod-010',
          name: 'iPad Air M2 11 inch Wi-Fi 128GB',
          storage: '128GB',
          color: 'Blue Pastel',
          price: 15790000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80'
        }
      ],
      voucherCode: '',
      discountAmount: 0,
      totalAmount: 15790000,
      status: 'shipping',
      paymentStatus: 'pending'
    },
    {
      id: 'DDV-9819',
      createdAt: '2026-09-03 16:45',
      customerName: 'Lê Hoàng Nam',
      phone: '0934567890',
      address: '88 Lê Duẩn, Hải Châu, Đà Nẵng',
      deliveryMethod: '1h',
      paymentMethod: 'vietqr',
      items: [
        {
          id: 'prod-014',
          name: 'Tai nghe Apple AirPods Pro 2 (USB-C MagSafe)',
          storage: 'Tiêu chuẩn',
          color: 'Trắng',
          price: 5390000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80'
        },
        {
          id: 'prod-016',
          name: 'Củ sạc nhanh Anker Nano 30W PIQ 3.0',
          storage: '30W',
          color: 'Trắng',
          price: 319000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80'
        }
      ],
      voucherCode: 'FREESHIP',
      discountAmount: 50000,
      totalAmount: 5659000,
      status: 'completed',
      paymentStatus: 'paid'
    }
  ],

  customers: [
    {
      id: 'cust-01',
      name: 'Nguyễn Văn An',
      phone: '0903123456',
      email: 'an.nguyen@gmail.com',
      tier: 'VIP Kim Cương',
      ordersCount: 4,
      totalSpent: 89450000,
      joinedAt: '2024-01-15'
    },
    {
      id: 'cust-02',
      name: 'Trần Thị Mai',
      phone: '0918765432',
      email: 'mai.tran@gmail.com',
      tier: 'Hội Viên Vàng',
      ordersCount: 2,
      totalSpent: 32500000,
      joinedAt: '2024-06-10'
    },
    {
      id: 'cust-03',
      name: 'Lê Hoàng Nam',
      phone: '0934567890',
      email: 'nam.le@gmail.com',
      tier: 'Hội Viên Bạc',
      ordersCount: 1,
      totalSpent: 5659000,
      joinedAt: '2026-09-01'
    }
  ],

  tradeIns: [
    {
      id: 'TR-101',
      createdAt: '2026-09-04 15:10',
      customerName: 'Phạm Minh Tuấn',
      phone: '0978112233',
      oldBrand: 'Apple',
      oldModel: 'iPhone 14 Pro 128GB',
      condition: {
        body: 'like_new',
        screen: 'flawless',
        battery: 88,
        accessories: true
      },
      targetModel: 'iPhone 16 Pro Max 256GB',
      estimatedValue: 15500000,
      bonusSubsidy: 2000000,
      finalEstimatedValue: 17500000,
      preferredStore: '77 Trần Quang Khải, Q.1, TP.HCM',
      status: 'pending'
    }
  ],

  stores: [
    {
      id: 'store-01',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 1',
      address: '77 Trần Quang Khải, P. Tân Định, Quận 1',
      phone: '1800.6018 (Nhánh 1)',
      hours: '08:00 - 22:00 (Cả CN & Lễ)',
      features: ['Apple Authorised Reseller (AAR)', 'Khu trải nghiệm Samsung Galaxy AI', 'Thu cũ đổi mới tại chỗ', 'Giao 1H']
    },
    {
      id: 'store-02',
      city: 'TP. Hồ Chí Minh',
      district: 'Quận 6',
      address: '217 Bà Hom, Phường 13, Quận 6',
      phone: '1800.6018 (Nhánh 2)',
      hours: '08:00 - 21:30',
      features: ['Đầy đủ máy trải nghiệm', 'Bảo hành sửa chữa nhanh']
    },
    {
      id: 'store-03',
      city: 'TP. Hồ Chí Minh',
      district: 'Gò Vấp',
      address: '385 Quang Trung, Phường 10, Quận Gò Vấp',
      phone: '1800.6018 (Nhánh 3)',
      hours: '08:00 - 22:00',
      features: ['Chuyên gia Apple AAR', 'Hỗ trợ trả góp 0% duyệt 3 phút']
    },
    {
      id: 'store-04',
      city: 'Hà Nội',
      district: 'Đống Đa',
      address: '116 Thái Hà, P. Trung Liệt, Đống Đa',
      phone: '1800.6018 (Nhánh 4)',
      hours: '08:30 - 21:30',
      features: ['Trung tâm trải nghiệm công nghệ Flagship', 'Thu cũ trợ giá cao']
    },
    {
      id: 'store-05',
      city: 'Hà Nội',
      district: 'Thanh Xuân',
      address: '515 Nguyễn Trãi, P. Thanh Xuân Nam, Thanh Xuân',
      phone: '1800.6018 (Nhánh 5)',
      hours: '08:30 - 21:30',
      features: ['Khu phụ kiện cao cấp Anker, Baseus, JBL']
    },
    {
      id: 'store-06',
      city: 'Đà Nẵng',
      district: 'Thanh Khê',
      address: '60 Hàm Nghi, P. Thạc Gián, Quận Thanh Khê',
      phone: '1800.6018 (Nhánh 6)',
      hours: '08:00 - 21:30',
      features: ['Đại lý uỷ quyền chính hãng', 'Giao hàng hỏa tốc trong 1h']
    },
    {
      id: 'store-07',
      city: 'Bình Dương',
      district: 'Thủ Dầu Một',
      address: '417 Đại Lộ Bình Dương, P. Phú Cường, TP. Thủ Dầu Một',
      phone: '1800.6018 (Nhánh 7)',
      hours: '08:00 - 21:30',
      features: ['Bảo hành 1 đổi 1 vượt trội']
    }
  ]
};

// Initialize file if not exists
function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading store.json, resetting to initial data:', err);
    return INITIAL_DATA;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing store.json:', err);
    return false;
  }
}

module.exports = {
  loadData,
  saveData,
  INITIAL_DATA
};
