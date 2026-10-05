# Quản lý Sách - Cloud (Node.js + MongoDB Atlas + Render)

## 1. Sửa thông tin cá nhân
Mở `config.js`, sửa `FULL_NAME` và `MSSV`. Tiền tố mã sách và VAT tự tính từ MSSV.

## 2. MongoDB Atlas
- Database: `DB_<MSSV>`, collection: `books`
- Custom role đọc: `find` trên `books`
- Custom role ghi: `insert` trên `books`; trên `sessions` cần: `find, insert, update, remove, createIndex, createCollection`
- 2 user: `u<MSSV>_read`, `u<MSSV>_write` gắn đúng role
- Network Access: `0.0.0.0/0`

## 3. Chạy local
```bash
npm install
cp .env.example .env     # rồi điền mật khẩu thật
npm start
```
Mở http://localhost:3000 (thử mã `123...` hợp lệ và `999...` bị từ chối), `/visit` để kiểm tra session.

## 4. Dựng lịch sử Git (2 nhánh + 2 merge node)
```bash
git config --global user.name "Ten Ban"
git config --global user.email "email@cua.ban"
node setup-git.js
```
Xem sơ đồ: `git log --graph --oneline --all`

## 5. Đẩy lên GitHub (Private) và deploy Render
```bash
git remote add origin https://github.com/<ten-ban>/book-cloud.git
git push -u origin main
git push origin feature/database feature/session
```
Render: Web Service, Build `npm install`, Start `node app.js`, thêm biến môi trường `MONGO_READ_URI`, `MONGO_WRITE_URI`, `SESSION_SECRET`, `NODE_ENV=production`.
