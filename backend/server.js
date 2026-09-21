require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Lead = require('./models/lead');
const { loadData, saveData } = require('./data/store');

const app = express();
const frontendPath = path.join(__dirname, '../frontend/public');
const adminSessions = new Set();

// Kết nối MongoDB nếu có cấu hình biến môi trường
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.log('Chạy với bộ lưu trữ dữ liệu JSON Data Store tại backend/data/store.json (Không yêu cầu MongoDB bên ngoài)');
}

// Middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Serve frontend static files
app.use(express.static(frontendPath));

// =================== AUTH APIS ===================

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedPassword) {
  const [salt, storedHash] = String(storedPassword || '').split(':');
  if (!salt || !storedHash) return false;

  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

function normalizeAccountKey(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function getCustomerProfile(account, data) {
  const customers = Array.isArray(data.customers) ? data.customers : [];
  const normalizedPhone = normalizeAccountKey(account.phone);
  const normalizedEmail = normalizeAccountKey(account.email);
  const customer = customers.find(item =>
    normalizeAccountKey(item.phone) === normalizedPhone ||
    (normalizedEmail && normalizeAccountKey(item.email) === normalizedEmail)
  );

  return {
    id: account.id,
    customerId: customer ? customer.id : undefined,
    name: (customer && customer.name) || account.name,
    phone: account.phone,
    email: account.email || (customer ? customer.email : ''),
    tier: (customer && customer.tier) || account.tier || 'Hội Viên Mới',
    ordersCount: customer ? (customer.ordersCount || 0) : 0,
    totalSpent: customer ? (customer.totalSpent || 0) : 0,
    joinedAt: customer ? customer.joinedAt : (account.createdAt ? account.createdAt.slice(0, 10) : ''),
    role: 'customer'
  };
}

app.post('/api/auth/register', (req, res) => {
  try {
    const data = loadData();
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu!' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    }
    if (!/^0\d{9,10}$/.test(String(phone).replace(/\s+/g, ''))) {
      return res.status(400).json({ success: false, message: 'Số điện thoại không hợp lệ!' });
    }

    data.authAccounts = Array.isArray(data.authAccounts) ? data.authAccounts : [];
    const normalizedPhone = normalizeAccountKey(phone);
    const normalizedEmail = normalizeAccountKey(email);
    const exists = data.authAccounts.some(account =>
      normalizeAccountKey(account.phone) === normalizedPhone ||
      (normalizedEmail && normalizeAccountKey(account.email) === normalizedEmail)
    );
    if (exists) {
      return res.status(409).json({ success: false, message: 'Số điện thoại hoặc email này đã được đăng ký!' });
    }

    const account = {
      id: 'account-' + Date.now().toString().slice(-8),
      name: String(name).trim(),
      phone: String(phone).replace(/\s+/g, ''),
      email: normalizedEmail ? String(email).trim().toLowerCase() : `${normalizedPhone}@gmail.com`,
      passwordHash: hashPassword(String(password)),
      tier: 'Hội Viên Mới',
      createdAt: new Date().toISOString()
    };

    data.authAccounts.push(account);
    const customer = data.customers.find(item => normalizeAccountKey(item.phone) === normalizedPhone);
    if (!customer) {
      data.customers.unshift({
        id: 'cust-' + Date.now().toString().slice(-5),
        name: account.name,
        phone: account.phone,
        email: account.email,
        tier: account.tier,
        ordersCount: 0,
        totalSpent: 0,
        joinedAt: new Date().toISOString().slice(0, 10)
      });
    }
    saveData(data);
    res.status(201).json({ success: true, message: 'Đăng ký thành công!', data: getCustomerProfile(account, data) });
  } catch (error) {
    console.error('POST /api/auth/register error:', error);
    res.status(500).json({ success: false, message: 'Không thể tạo tài khoản lúc này.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const data = loadData();
    const { login, password } = req.body;
    const normalizedLogin = normalizeAccountKey(login);

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@didongviet.vn').toLowerCase();
    if (normalizedLogin === adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'Đây là tài khoản Quản Trị Viên (Admin). Vui lòng nhấn vào "Quản Trị Admin" để đăng nhập!'
      });
    }

    const accounts = Array.isArray(data.authAccounts) ? data.authAccounts : [];
    const account = accounts.find(item =>
      normalizeAccountKey(item.phone) === normalizedLogin ||
      normalizeAccountKey(item.email) === normalizedLogin
    );

    if (!account || !verifyPassword(String(password || ''), account.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Số điện thoại/email hoặc mật khẩu không đúng!' });
    }

    const profile = getCustomerProfile(account, data);
    res.json({ success: true, message: 'Đăng nhập thành công!', data: profile });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    res.status(500).json({ success: false, message: 'Không thể đăng nhập lúc này.' });
  }
});

app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@didongviet.vn').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (cleanEmail !== adminEmail || password !== adminPassword) {
    const data = loadData();
    const accounts = Array.isArray(data.authAccounts) ? data.authAccounts : [];
    const isCustomer = accounts.some(a =>
      normalizeAccountKey(a.phone) === normalizeAccountKey(cleanEmail) ||
      normalizeAccountKey(a.email) === normalizeAccountKey(cleanEmail)
    );
    if (isCustomer) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản này là tài khoản Khách Hàng, không có quyền Quản Trị! Vui lòng đăng nhập tại mục Tài Khoản.'
      });
    }
    return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu quản trị không đúng!' });
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  adminSessions.add(sessionToken);

  res.json({
    success: true,
    message: 'Đăng nhập Admin thành công!',
    data: { name: 'Super Admin DDV', email: adminEmail, role: 'admin', sessionToken }
  });
});

