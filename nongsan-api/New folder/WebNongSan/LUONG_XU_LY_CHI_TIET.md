# LUỒNG XỬ LÝ CHI TIẾT - WebNongSan

**Tiêu đề**: Tài liệu mô tả chi tiết luồng xử lý của tất cả các đường vào cho User/Customer, Vendor, và Admin.

**Ngày tạo**: 04/04/2026
**Dự án**: WebNongSan - Nền tảng bán nông sản trực tuyến

---

## MỤC LỤC

1. [PHẦN I: XÁC THỰC & PHÂN QUYỀN](#phần-i-xác-thực--phân-quyền)
2. [PHẦN II: USER / CUSTOMER](#phần-ii-user--customer)
3. [PHẦN III: VENDOR](#phần-iii-vendor)
4. [PHẦN IV: ADMIN](#phần-iv-admin)
5. [PHẦN V: HỆ THỐNG CHUNG](#phần-v-hệ-thống-chung)

---

# PHẦN I: XÁC THỰC & PHÂN QUYỀN

## 1. ĐĂNG KÝ TÀI KHOẢN

### Route & Endpoint
- **Frontend**: `/vendor/register` (Vendor registration page)
- **API**: `POST /api/register.php`
- **Mục đích**: Tạo tài khoản mới cho người dùng

### Luồng xử lý:
1. **Nhận dữ liệu từ client**:
   - name (Tên người dùng)
   - email (Email)
   - password (Mật khẩu)

2. **Validation**:
   - ✅ Kiểm tra tất cả trường không được để trống
   - ✅ Validate email theo định dạng RFC
   - ✅ Validate mật khẩu (tối thiểu 6 ký tự)
   - ✅ Kiểm tra email chưa được sử dụng trong DB
   
3. **Xử lý**:
   - role được cố định là "vendor" (KHÔNG ĐƯỢC CLIENT GỬI)
   - Hash password bằng PASSWORD_BCRYPT
   - Tạo user mới trong bảng users
   - Thiết lập is_online = 1

4. **Ghi log**:
   - Ghi Audit Log: "VENDOR {name} (id {id}) đã đăng ký tài khoản"

5. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Đăng ký tài khoản thành công"
   }
   ```

### Phân quyền:
- ❌ Không cần xác thực (công khai)

### Lỗi có thể xảy ra:
- Email không hợp lệ → HTTP 400
- Email đã được sử dụng → HTTP 409
- Mật khẩu quá ngắn → HTTP 400
- Lỗi hệ thống → HTTP 500

---

## 2. ĐĂNG NHẬP

### Route & Endpoint
- **Frontend**: `/vendor/login`, `/admin`, `/customer/login` (tùy role)
- **API**: `POST /api/login.php`
- **Mục đích**: Xác thực người dùng và cấp JWT token

### Luồng xử lý:
1. **Nhận dữ liệu từ client**:
   - email (Email)
   - password (Mật khẩu)

2. **Rate Limiting**:
   - Giới hạn 7 lần đăng nhập thất bại trong 600 giây (10 phút)
   - Nếu vượt quá → Trả về lỗi Rate Limit

3. **Validation & Xác thực**:
   - ✅ Kiểm tra email có tồn tại trong DB
   - ✅ So sánh password với hash trong DB
   - Nếu sai → Trả về lỗi "Email hoặc mật khẩu không chính xác"

4. **Kiểm tra Role**:
   - Role phải là: admin, vendor, customer hoặc user
   - Role khác → Không được phép đăng nhập

5. **Cập nhật trạng thái**:
   - Thiết lập is_online = 1 cho user
   - Cập nhật last_login time (nếu có)

6. **Tạo JWT Token**:
   - Payload: 
     ```json
     {
       "id": user_id,
       "role": role,
       "exp": time() + 86400 (24 giờ)
     }
     ```

7. **Ghi log**:
   - Ghi Audit Log: "{ROLE} {name} (id {id}) đã đăng nhập"

8. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Đăng nhập thành công",
     "token": "JWT_TOKEN_HERE",
     "user": {
       "id": user_id,
       "name": "...",
       "email": "...",
       "role": "vendor|admin|customer",
       "is_approved": 0|1|2,
       "is_online": 1,
       "avatar": "...",
       "...": "..."
     }
   }
   ```

### Phân quyền:
- ❌ Không cần xác thực (công khai)

### Lỗi có thể xảy ra:
- Email hoặc mật khẩu sai → HTTP 401
- Rate limit vượt quá → HTTP 429
- Role không hợp lệ → HTTP 403

---

## 3. ĐĂNG XUẤT

### Route & Endpoint
- **API**: `POST /api/logout.php`
- **Mục đích**: Hủy phiên đăng nhập và cập nhật trạng thái

### Luồng xử lý:
1. **Lấy JWT từ header Authorization**
2. **Validate JWT**
3. **Cập nhật trạng thái**:
   - Thiết lập is_online = 0 cho user
   - Cập nhật last_logout time (nếu có)
4. **Ghi log**:
   - Ghi Audit Log: "{ROLE} {name} (id {id}) đã đăng xuất"
5. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Đăng xuất thành công"
   }
   ```

### Phân quyền:
- ✅ Cần có JWT token hợp lệ (Protected route)

---

## 4. RESET MẬT KHẨU

### Route & Endpoint
- **API**: `POST /api/forgot_password_init.php`
- **API**: `POST /api/verify_reset_otp.php`
- **API**: `POST /api/reset_password.php`

### Luồng xử lý:

#### Bước 1: Yêu cầu reset (forgot_password_init.php)
1. Nhận email từ client
2. Kiểm tra email có tồn tại trong DB
3. **Nếu tồn tại**:
   - Tạo OTP 6 chữ số ngẫu nhiên
   - Lưu OTP vào DB (bảng password_resets)
   - Gửi OTP qua email (PHPMailer)
4. Trả về: "Email reset link đã được gửi"

#### Bước 2: Xác thực OTP (verify_reset_otp.php)
1. Nhận email và OTP từ client
2. Kiểm tra OTP có hợp lệ trong DB (kiểm tra expiry time)
3. Trả về: {"status": "success"} hoặc lỗi

#### Bước 3: Đặt mật khẩu mới (reset_password.php)
1. Nhận email, OTP, password mới
2. Xác thực OTP lần nữa
3. Hash password mới
4. Cập nhật password trong DB
5. Xóa OTP từ DB
6. Ghi log: "{name} đã reset mật khẩu"
7. Trả về: "Mật khẩu đã được cập nhật"

### Phân quyền:
- ❌ Không cần xác thực (công khai)

---

# PHẦN II: USER / CUSTOMER

## A. QUẢN LÝ HỒ SƠ

### 1. LẤY THÔNG TIN HỒ SƠ

#### Route & Endpoint
- **Frontend**: Trên mọi trang user (thông tin sidebar, profile page)
- **API**: `GET /api/get_profile.php`

#### Luồng xử lý:
1. **Nhận JWT token từ header Authorization**
2. **Validate & giải mã JWT**:
   - Kiểm tra token hợp lệ
   - Lấy user_id từ token
3. **Lấy dữ liệu user từ DB**:
   ```sql
   SELECT id, name, email, phone, address, avatar, 
          role, is_online, created_at, is_approved
   FROM users WHERE id = :id
   ```
4. **Kiểm tra user tồn tại**
5. **Trả về Response**:
   ```json
   {
     "status": "success",
     "user": {
       "id": "...",
       "name": "...",
       "email": "...",
       "phone": "...",
       "address": "...",
       "avatar": "...",
       "role": "customer",
       "is_online": 1,
       "created_at": "..."
     }
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token (Protected route)
- ✅ User chỉ được xem profile của chính mình

---

### 2. CẬP NHẬT HỒ SƠ

#### Route & Endpoint
- **Frontend**: `/customer/profile/edit` (Profile edit page)
- **API**: `POST /api/update_profile.php`

#### Luồng xử lý:
1. **Nhận dữ liệu FormData từ client**:
   - id (User ID)
   - name
   - phone
   - address
   - description
   - avatar (File ảnh - optional)

2. **Validation**:
   - ✅ Kiểm tra ID chứa đầy đủ
   - ✅ Kiểm tra email không trùng (nếu thay đổi)
   - ✅ Kiểm tra phone format (nếu có)

3. **Xử lý upload ảnh** (nếu có):
   - Validate extension (.jpg, .jpeg, .png, .gif, .webp)
   - Tạo filename: timestamp + filename gốc
   - Di chuyển file vào thư mục: `uploads/avatars/`
   - Lưu URL đầy đủ: `http://localhost/nongsan-api/uploads/avatars/{filename}`

4. **Cập nhật DB**:
   ```sql
   UPDATE users SET 
     name = :name,
     phone = :phone,
     address = :address,
     description = :description,
     avatar = :avatar (nếu có)
   WHERE id = :id
   ```

5. **Ghi log**:
   - "CUSTOMER {name} (id {id}) đã cập nhật hồ sơ cá nhân"

6. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Cập nhật hồ sơ thành công",
     "user": {...}
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ User chỉ được cập nhật profile của chính mình

---

## B. QUẢN LÝ ĐƠN HÀNG & THANH TOÁN

### 1. TẠO ĐƠN HÀNG (CHECKOUT)

#### Route & Endpoint
- **Frontend**: `/customer/checkout` page
- **API**: `POST /api/api_orders.php?action=create_order`

#### Luồng xử lý:
1. **Nhận JWT token từ header Authorization**
2. **Validate JWT & lấy user_id**

3. **Nhận dữ liệu từ client**:
   ```json
   {
     "items": [
       {
         "product_id": 1,
         "quantity": 2,
         "price": 50000
       },
       {...}
     ],
     "shipping_address": {...},
     "payment_method": "vnpay|cod|momo",
     "notes": "..."
   }
   ```

4. **Validation**:
   - ✅ Kiểm tra items không trống
   - ✅ Kiểm tra quantity > 0
   - ✅ Kiểm tra product tồn tại trong DB
   - ✅ Kiểm tra stock đủ

5. **Tính toán**:
   - Tổng tiền = SUM(price * quantity)
   - Phí vận chuyển (nếu có)
   - Chiết khấu/Voucher (nếu có)
   - Tổng cộng = Tổng tiền + phí vận chuyển - chiết khấu

6. **Tạo order trong DB**:
   ```sql
   INSERT INTO orders (
     user_id, total_amount, status, payment_method,
     shipping_address, notes, created_at
   ) VALUES (...)
   ```

7. **Tạo order_items cho mỗi sản phẩm**:
   ```sql
   INSERT INTO order_items (
     order_id, product_id, quantity, price, vendor_id
   ) VALUES (...)
   ```

8. **Cập nhật stock sản phẩm**:
   ```sql
   UPDATE products SET stock = stock - :quantity WHERE id = :product_id
   ```

9. **Tạo payment record** (nếu thanh toán online):
   - Payment method: vnpay | momo | cod
   - Status: "pending"

10. **Ghi log**:
    - "CUSTOMER {name} (id {id}) đã tạo đơn hàng #{order_id}"

11. **Tạo notification** cho vendor:
    - Gửi notification đến vendor sản phẩm: "Bạn có đơn hàng mới"

12. **Trả về Response**:
    ```json
    {
      "status": "success",
      "order_id": 123,
      "message": "Tạo đơn hàng thành công",
      "redirect_url": "..." (nếu thanh toán online)
    }
    ```

#### Phân quyền:
- ✅ Cần JWT token (Protected route)
- ✅ Role phải là "customer" hoặc "user"

---

### 2. LẤY DANH SÁCH ĐƠN HÀNG

#### Route & Endpoint
- **Frontend**: `/customer/orders` page
- **API**: `GET /api/api_orders.php?action=get_orders`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Lấy tất cả order của user từ DB**:
   ```sql
   SELECT o.*, od.name, od.avatar
   FROM orders o
   JOIN order_details od ON o.id = od.order_id
   WHERE o.user_id = :user_id
   ORDER BY o.created_at DESC
   ```
3. **Trả về Response**:
   ```json
   {
     "status": "success",
     "orders": [
       {
         "order_id": 123,
         "status": "Pending",
         "total_amount": 500000,
         "created_at": "2026-04-04",
         "items": [...]
       },
       {...}
     ]
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ User chỉ nhìn thấy order của chính mình

---

### 3. LẤY CHI TIẾT ĐƠN HÀNG

#### Route & Endpoint
- **API**: `GET /api/api_orders.php?action=get_order&order_id=123`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Kiểm tra order tồn tại & thuộc về user**:
   ```sql
   SELECT * FROM orders WHERE id = :order_id AND user_id = :user_id
   ```
3. **Lấy order_items**:
   ```sql
   SELECT oi.*, p.name, p.images, v.name as vendor_name
   FROM order_items oi
   JOIN products p ON oi.product_id = p.id
   JOIN users v ON v.id = oi.vendor_id
   WHERE oi.order_id = :order_id
   ```
4. **Trả về Response**:
   ```json
   {
     "status": "success",
     "order": {
       "id": 123,
       "status": "...",
       "payment_status": "...",
       "items": [...],
       "shipping_address": {...},
       "total_amount": ...,
       "created_at": "..."
     }
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ User chỉ được xem order của chính mình

---

### 4. HỦY ĐƠN HÀNG

#### Route & Endpoint
- **API**: `POST /api/cancel_order.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Nhận order_id từ client**
3. **Kiểm tra order tồn tại & thuộc về user**
4. **Kiểm tra trạng thái order**:
   - ✅ Chỉ được hủy nếu status = "Pending" hoặc "Chờ lấy hàng"
   - ❌ Không được hủy nếu đang giao hoặc đã giao

5. **Cập nhật order status**:
   ```sql
   UPDATE orders SET status = 'Cancelled' WHERE id = :order_id
   ```

6. **Hoàn lại stock sản phẩm**:
   - Lấy tất cả order_items theo order_id
   - Cộng lại quantities vào product stock

7. **Hoàn tiền** (nếu đã thanh toán):
   - Nếu payment_status = "completed"
   - Tạo refund record
   - Cập nhật payment_status = "refunded"

8. **Ghi log**:
   - "CUSTOMER {name} (id {id}) đã hủy đơn hàng #{order_id}"

9. **Tạo notification** cho vendor:
   - "Đơn hàng #{order_id} đã bị hủy bởi khách"

10. **Trả về Response**:
    ```json
    {
      "status": "success",
      "message": "Hủy đơn hàng thành công"
    }
    ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ User chỉ được hủy order của chính mình

---

### 5. THEO DÕI ĐƠN HÀNG

#### Route & Endpoint
- **Frontend**: `/customer/order/:id/tracking` page
- **API**: `GET /api/get_shipping.php?order_id=123`

#### Luồng xử lý:
1. **Validate JWT**
2. **Kiểm tra order tồn tại & thuộc về user**
3. **Lấy thông tin shipping từ DB**:
   ```sql
   SELECT * FROM shipping WHERE order_id = :order_id
   ```
4. **Map trạng thái từ DB (Tiếng Việt) sang UI (Tiếng Anh)**:
   - "Chờ lấy hàng" → "Pending"
   - "Đang giao hàng" → "Shipping"
   - "Đã giao hàng" → "Completed"
   - "Đã hủy" → "Cancelled"

5. **Trả về Response**:
   ```json
   {
     "status": "success",
     "shipping": {
       "order_id": 123,
       "status": "Shipping",
       "carrier": "GHN",
       "tracking_number": "...",
       "estimated_delivery": "...",
       "current_location": "...",
       "updates": [...]
     }
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ User chỉ được xem shipping của order của chính mình

---

### 6. ĐỀ XUẤT / GIỎ HÀNG

#### Route & Endpoint
- **API**: `POST /api/add_to_cart.php` (nếu có)
- **API**: `GET /api/get_cart.php`

#### Luồng xử lý:
- (Tùy thuộc vào kiến trúc hiện tại của bạn - có thể lưu ở localStorage hoặc DB)

---

# PHẦN III: VENDOR

## A. QUẢN LÝ HỒ SƠ VENDOR

### 1. LẤY THÔNG TIN HỒ SƠ VENDOR

#### Route & Endpoint
- **Frontend**: `/vendor/vendorprofile` page
- **API**: `GET /api/get_profile.php` (chung với customer)

#### Luồng xử lý: Giống như customer ở PHẦN II.A.1

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "vendor"
- ✅ Vendor chỉ được xem profile của chính mình

---

### 2. CẬP NHẬT HỒ SƠ VENDOR

#### Route & Endpoint
- **Frontend**: `/vendor/vendorprofile` (edit mode)
- **API**: `POST /api/update_profile.php` (chung với customer)

#### Luồng xử lý: Giống như customer ở PHẦN II.A.2

#### Fields thêm cho vendor:
- shop_name (Tên cửa hàng)
- description (Mô tả về hàng)
- business_license (Số ĐKDN)
- tax_id (Mã số thuế)

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "vendor"

---

## B. QUẢN LÝ SẢN PHẨM

### 1. THÊM SẢN PHẨM

#### Route & Endpoint
- **Frontend**: `/vendor/products` page (add product form)
- **API**: `POST /api/add_product.php`

#### Luồng xử lý:
1. **Nhận JWT từ header Authorization**
2. **Validate & giải mã JWT**:
   - Lấy user_id từ token payload

3. **Kiểm tra phân quyền**:
   - ✅ User phải tồn tại trong DB
   - ✅ Role phải là "vendor"
   - ❌ Nếu không → Trả về lỗi 403

4. **Kiểm tra approval**:
   - ✅ is_approved phải = 1 (vendor đã được admin duyệt)
   - ❌ Nếu = 0 (chờ duyệt) → Trả về "Tài khoản Vendor chưa được duyệt bởi Admin"
   - ❌ Nếu = 2 (bị cấm) → Trả về "Tài khoản Vendor bị cấm"

5. **Nhận dữ liệu sản phẩm từ client**:
   ```json
   {
     "name": "Rau cải xanh",
     "category": "Rau xanh",
     "price": 50000,
     "stock": 100,
     "unit": "kg",
     "origin": "Hà Nội",
     "description": "Rau cải xanh tươi sạch...",
     "images": ["base64_string_1", "base64_string_2"]
   }
   ```

6. **Validation**:
   - ✅ Kiểm tra tên sản phẩm (tối thiểu 3 ký tự)
   - ✅ Kiểm tra price > 0
   - ✅ Kiểm tra stock >= 0
   - ✅ Kiểm tra category hợp lệ
   - ✅ Kiểm tra images (tối đa 5 ảnh)

7. **Xử lý upload ảnh**:
   - Giải mã base64 từ client
   - Tạo filename: timestamp + random
   - Lưu vào thư mục: `uploads/products/`
   - Tạo danh sách URLs

8. **Tạo sản phẩm trong DB**:
   ```sql
   INSERT INTO products (
     vendor_id, name, category, price, stock, unit, origin,
     description, status, approval_status, is_banned, images
   ) VALUES (...)
   ```
   - vendor_id = user_id
   - status = "active" (sản phẩm hoạt động)
   - approval_status = "pending" (chờ admin duyệt)
   - is_banned = 0 (chưa bị cấm)

9. **Ghi log**:
   - "Vendor id {user_id} đã thêm sản phẩm {name}"

10. **Tạo notification** cho admin:
    - "Sản phẩm mới '{name}' cần phê duyệt từ vendor {vendor_name}"

11. **Trả về Response**:
    ```json
    {
      "status": "success",
      "product_id": 456,
      "message": "Thêm sản phẩm thành công, vui lòng chờ Admin phê duyệt"
    }
    ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Cần role = "vendor"
- ✅ Cần is_approved = 1 (đã được admin duyệt)

#### Lỗi có thể xảy ra:
- Vendor chưa được duyệt → HTTP 403
- Vendor bị cấm → HTTP 403
- Dữ liệu không hợp lệ → HTTP 400

---

### 2. CẬP NHẬT SẢN PHẨM

#### Route & Endpoint
- **Frontend**: `/vendor/products/:id/edit` page
- **API**: `POST /api/update_product.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Nhận product_id từ client**
3. **Kiểm tra sản phẩm tồn tại**:
   ```sql
   SELECT * FROM products WHERE id = :product_id
   ```
4. **Kiểm tra quyền sở hữu**:
   - ✅ vendor_id phải = user_id (vendor chỉ sửa sản phẩm của chính mình)
   - ❌ Nếu khác user_id → Trả về 403

5. **Kiểm tra trạng thái sản phẩm**:
   - ✅ Nếu approval_status = "pending" hoặc "approved" → Có thể sửa
   - ❌ Nếu approval_status = "rejected" → Phải sửa lại thông tin trước

6. **Cập nhật dữ liệu**:
   ```sql
   UPDATE products SET 
     name = :name,
     price = :price,
     stock = :stock,
     ...
   WHERE id = :product_id
   ```
   - approval_status sẽ được reset về "pending" khi sửa
   - Admin sẽ được thông báo để duyệt lại

7. **Ghi log**:
   - "Vendor {name} (id {user_id}) cập nhật sản phẩm {product_id}"

8. **Tạo notification** cho admin:
   - "Sản phẩm '{name}' đã được cập nhật, cần phê duyệt lại"

9. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Cập nhật sản phẩm thành công"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ được sửa sản phẩm của chính mình

---

### 3. XÓA SẢN PHẨM

#### Route & Endpoint
- **API**: `POST /api/delete_product.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Kiểm tra quyền sở hữu sản phẩm**
3. **Kiểm tra sản phẩm**:
   - ❌ Nếu sản phẩm đã có trong đơn hàng hoàn thành → Không được xóa
   - ✅ Nếu chưa có đơn hàng hoặc đơn hàng đang pending → Có thể xóa

4. **Xóa ảnh từ thư mục uploads**
5. **Xóa record sản phẩm từ DB**
6. **Ghi log**: "Vendor {name} (id {user_id}) đã xóa sản phẩm {product_id}"
7. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Xóa sản phẩm thành công"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ được xóa sản phẩm của chính mình

---

### 4. LẤY DANH SÁCH SẢN PHẨM CỦA VENDOR

#### Route & Endpoint
- **Frontend**: `/vendor/products` page (danh sách sản phẩm)
- **API**: `GET /api/get_products.php?vendor_id=123`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Kiểm tra vendor_id từ query params**:
   - ✅ Nếu vendor_id = user_id → Lấy danh sách đầy đủ (kể cả draft, pending)
   - ❌ Nếu vendor_id ≠ user_id → Chỉ lấy approved products

3. **Lấy dữ liệu từ DB**:
   ```sql
   SELECT * FROM products 
   WHERE vendor_id = :vendor_id 
   ORDER BY id DESC
   ```

4. **Trả về Response**:
   ```json
   {
     "status": "success",
     "products": [
       {
         "id": 1,
         "name": "...",
         "price": 50000,
         "stock": 100,
         "approval_status": "approved",
         "images": [...],
         "created_at": "..."
       },
       {...}
     ]
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token (hoặc có thể công khai nếu chỉ lấy approved)

---

### 5. CẬP NHẬT STOCK SẢN PHẨM

#### Route & Endpoint
- **API**: `POST /api/update_stock.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Kiểm tra quyền sở hữu sản phẩm**
3. **Nhận product_id & new_stock** từ client
4. **Validation**:
   - ✅ new_stock >= 0
5. **Cập nhật DB**:
   ```sql
   UPDATE products SET stock = :new_stock WHERE id = :product_id
   ```
6. **Ghi log**: "Vendor {name} cập nhật stock sản phẩm {product_id}"
7. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Cập nhật stock thành công"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ được cập nhật stock sản phẩm của chính mình

---

## C. QUẢN LÝ ĐƠN HÀNG (VENDOR)

### 1. LẤY DANH SÁCH ĐƠN HÀNG CỦA VENDOR

#### Route & Endpoint
- **Frontend**: `/vendor/dashboard` hoặc dedicated orders page
- **API**: `GET /api/api_orders.php?action=get_vendor_orders`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Lấy tất cả order_items có vendor_id = user_id**:
   ```sql
   SELECT DISTINCT o.* FROM orders o
   JOIN order_items oi ON o.id = oi.order_id
   WHERE oi.vendor_id = :vendor_id
   ORDER BY o.created_at DESC
   ```

3. **Trả về Response**:
   ```json
   {
     "status": "success",
     "orders": [...]
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ thấy order của sản phẩm chính mình

---

### 2. CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (VENDOR)

#### Route & Endpoint
- **API**: `POST /api/update_shipping.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Nhận order_id & new_status** từ client
3. **Kiểm tra vendor có quyền cập nhật** (vendor_id trong order_items bằng user_id)
4. **Validate status**:
   - "Pending" → "Shipping" (vendor bắt đầu giao hàng)
   - "Shipping" → "Completed" (đã giao thành công)
   - "Completed" → "Cancelled" (hủy khi chưa giao)

5. **Cập nhật shipping table**:
   ```sql
   UPDATE shipping SET status = :new_status WHERE order_id = :order_id
   ```

6. **Tạo notification** cho customer:
   - "Đơn hàng #{order_id} của bạn {status}"

7. **Ghi log**: "Vendor {name} cập nhật trạng thái order #{order_id} thành {status}"

8. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Cập nhật trạng thái thành công"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ được cập nhật order của sản phẩm chính mình

---

## D. THỐNG KÊ & DASHBOARD (VENDOR)

### 1. LẤY THỐNG KÊ DASHBOARD

#### Route & Endpoint
- **Frontend**: `/vendor/dashboard` page
- **API**: `GET /api/api_dashboard.php?role=vendor`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Lấy thống kê**:
   - Tổng doanh thu (sum order_items của vendor)
   - Tổng đơn hàng
   - Tổng sản phẩm
   - Tổng lượt xem
   - Tỷ lệ hoàn tất đơn

3. **Trả về Response**:
   ```json
   {
     "status": "success",
     "stats": {
       "total_revenue": 5000000,
       "total_orders": 50,
       "total_products": 20,
       "avg_rating": 4.5
     }
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "vendor"

---

## E. ĐÁ GIÁ & REVIEW

### 1. LẤY DANH SÁCH ĐÁ GIÁ SẢN PHẨM

#### Route & Endpoint
- **Frontend**: `/vendor/reviews` page
- **API**: `GET /api/review.php?action=get_vendor_reviews`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Lấy tất cả review cho sản phẩm của vendor**:
   ```sql
   SELECT r.* FROM reviews r
   JOIN products p ON r.product_id = p.id
   WHERE p.vendor_id = :vendor_id
   ORDER BY r.created_at DESC
   ```

3. **Trả về Response**:
   ```json
   {
     "status": "success",
     "reviews": [
       {
         "id": 1,
         "rating": 5,
         "comment": "...",
         "customer_name": "...",
         "created_at": "..."
       },
       {...}
     ]
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ thấy review sản phẩm của chính mình

---

### 2. TRẢ LỜI REVIEW

#### Route & Endpoint
- **API**: `POST /api/review.php?action=reply_review`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Kiểm tra quyền** (vendor của sản phẩm)
3. **Tạo reply**:
   ```sql
   INSERT INTO review_replies (review_id, vendor_id, reply_text) VALUES (...)
   ```
4. **Tạo notification** cho customer
5. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Trả lời review thành công"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Vendor chỉ được trả lời review sản phẩm của chính mình

---

## F. HỖ TRỢ KHÁCH HÀNG (VENDOR)

### 1. LẤY DANH SÁCH CHAT

#### Route & Endpoint
- **Frontend**: `/vendor/chat` page
- **API**: `GET /api/message.php?action=get_conversations`

#### Luồng xử lý:
1. **Validate JWT**
2. **Lấy danh sách conversation với vendor_id = user_id**
3. **Trả về Response**: Danh sách chat

#### Phân quyền:
- ✅ Cần JWT token

---

### 2. GỬI TIN NHẮN

#### Route & Endpoint
- **API**: `POST /api/message.php?action=send_message`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Nhận receiver_id & message_text**
3. **Tạo message record**:
   ```sql
   INSERT INTO messages (sender_id, receiver_id, content) VALUES (...)
   ```
4. **Tạo notification** cho receiver
5. **Trả về Response**: Message record mới

#### Phân quyền:
- ✅ Cần JWT token

---

## G. VÍ & RÚT TIỀN (VENDOR)

### 1. LẤY THÔNG TIN VÍ

#### Route & Endpoint
- **Frontend**: `/vendor/wallet` page
- **API**: `GET /api/get_wallet.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Lấy wallet record từ DB**:
   ```sql
   SELECT * FROM wallets WHERE user_id = :user_id
   ```
3. **Tính balance**:
   - balance = Tổng doanh thu - Tổng rút tiền - Chiết khấu
4. **Trả về Response**:
   ```json
   {
     "status": "success",
     "wallet": {
       "id": 1,
       "balance": 5000000,
       "total_earned": 6000000,
       "total_withdrawn": 1000000
     }
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token

---

### 2. YÊU CẦU RÚT TIỀN

#### Route & Endpoint
- **API**: `POST /api/request_withdrawal.php`

#### Luồng xử lý:
1. **Validate JWT & lấy user_id**
2. **Nhận amount & bank_info** từ client
3. **Validation**:
   - ✅ amount > 0
   - ✅ amount <= wallet balance
   - ✅ amount >= minimum withdrawal (100000 vnđ)

4. **Tạo withdrawal request**:
   ```sql
   INSERT INTO withdrawal_requests (
     user_id, amount, bank_info, status, created_at
   ) VALUES (...)
   ```
   - status = "pending"

5. **Tạo notification** cho admin:
   - "Vendor {name} yêu cầu rút {amount}"

6. **Ghi log**: "Vendor {name} yêu cầu rút {amount}"

7. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Yêu cầu rút tiền đã được gửi đi"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "vendor"

---

# PHẦN IV: ADMIN

## A. DASHBOARD ADMIN

### 1. LẤY THỐNG KÊ DASHBOARD

#### Route & Endpoint
- **Frontend**: `/admin/panel` page
- **API**: `GET /api/api_dashboard.php?role=admin`

#### Luồng xử lý:
1. **Validate JWT & kiểm tra role = "admin"**
2. **Lấy thống kê toàn hệ thống**:
   - Tổng doanh thu
   - Tổng user
   - Tổng vendor
   - Tổng đơn hàng
   - Tổng sản phẩm
   - Tổng review
   - Chi tiêu marketing (nếu có)

3. **Tính các metrics**:
   - Revenue by month/week
   - Top products
   - Top vendors
   - Top customers
   - New users today/this week/this month

4. **Trả về Response**:
   ```json
   {
     "status": "success",
     "stats": {
       "total_revenue": "...",
       "total_users": "...",
       "total_vendors": "...",
       "total_orders": "...",
       "charts": {...}
     }
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## B. QUẢN LÝ VENDOR

### 1. LẤY DANH SÁCH VENDOR

#### Route & Endpoint
- **Frontend**: `/admin/vendor` page
- **API**: `GET /api/handle_vendors.php`

#### Luồng xử lý:
1. **Validate JWT & kiểm tra role = "admin"**
2. **Lấy danh sách vendor từ DB**:
   ```sql
   SELECT id, name, email, phone, avatar, is_approved, created_at,
          (SELECT COUNT(*) FROM products WHERE vendor_id = users.id) as totalProducts
   FROM users 
   WHERE role = 'vendor'
   ORDER BY created_at DESC
   ```

3. **Map dữ liệu**:
   - is_approved (0|1|2) → status ("Pending"|"Active"|"Banned")

4. **Trả về Response**:
   ```json
   {
     "status": "success",
     "data": [
       {
         "id": 1,
         "name": "Anh Nông",
         "email": "anhnong@example.com",
         "phone": "0901234567",
         "status": "Active",
         "joinDate": "2026-04-01",
         "totalProducts": 20,
         "rating": 4.5,
         "avatar": "..."
       },
       {...}
     ]
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. CẬP NHẬT TRẠNG THÁI VENDOR

#### Route & Endpoint
- **API**: `POST /api/handle_vendors.php` (action = "update_status")

#### Luồng xử lý:
1. **Validate JWT & kiểm tra role = "admin"**
2. **Nhận vendor_id & new_status** từ client
3. **Map status sang is_approved**:
   - "Active" → 1
   - "Pending" → 0
   - "Banned" → 2

4. **Cập nhật DB**:
   ```sql
   UPDATE users SET is_approved = :val WHERE id = :vendor_id
   ```

5. **Tạo notification** cho vendor:
   - Nếu approve: "Tài khoản của bạn đã được duyệt"
   - Nếu ban: "Tài khoản của bạn đã bị cấm"

6. **Ghi log**: "Admin {name} cập nhật trạng thái vendor {vendor_id} thành {new_status}"

7. **Trả về Response**:
   ```json
   {
     "status": "success",
     "message": "Cập nhật trạng thái thành công"
   }
   ```

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 3. RESET MẬT KHẨU VENDOR

#### Route & Endpoint
- **API**: `POST /api/handle_vendors.php` (action = "update_password")

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Nhận vendor_id & new_password**
3. **Hash password**
4. **Cập nhật DB**:
   ```sql
   UPDATE users SET password = :hashed_password WHERE id = :vendor_id
   ```
5. **Ghi log**: "Admin reset password cho vendor {vendor_id}"
6. **Trả về Response**: Success

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## C. QUẢN LÝ CUSTOMER

### 1. LẤY DANH SÁCH CUSTOMER

#### Route & Endpoint
- **Frontend**: `/admin/customer` page
- **API**: `GET /api/handle_customers.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy danh sách customer**:
   ```sql
   SELECT id, name, email, phone, avatar, is_online, created_at
   FROM users 
   WHERE role IN ('customer', 'user')
   ORDER BY created_at DESC
   ```

3. **Trả về Response**: Danh sách customer

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. CẬP NHẬT THÔNG TIN CUSTOMER

#### Route & Endpoint
- **API**: `POST /api/handle_customers.php`

#### Luồng xử lý: Tương tự quản lý vendor

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## D. QUẢN LÝ SẢN PHẨM

### 1. LẤY DANH SÁCH SẢN PHẨM

#### Route & Endpoint
- **Frontend**: `/admin/product` page
- **API**: `GET /api/handle_products.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả sản phẩm**:
   ```sql
   SELECT p.*, u.name as vendor_name
   FROM products p
   JOIN users u ON p.vendor_id = u.id
   ORDER BY p.approval_status, p.created_at DESC
   ```

3. **Trả về Response**: Danh sách sản phẩm

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. PHÊDUYỆT SẢN PHẨM

#### Route & Endpoint
- **API**: `POST /api/handle_products.php` (action = "approve")

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Nhận product_id & approval_decision** (approve|reject)
3. **Nếu approve**:
   ```sql
   UPDATE products SET approval_status = 'approved' WHERE id = :product_id
   ```
   - Tạo notification cho vendor: "Sản phẩm '{name}' đã được phê duyệt"

4. **Nếu reject**:
   ```sql
   UPDATE products SET approval_status = 'rejected' WHERE id = :product_id
   ```
   - Nhận rejection_reason từ client
   - Lưu reason
   - Tạo notification cho vendor: "Sản phẩm '{name}' bị từ chối vì: {reason}"

5. **Ghi log**: "Admin phê duyệt/từ chối sản phẩm {product_id}"
6. **Trả về Response**: Success

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 3. CẤM SẢN PHẨM

#### Route & Endpoint
- **API**: `POST /api/handle_products.php` (action = "ban")

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Cập nhật product**:
   ```sql
   UPDATE products SET is_banned = 1 WHERE id = :product_id
   ```
3. **Tạo notification** cho vendor: "Sản phẩm '{name}' bị cấm"
4. **Ghi log**: "Admin cấm sản phẩm {product_id}"
5. **Trả về Response**: Success

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## E. QUẢN LÝ ĐƠN HÀNG

### 1. LẤY DANH SÁCH ĐƠN HÀNG

#### Route & Endpoint
- **Frontend**: `/admin/order-management` page
- **API**: `GET /api/api_orders.php?action=get_all_orders` (admin version)

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả order**:
   ```sql
   SELECT o.*, u.name as customer_name, u.email
   FROM orders o
   JOIN users u ON o.user_id = u.id
   ORDER BY o.created_at DESC
   ```

3. **Trả về Response**: Danh sách order

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. CẬP NHẬT ĐƠN HÀNG

#### Route & Endpoint
- **API**: `POST /api/api_orders.php?action=admin_update_order`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Cho phép cập nhật**:
   - Order status
   - Payment status
   - Shipping status

3. **Tạo notification** cho vendor & customer
4. **Ghi log**: "Admin cập nhật order {order_id}"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## F. QUẢN LÝ THANH TOÁN

### 1. LẤY DANH SÁCH THANH TOÁN

#### Route & Endpoint
- **Frontend**: `/admin/payment` page
- **API**: `GET /api/api_payments.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả payment records**:
   ```sql
   SELECT * FROM payments
   ORDER BY created_at DESC
   ```

3. **Trả về Response**: Danh sách payment

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. XỬ LÝ HOÀN TIỀN

#### Route & Endpoint
- **API**: `POST /api/api_payments.php?action=process_refund`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Nhận payment_id & refund_reason**
3. **Xử lý hoàn tiền**:
   - Nếu VNPay: Kêu gọi VNPay refund API
   - Nếu Momo: Kêu gọi Momo refund API
   - Nếu COD: Manual (ghi chú)

4. **Cập nhật payment status**:
   ```sql
   UPDATE payments SET status = 'refunded' WHERE id = :payment_id
   ```

5. **Cập nhật order status**: "Refunded"
6. **Tạo notification** cho customer
7. **Ghi log**: "Admin xử lý hoàn tiền cho order {order_id}"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## G. QUẢN LÝ REVIEW & ĐÁNH GIÁ

### 1. LẤY DANH SÁCH REVIEW

#### Route & Endpoint
- **Frontend**: `/admin/review-management` page
- **API**: `GET /api/handle_reviews.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả review**:
   ```sql
   SELECT r.*, p.name as product_name, u.name as customer_name
   FROM reviews r
   JOIN products p ON r.product_id = p.id
   JOIN users u ON r.user_id = u.id
   ORDER BY r.created_at DESC
   ```

3. **Trả về Response**: Danh sách review

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. ẨN/HIỂN REVIEW

#### Route & Endpoint
- **API**: `POST /api/handle_reviews.php?action=hide_review`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Nhận review_id & reason**
3. **Cập nhật review**:
   ```sql
   UPDATE reviews SET is_visible = 0, hide_reason = :reason WHERE id = :review_id
   ```
4. **Tạo notification** cho customer
5. **Ghi log**: "Admin ẩn review {review_id}"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## H. QUẢN LÝ VẬN CHUYỂN

### 1. LẤY DANH SÁCH SHIPPING

#### Route & Endpoint
- **Frontend**: `/admin/shipping-management` page
- **API**: `GET /api/get_shipping.php?action=all`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả shipping records** kèm order info
3. **Trả về Response**: Danh sách shipping

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. CẬP NHẬT SHIPPING

#### Route & Endpoint
- **API**: `POST /api/update_shipping.php?action=admin_update`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Nhận shipping_id & updated_info**
3. **Cập nhật shipping record**
4. **Ghi log**: "Admin cập nhật shipping {shipping_id}"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## I. QUẢN LÝ DANH MỤC

### 1. LẤY DANH SÁCH DANH MỤC

#### Route & Endpoint
- **Frontend**: `/admin/category` page
- **API**: `GET /api/handle_categories.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả category**
3. **Trả về Response**: Danh sách category

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. THÊMSỬA/XÓA DANH MỤC

#### Route & Endpoint
- **API**: `POST /api/handle_categories.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Xử lý action**: create | update | delete
3. **Cập nhật DB**
4. **Ghi log**: "Admin {action} category {category_id}"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## J. QUẢN LÝ VÍ & RÚT TIỀN

### 1. LẤY DANH SÁCH YÊU CẦU RÚT TIỀN

#### Route & Endpoint
- **API**: `GET /api/request_withdrawal.php?action=list`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả withdrawal request**:
   ```sql
   SELECT w.*, u.name, u.email
   FROM withdrawal_requests w
   JOIN users u ON w.user_id = u.id
   WHERE status = 'pending'
   ORDER BY w.created_at DESC
   ```

3. **Trả về Response**: Danh sách withdrawal

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. XỬ LÝ YÊU CẦU RÚT TIỀN

#### Route & Endpoint
- **API**: `POST /api/request_withdrawal.php?action=process`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Nhận withdrawal_id & decision** (approve | reject)
3. **Nếu approve**:
   - Chuyển tiền đến account ngân hàng vendor (integration với backend payment)
   - Cập nhật status = "completed"
   - Tạo notification: "Yêu cầu rút tiền đã được xây dựng"

4. **Nếu reject**:
   - Cập nhật status = "rejected"
   - Nhận reason từ admin
   - Tạo notification: "Yêu cầu rút tiền bị từ chối"

5. **Ghi log**: "Admin xử lý withdrawal {withdrawal_id}"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## K. QUẢN LÝ PHÂN QUYỀN

### 1. LẤY DANH SÁCH ROLE

#### Route & Endpoint
- **Frontend**: `/admin/role-management` page
- **API**: `GET /api/handle_role.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả role và permissions**
3. **Trả về Response**: Danh sách role

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. CẬP NHẬT ROLE

#### Route & Endpoint
- **API**: `POST /api/handle_role.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Xử lý action**: create | update | delete role
3. **Ghi log**: "Admin {action} role"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## L. QUẢN LÝ THÔNG BÁO

### 1. LẤY THÔNG BÁO

#### Route & Endpoint
- **API**: `GET /api/admin_notifications.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy thông báo cho admin**
3. **Trả về Response**: Danh sách notification

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. ĐÁNH DẤU ĐÃ ĐỌC

#### Route & Endpoint
- **API**: `POST /api/mark_read.php`

#### Luồng xử lý:
1. **Validate JWT**
2. **Cập nhật is_read = 1** cho notification

#### Phân quyền:
- ✅ Cần JWT token

---

## M. QUẢN LÝ BÁO CÁO & LOG

### 1. LẤY BÁO CÁO

#### Route & Endpoint
- **Frontend**: `/admin/reports-management` page
- **API**: `GET /api/report.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Tính các report**:
   - Revenue report (by day/week/month/year)
   - User growth report
   - Order report
   - Product performance report
   - Vendor performance report

3. **Trả về Response**: Thống kê báo cáo

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. LẤY AUDIT LOG

#### Route & Endpoint
- **Frontend**: `/admin/logs` page
- **API**: `GET /api/admin_notifications.php?action=get_logs`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Lấy tất cả audit log**:
   ```sql
   SELECT * FROM audit_logs
   ORDER BY created_at DESC
   LIMIT 1000
   ```

3. **Trả về Response**: Danh sách log

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

## N. QUẢN LÝ BANNER/KHUYẾN MÃI

### 1. QUẢN LÝ BANNER

#### Route & Endpoint
- **Frontend**: `/admin/changeBanner` page
- **API**: `POST /api/banner.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Upload banner image**
3. **Lưu vào DB**:
   ```sql
   INSERT INTO banners (image_url, title, link, priority) VALUES (...)
   ```
4. **Ghi log**: "Admin thay đổi banner"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

### 2. QUẢN LÝ KHUYẾN MÃI

#### Route & Endpoint
- **API**: `POST /api/promotions.php`

#### Luồng xử lý:
1. **Validate JWT & role = "admin"**
2. **Xử lý action**: create | update | delete promotion
3. **Cập nhật DB**
4. **Ghi log**: "Admin {action} promotion"

#### Phân quyền:
- ✅ Cần JWT token
- ✅ Role phải là "admin"

---

# PHẦN V: HỆ THỐNG CHUNG

## 1. MESSAGING & HỖ TRỢ

### Route & Endpoint:
- **API**: `POST /api/message.php`

### Luồng xử lý:
- Áp dụng cho cả user, vendor, admin
- Kiểm tra phân quyền cho mỗi conversation
- Ghi log message quan trọng

---

## 2. AUDIT LOG & MONITORING

### Các sự kiện cần log:
✅ Đăng nhập / Đăng xuất
✅ Tạo/Cập nhật/Xóa tài khoản
✅ Thay đổi quyền truy cập
✅ Tạo/Cập nhật/Xóa sản phẩm
✅ Tạo/Cập nhật/Hủy đơn hàng
✅ Xử lý thanh toán/Hoàn tiền
✅ Phê duyệt/Từ chối nội dung
✅ Thay đổi settings quan trọng
✅ Truy cập tài khoản khác

### Format log:
```json
{
  "timestamp": "2026-04-04 10:30:45",
  "user_id": 123,
  "user_name": "...",
  "user_role": "admin",
  "action": "Tạo sản phẩm mới",
  "resource_id": 456,
  "resource_type": "product",
  "ip_address": "192.168.1.1",
  "status": "success|error",
  "details": {...}
}
```

---

## 3. NOTIFICATION SYSTEM

### Kiểu thông báo:
- **SYSTEM**: Thông báo từ hệ thống (sản phẩm được duyệt, v.v.)
- **ORDER**: Liên quan đến đơn hàng
- **PAYMENT**: Liên quan thanh toán
- **REVIEW**: Liên quan review
- **CHAT**: Tin nhắn mới
- **ADMIN**: Thông báo về hành động admin

### Trả về Response (khi lấy notification):
```json
{
  "id": 1,
  "user_id": 123,
  "title": "Sản phẩm được duyệt",
  "content": "Sản phẩm 'Rau cải' đã được admin duyệt",
  "type": "SYSTEM",
  "is_read": 0|1,
  "created_at": "2026-04-04 10:30:45",
  "metadata": {...}
}
```

---

## 4. RATE LIMITING

### Áp dụng cho:
- ✅ Login: 7 lần trong 600 giây
- ✅ Register: 3 lần trong 3600 giây
- ✅ Add product: 10 lần trong 3600 giây
- ✅ Message: 30 lần trong 60 giây
- ✅ API Call: 100 lần trong 60 giây

---

## 5. ERROR HANDLING & STATUS CODE

### HTTP Status Code:
- **200**: OK (Thành công)
- **201**: Created (Tạo mới)
- **400**: Bad Request (Dữ liệu không hợp lệ)
- **401**: Unauthorized (Cho phép xác thực)
- **403**: Forbidden (Không có quyền)
- **404**: Not Found (Không tìm thấy)
- **409**: Conflict (Xung đột - ví dụ: email đã tồn tại)
- **429**: Too Many Requests (Rate limit)
- **500**: Internal Server Error (Lỗi hệ thống)

### Response Format:
```json
{
  "status": "success|error",
  "message": "...",
  "data": {...},
  "errors": {...}
}
```

---

## TÓNG TẮT PHÂN QUYỀN

| Tính năng | User | Vendor | Admin |
|----------|------|--------|-------|
| Xem hồ sơ riêng | ✅ | ✅ | ✅ |
| Cập nhật hồ sơ riêng | ✅ | ✅ | ✅ |
| Thêm sản phẩm | ❌ | ✅ (chờ duyệt) | ❌ |
| Sửa sản phẩm | ❌ | ✅ (sản phẩm của mình) | ✅ |
| Xóa sản phẩm | ❌ | ✅ (sản phẩm của mình) | ✅ |
| Tạo đơn hàng | ✅ | ❌ | ❌ |
| Xem đơn hàng của mình | ✅ | ✅ (sản phẩm của mình) | ✅ (tất cả) |
| Cập nhật đơn hàng | ✅ (hủy) | ✅ (shipping) | ✅ (tất cả) |
| Phê duyệt sản phẩm | ❌ | ❌ | ✅ |
| Quản lý vendor | ❌ | ❌ | ✅ |
| Quản lý customer | ❌ | ❌ | ✅ |
| Xử lý payment | ❌ | ❌ | ✅ |
| Xem report | ❌ | ✅ (riêng) | ✅ (toàn hệ thống) |
| Rút tiền | ❌ | ✅ | ❌ |

---

**END OF DOCUMENT**

---

Mọi question hoặc cần thêm chi tiết vui lòng liên hệ!
