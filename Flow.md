# Business Flow - Tetris Pizza

เอกสารนี้อธิบายกระบวนการทำงาน (Business Flow) ของระบบ Tetris Pizza Webshop ตั้งแต่การสมัครสมาชิก, การสั่งซื้อสินค้า, การเติมเงิน, ไปจนถึงการจัดการหลังบ้าน (Admin).

## 1. User Authentication & Profile Flow (ระบบสมาชิก)
ผู้ใช้งานทั่วไปต้องเข้าสู่ระบบเพื่อทำการสั่งซื้อและจัดการข้อมูลส่วนตัว

### 1.1 Registration (สมัครสมาชิก)
1.  **User Access**: ผู้ใช้เข้าสู่หน้าสมัครสมาชิก
2.  **Input Data**: กรอกข้อมูล (Full Name, Email, Password, Confirm Password)
3.  **Validation**: ระบบตรวจสอบความถูกต้อง (Email format, Password match)
4.  **Submit**: ส่งข้อมูลไปยังระบบ (API Register)
5.  **Result**: 
    -   สำเร็จ: Redirect ไปหน้า Login
    -   ไม่สำเร็จ: แสดงข้อความแจ้งเตือน (Review Error)

### 1.2 Login (เข้าสู่ระบบ)
1.  **User Input**: กรอก Email และ Password
2.  **Authentication**: ระบบตรวจสอบข้อมูล (NextAuth credential provider)
3.  **Session Creation**: สร้าง Session Token เก็บใน LocalStorage/Cookie
4.  **Redirect**: ไปยังหน้าหลัก (Home) หรือหน้าที่เข้าค้างไว้

### 1.3 Profile Management (จัดการข้อมูลส่วนตัว)
1.  **View Profile**: ดูข้อมูล Balance, Address, Order History
2.  **Edit Profile**: แก้ไขชื่อ, เบอร์โทร, รูปโปรไฟล์
3.  **Address Book**: เพิ่ม/ลบ/แก้ไข ที่อยู่จัดส่ง
    -   สามารถตั้งค่าที่อยู่ Default ได้
4.  **Change Password**: เปลี่ยนรหัสผ่านเดิมเป็นรหัสใหม่

---

## 2. Order Fulfillment Flow (กระบวนการสั่งซื้อ)
กระบวนการหลักของการขายสินค้า มี 2 รูปแบบคือ Delivery และ Pickup

### 2.1 Order Type Selection (เลือกรูปแบบรับสินค้า)
1.  **Select Type**: ผู้ใช้เลือก "Delivery" (จัดส่ง) หรือ "Pickup" (รับเอง)
2.  **Location Input**:
    -   **Delivery**: ระบุที่อยู่จัดส่ง, Pin บนแผนที่ (Google Maps)
    -   **Pickup**: เลือกร้านสาขาที่ต้องการรับ
3.  **Save Preference**: ระบบจดจำรูปแบบการสั่งซื้อไว้ใน Session

### 2.2 Product Browsing (เลือกสินค้า)
1.  **Menu View**: แสดงรายการสินค้าตามหมวดหมู่ (Pizza, Snacks, Drinks)
2.  **Search & Filter**: ค้นหาด้วยชื่อ หรือกรองตามราคา
3.  **Product Details**: คลิกเพื่อดูรายละเอียด
4.  **Customization**:
    -   เลือกขนาด (Small, Medium, Large)
    -   เลือกขอบ (Crust)
    -   เลือกท็อปปิ้ง (Extra Toppings)
    -   ระบุจำนวน
5.  **Add to Cart**: เพิ่มสินค้าลงตะกร้า

### 2.3 Cart & Checkout (ตะกร้าและการชำระเงิน)
1.  **Review Cart**: ตรวจสอบรายการสินค้า, แก้ไขจำนวน, ลบรายการ
2.  **Checkout**: กดปุ่มชำระเงิน
3.  **Balance Check**: ระบบตรวจสอบยอดเงินในกระเป๋า (Wallet Balance)
    -   **ถ้ายอดเงินพอ**: ตัดยอดเงิน -> สร้าง Order -> สำเร็จ (ไป 2.4)
    -   **ถ้ายอดเงินไม่พอ**: แจ้งเตือน -> แนะนำให้ไปเติมเงิน (Top-up)

### 2.4 Order Tracking (ติดตามสถานะ)
1.  **Order Success**: แสดง Order ID และสรุปรายการ
2.  **History**: ดูประวัติการสั่งซื้อ (Order History)
3.  **Status**: ระบบ (Admin) อัปเดตสถานะ (Pending -> Cooking -> Delivering -> Completed)

---

## 3. Top-up Flow (กระบวนการเติมเงิน)
เนื่องจากระบบใช้ Wallet ในการชำระเงิน ผู้ใช้ต้องเติมเงินเข้าระบบก่อน

### 3.1 Method Selection
1.  ผู้ใช้เข้าหน้า "Topup"
2.  เลือกช่องทาง:
    -   **TrueMoney Wallet**: เติมผ่านลิงก์อั่งเปา
    -   **QR PromptPay**: สแกน QR Code (Disabled in current version/Coming soon)

### 3.2 Payment Execution
1.  **Input Amount**: ระบุจำนวนเงินที่ต้องการเติม (หรือเลือก Quick Access: 100, 300, 500)
2.  **Generate Transaction**: สร้างรายการเติมเงิน
3.  **Confirmation**: (กรณี TrueMoney Link) ใส่ลิงก์ -> ตรวจสอบ -> ยอดเงินเข้าทันที

---

## 4. Admin Management Flow (ระบบหลังบ้าน)
สำหรับผู้ดูแลระบบ (Role: Admin) เพื่อจัดการร้านค้า

### 4.1 Product Management
1.  **Dashboard**: ดูภาพรวมสินค้า
2.  **CRUD Operations**:
    -   Create: เพิ่มเมนูใหม่, อัปรูปภาพ, กำหนดราคา/ตัวเลือก
    -   Update: แก้ไขรายละเอียด, ปรับราคา, สถานะ (Available/Out of Stock)
    -   Delete: ลบเมนู

### 4.2 Order Management
1.  **Order List**: ดูรายการออเดอร์ที่เข้ามาใหม่
2.  **Update Status**: ปรับสถานะออเดอร์ (รับออเดอร์ -> กำลังทำ -> จัดส่ง)
3.  **View Detail**: ดูรายละเอียดที่อยู่จัดส่งและรายการสินค้า

### 4.3 User & Promotion Management
1.  **Users**: ดูรายชื่อลูกค้า, ประวัติการสั่งซื้อ
2.  **Promotions**: สร้างโค้ดส่วนลด หรือแคมเปญต่างๆ

---

## 5. Technical Note
> **หมายเหตุ**: จากการตรวจสอบ Source Code พบว่าโปรเจคนี้เน้น Frontend Implementation (UI/UX) เป็นหลัก โดยมีการเชื่อมต่อ API ไปยัง `http://localhost:3000/api/...` ซึ่งคาดว่าจะเป็น Backend Service ที่ต้องทำงานคู่กัน (แต่ไม่พบโค้ดส่วน API Route ในโฟลเดอร์ `app/api` หรือ `pages/api` ใน Repository นี้)