app.get('/api/auth/admin-session', (req, res) => {
  if (!isValidAdminRequest(req)) {
    return res.status(401).json({ success: false, message: 'Phiên Admin không hợp lệ hoặc đã hết hạn.' });
  }

  res.json({ success: true, data: { role: 'admin', email: req.headers['x-admin-email'] } });
});

app.get('/api/auth/profile', (req, res) => {
  try {
    const { phone, email, id } = req.query;
    if (!phone && !email && !id) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin tra cứu tài khoản!' });
    }
    const data = loadData();
    const accounts = Array.isArray(data.authAccounts) ? data.authAccounts : [];
    const account = accounts.find(a =>
      (id && a.id === id) ||
      (phone && normalizeAccountKey(a.phone) === normalizeAccountKey(phone)) ||
      (email && normalizeAccountKey(a.email) === normalizeAccountKey(email))
    );

    if (!account) {
      const customer = (data.customers || []).find(c =>
        (phone && normalizeAccountKey(c.phone) === normalizeAccountKey(phone)) ||
        (email && normalizeAccountKey(c.email) === normalizeAccountKey(email))
      );
      if (customer) {
        return res.json({
          success: true,
          data: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            tier: customer.tier || 'Hội Viên Mới',
            ordersCount: customer.ordersCount || 0,
            totalSpent: customer.totalSpent || 0,
            joinedAt: customer.joinedAt,
            role: 'customer'
          }
        });
      }
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin tài khoản!' });
    }

    const profile = getCustomerProfile(account, data);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải thông tin tài khoản.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Đăng xuất tài khoản khách hàng thành công!' });
});

app.post('/api/auth/admin-logout', (req, res) => {
  const sessionToken = String(req.headers['x-admin-token'] || '');
  if (sessionToken) adminSessions.delete(sessionToken);
  res.json({ success: true, message: 'Đăng xuất quản trị Admin thành công!' });
});


// =================== PRODUCT APIS ===================

