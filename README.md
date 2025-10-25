# 💰 Personal Income and Expense Management System

ระบบจัดการรายรับและรายจ่ายส่วนบุคคล (Personal Income and Expense Management System)  
พัฒนาเพื่อช่วยผู้ใช้ในการติดตามรายรับ รายจ่าย และบริหารงบประมาณส่วนตัวได้อย่างมีประสิทธิภาพ  
โดยใช้เทคโนโลยี **Next.js (Frontend)** และ **Express + MongoDB (Backend)**

---

## 🚀 Features (คุณสมบัติหลัก)

### 🔹 **Frontend (Next.js Application)**
- ใช้ **Next.js** สำหรับสร้างส่วนติดต่อผู้ใช้ (UI)  
- รองรับการแสดง **กราฟรายรับ-รายจ่าย** (Charts.js / Recharts)  
- ระบบ **Authentication (Login / Register)** ด้วย JWT  
- ติดต่อกับ Backend ผ่าน **RESTful API**  
- รองรับการแสดงผลทั้ง **Desktop / Mobile (Responsive UI)**  

### 🔹 **Backend (Express + MongoDB)**
ระบบหลักแบ่งเป็น 6 โมดูลสำคัญ:

| โมดูล | หน้าที่หลัก |
|--------|---------------|
| **Auth** | Register / Login / JWT / Me (ตรวจสอบตัวตนผู้ใช้) |
| **Budget** | ตั้งงบประมาณรายเดือนต่อหมวดรายจ่าย |
| **Transactions** | เพิ่ม, แก้ไข, ลบ, ค้นหา (CRUD + Filter by month/from-to + Pagination) |
| **Notifications** | แจ้งเตือนเมื่อใช้จ่ายถึง 80%, 90%, 100% ของงบประมาณ |
| **Categories** | เพิ่ม/แก้ไข/ลบหมวดรายรับ-รายจ่าย (Safe Delete ต่อผู้ใช้) |
| **Summary** | สรุปยอดรวมรายเดือน / 6 เดือน / แยกตามหมวดหมู่ |

---



