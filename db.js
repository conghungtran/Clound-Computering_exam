require('dotenv').config();
const mongoose = require('mongoose');

// Hai kết nối độc lập, hai tài khoản khác nhau (Least Privilege)
const readConn = mongoose.createConnection(process.env.MONGO_READ_URI);
const writeConn = mongoose.createConnection(process.env.MONGO_WRITE_URI);

readConn.on('error', (e) => console.error('[READ conn]', e.message));
writeConn.on('error', (e) => console.error('[WRITE conn]', e.message));

const bookSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },        // giá gốc
    vat: { type: Number, required: true },          // % VAT đã áp dụng
    priceAfterVat: { type: Number, required: true }, // giá sau thuế
  },
  {
    timestamps: true,
    // Tài khoản chỉ đọc/ghi không có quyền tạo index/collection nên tắt tự động
    autoIndex: false,
    autoCreate: false,
  }
);

// Cùng schema, nhưng gắn vào 2 kết nối khác nhau
const ReadBook = readConn.model('Book', bookSchema, 'books');   // chỉ dùng để find
const WriteBook = writeConn.model('Book', bookSchema, 'books'); // chỉ dùng để insert

module.exports = { readConn, writeConn, ReadBook, WriteBook };