// GET /api/products - Danh sách sản phẩm kèm lọc & tìm kiếm
app.get('/api/products', (req, res) => {
  try {
    const data = loadData();
    let products = [...data.products];
    const { category, brand, search, sort, maxPrice, minPrice, isFlashSale } = req.query;

    if (category && category !== 'all') {
      if (category === 'apple') {
        products = products.filter(p => p.brand.toLowerCase() === 'apple');
      } else {
        products = products.filter(p => p.category === category);
      }
    }

    if (brand && brand !== 'all') {
      products = products.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (isFlashSale === 'true') {
      products = products.filter(p => p.isFlashSale === true);
    }

    if (minPrice) {
      products = products.filter(p => p.salePrice >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.salePrice <= Number(maxPrice));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (sort) {
      if (sort === 'price-asc') {
        products.sort((a, b) => a.salePrice - b.salePrice);
      } else if (sort === 'price-desc') {
        products.sort((a, b) => b.salePrice - a.salePrice);
      } else if (sort === 'rating') {
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sort === 'sales') {
        products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      } else if (sort === 'discount') {
        products.sort((a, b) => ((b.price - b.salePrice) / b.price) - ((a.price - a.salePrice) / a.price));
      }
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tải danh sách sản phẩm' });
  }
});

// GET /api/products/:id - Chi tiết 1 sản phẩm
app.get('/api/products/:id', (req, res) => {
  try {
    const data = loadData();
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Middleware kiểm tra quyền Quản trị viên (Admin)
function isValidAdminRequest(req) {
  const role = req.headers['x-user-role'];
  const email = req.headers['x-admin-email'];
  const sessionToken = String(req.headers['x-admin-token'] || '');
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@didongviet.vn').toLowerCase();

  return role === 'admin' && String(email || '').trim().toLowerCase() === adminEmail && adminSessions.has(sessionToken);
}

function requireAdmin(req, res, next) {
  if (isValidAdminRequest(req)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Bạn không có quyền thực hiện thao tác này! Chỉ Quản Trị Viên (Admin) mới có quyền thêm, sửa hoặc xóa sản phẩm.'
  });
}

// POST /api/products - Thêm sản phẩm mới (Chỉ Admin)
app.post('/api/products', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    const { name, category, brand, price, salePrice, stock, image, badge, installment, storageOptions, colors, specs, description, isFlashSale } = req.body;

    if (!name || !price || !salePrice) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tên, giá niêm yết và giá bán!' });
    }

    const newProduct = {
      id: 'prod-' + Date.now().toString().slice(-6),
      name,
      category: category || 'phone',
      brand: brand || 'Apple',
      price: Number(price),
      salePrice: Number(salePrice),
      stock: Number(stock) || 10,
      isFlashSale: Boolean(isFlashSale),
      soldCount: 0,
      rating: 5.0,
      reviewsCount: 1,
      image: image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      badge: badge || 'Chính Hãng VN/A',
      installment: installment || 'Trả góp 0%',
      storageOptions: Array.isArray(storageOptions) ? storageOptions : (storageOptions ? storageOptions.split(',').map(s => s.trim()) : ['128GB', '256GB']),
      colors: Array.isArray(colors) ? colors : (colors ? colors.split(',').map(c => c.trim()) : ['Đen', 'Bạc']),
      specs: specs || { screen: 'OLED', chip: 'Mạnh mẽ', ram: '8GB', storage: '128GB' },
      description: description || 'Sản phẩm chính hãng phân phối tại Di Động Việt.'
    };

    data.products.unshift(newProduct);
    saveData(data);

    res.status(201).json({ success: true, message: 'Thêm sản phẩm thành công!', data: newProduct });
  } catch (error) {
    console.error('POST /api/products error:', error);
    res.status(500).json({ success: false, message: 'Lỗi tạo sản phẩm' });
  }
});

// PUT /api/products/:id - Cập nhật sản phẩm (Chỉ Admin)
app.put('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    const index = data.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần sửa' });
    }

    const updated = {
      ...data.products[index],
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : data.products[index].price,
      salePrice: req.body.salePrice !== undefined ? Number(req.body.salePrice) : data.products[index].salePrice,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : data.products[index].stock
    };

    data.products[index] = updated;
    saveData(data);

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật sản phẩm' });
  }
});

// DELETE /api/products/:id - Xóa sản phẩm (Chỉ Admin)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    const prevLen = data.products.length;
    data.products = data.products.filter(p => p.id !== req.params.id);

    if (data.products.length === prevLen) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm cần xóa' });
    }

    saveData(data);
    res.json({ success: true, message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xóa sản phẩm' });
  }
});

// =================== ORDER APIS ===================

