require('dotenv').config();
const express = require('express');
const { engine } = require('express-handlebars');
const config = require('./config');
// #DB-START
const { ReadBook, WriteBook } = require('./db');
// #DB-END

const app = express();
app.engine('hbs', engine({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

// #SESSION-START
const setupSession = require('./session');
setupSession(app);

// Route chứng minh session lưu trên Atlas: restart server, bộ đếm vẫn giữ
app.get('/visit', (req, res) => {
  req.session.visits = (req.session.visits || 0) + 1;
  res.send(`Số lần truy cập (lưu trong MongoDB Atlas): ${req.session.visits}`);
});
// #SESSION-END

// Dữ liệu footer dùng cho mọi trang
app.locals.fullName = config.FULL_NAME;
app.locals.mssv = config.MSSV;
app.locals.vat = config.VAT;

app.get('/health', (req, res) => res.send('OK'));

// #DB-START
// ĐỌC -> luôn đi qua tài khoản READ
app.get('/', async (req, res) => {
  try {
    const books = await ReadBook.find().sort({ createdAt: -1 }).lean();
    res.render('books', { books, prefix: config.PREFIX, error: req.query.error });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi đọc dữ liệu: ' + err.message);
  }
});

// GHI -> luôn đi qua tài khoản WRITE
app.post('/books', async (req, res) => {
  try {
    const code = (req.body.code || '').trim();
    const title = (req.body.title || '').trim();
    const price = Number(req.body.price);

    // Bộ lọc cá nhân hóa: mã sách phải bắt đầu bằng 3 số cuối MSSV
    if (!code.startsWith(config.PREFIX)) {
      return res.status(400).redirect(`/?error=${encodeURIComponent(`Mã sách phải bắt đầu bằng ${config.PREFIX}`)}`);
    }
    if (!title || !(price >= 0)) {
      return res.redirect(`/?error=${encodeURIComponent('Tên sách hoặc giá không hợp lệ')}`);
    }

    // Tính giá sau thuế TRƯỚC khi lưu xuống Atlas
    const priceAfterVat = Math.round(price * (1 + config.VAT / 100) * 100) / 100;
    await WriteBook.create({ code, title, price, vat: config.VAT, priceAfterVat });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi ghi dữ liệu: ' + err.message);
  }
});
// #DB-END

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