// GET /api/orders - Lấy danh sách hoặc tra cứu đơn hàng
app.get('/api/orders', (req, res) => {
  try {
    const data = loadData();
    const { phone, id } = req.query;

    if (!phone && !id && !isValidAdminRequest(req)) {
      return res.status(403).json({ success: false, message: 'Chỉ Quản Trị Viên mới được xem toàn bộ đơn hàng.' });
    }

    if (id) {
      const order = data.orders.find(o => o.id.toLowerCase() === id.trim().toLowerCase());
      if (!order) return res.status(404).json({ success: false, message: 'Không tìm thấy mã đơn hàng ' + id });
      return res.json({ success: true, data: order });
    }

    if (phone) {
      const matched = data.orders.filter(o => o.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
      return res.json({ success: true, data: matched });
    }

    res.json({ success: true, count: data.orders.length, data: data.orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tải đơn hàng' });
  }
});

// POST /api/orders - Đặt hàng mới
app.post('/api/orders', (req, res) => {
  try {
    const data = loadData();
    const { customerName, phone, address, deliveryMethod, paymentMethod, items, voucherCode, discountAmount, totalAmount } = req.body;

    if (!customerName || !phone || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ thông tin khách hàng và giỏ hàng!' });
    }

    const newOrderId = 'DDV-' + Math.floor(1000 + Math.random() * 9000);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newOrder = {
      id: newOrderId,
      createdAt: dateStr,
      customerName,
      phone,
      address: address || 'Nhận tại cửa hàng Di Động Việt',
      deliveryMethod: deliveryMethod || '1h',
      paymentMethod: paymentMethod || 'cod',
      items,
      voucherCode: voucherCode || '',
      discountAmount: Number(discountAmount) || 0,
      totalAmount: Number(totalAmount),
      status: 'pending',
      paymentStatus: paymentMethod === 'vietqr' ? 'paid' : 'pending'
    };

    data.orders.unshift(newOrder);

    // Cập nhật hoặc ghi nhận khách hàng
    let customer = data.customers.find(c => c.phone === phone);
    if (customer) {
      customer.ordersCount += 1;
      customer.totalSpent += Number(totalAmount);
      if (customer.totalSpent > 80000000) customer.tier = 'VIP Kim Cương';
      else if (customer.totalSpent > 30000000) customer.tier = 'Hội Viên Vàng';
      else if (customer.totalSpent > 10000000) customer.tier = 'Hội Viên Bạc';
    } else {
      data.customers.unshift({
        id: 'cust-' + Date.now().toString().slice(-5),
        name: customerName,
        phone,
        email: req.body.email || `${phone}@khachhang.didongviet.vn`,
        tier: 'Hội Viên Mới',
        ordersCount: 1,
        totalSpent: Number(totalAmount),
        joinedAt: dateStr.split(' ')[0]
      });
      customer = data.customers[0];
    }

    // Đồng bộ cập nhật tier vào authAccounts nếu có tài khoản
    const normalizedOrderPhone = normalizeAccountKey(phone);
    const authAcc = (data.authAccounts || []).find(a => normalizeAccountKey(a.phone) === normalizedOrderPhone);
    if (authAcc && customer) {
      authAcc.tier = customer.tier;
    }

    saveData(data);

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công! Mã đơn hàng của bạn là: ' + newOrderId,
      data: newOrder
    });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    res.status(500).json({ success: false, message: 'Lỗi đặt hàng, vui lòng thử lại!' });
  }
});

// PATCH /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Admin)
app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    const order = data.orders.find(o => o.id.toLowerCase() === req.params.id.toLowerCase());
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    const { status, paymentStatus } = req.body;
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    saveData(data);
    res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái đơn' });
  }
});

// =================== VOUCHER APIS ===================

// GET /api/vouchers
app.get('/api/vouchers', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    res.json({ success: true, data: data.vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi voucher' });
  }
});

// POST /api/vouchers/apply
app.post('/api/vouchers/apply', (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Vui lòng nhập mã voucher' });

    const data = loadData();
    const voucher = data.vouchers.find(v => v.code.toUpperCase() === code.toUpperCase().trim());

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Mã khuyến mãi không tồn tại hoặc đã hết hạn!' });
    }

    if (orderTotal && orderTotal < voucher.minOrder) {
      return res.status(400).json({
        success: false,
        message: `Mã ${voucher.code} chỉ áp dụng cho đơn từ ${voucher.minOrder.toLocaleString('vi-VN')}đ!`
      });
    }

    res.json({
      success: true,
      message: `Áp dụng thành công! Giảm ${voucher.discount.toLocaleString('vi-VN')}đ`,
      data: voucher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xử lý mã giảm giá' });
  }
});

// =================== TRADE-IN (THU CŨ ĐỔI MỚI) APIS ===================

app.get('/api/trade-in', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    res.json({ success: true, data: data.tradeIns });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi danh sách thu cũ' });
  }
});

app.post('/api/trade-in', (req, res) => {
  try {
    const data = loadData();
    const { customerName, phone, oldBrand, oldModel, condition, targetModel, estimatedValue, preferredStore } = req.body;

    if (!customerName || !phone || !oldModel) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ họ tên, SĐT và model máy cũ!' });
    }

    const subsidy = 2000000; // Trợ giá độc quyền Di Động Việt 2.000.000đ
    const baseVal = Number(estimatedValue) || 12000000;
    const finalVal = baseVal + subsidy;

    const newTradeIn = {
      id: 'TR-' + Math.floor(100 + Math.random() * 900),
      createdAt: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
      customerName,
      phone,
      oldBrand: oldBrand || 'Apple',
      oldModel,
      condition: condition || { body: 'like_new', screen: 'flawless', battery: 90, accessories: true },
      targetModel: targetModel || 'iPhone 16 Pro Max',
      estimatedValue: baseVal,
      bonusSubsidy: subsidy,
      finalEstimatedValue: finalVal,
      preferredStore: preferredStore || '77 Trần Quang Khải, Q.1, TP.HCM',
      status: 'pending'
    };

    data.tradeIns.unshift(newTradeIn);
    saveData(data);

    res.status(201).json({
      success: true,
      message: `Định giá thành công: ${finalVal.toLocaleString('vi-VN')}đ (Đã bao gồm trợ giá 2.000.000đ). Tư vấn viên sẽ liên hệ ngay!`,
      data: newTradeIn
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi định giá thu cũ' });
  }
});

// =================== STORES & CUSTOMERS APIS ===================

app.get('/api/stores', (req, res) => {
  try {
    const data = loadData();
    res.json({ success: true, data: data.stores });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi hệ thống cửa hàng' });
  }
});

app.get('/api/customers', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    res.json({ success: true, count: data.customers.length, data: data.customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi danh sách khách hàng' });
  }
});

// =================== ADMIN STATS API ===================

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const data = loadData();
    const totalOrders = data.orders.length;
    const totalRevenue = data.orders.reduce((acc, curr) => acc + (curr.status !== 'cancelled' ? curr.totalAmount : 0), 0);
    const totalCustomers = data.customers.length;
    const totalProducts = data.products.length;

    // Đếm theo danh mục
    const categoryCounts = {};
    data.products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    // Đơn hàng cần xử lý (pending)
    const pendingOrders = data.orders.filter(o => o.status === 'pending').length;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalCustomers,
        totalProducts,
        categoryCounts,
        recentOrders: data.orders.slice(0, 5)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi thống kê admin' });
  }
});

// =================== COMPATIBILITY LEAD FORM ===================

app.post('/api/consult', async (req, res) => {
  try {
    const { fullName, phone, interestedModel } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đủ Họ tên và SĐT!' });
    }

    if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
      const newlead = new Lead({ fullName, phone, interestedModel });
      await newlead.save();
    }

    res.status(201).json({ success: true, message: 'Đã gửi thông tin! Di Động Việt sẽ liên hệ bạn ngay trong 5 phút.' });
  } catch (error) {
    console.error('POST /api/consult error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server, vui lòng thử lại!' });
  }
});

// Default fallback to index.html for SPA/HTML
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Di Động Việt Server đang chạy tại http://localhost:${PORT}`));