const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./config');

// Stateless: session lưu tập trung ở MongoDB Atlas, KHÔNG lưu trong RAM server
module.exports = function setupSession(app) {
  app.set('trust proxy', 1); // bắt buộc khi chạy sau proxy của Render (để cookie secure hoạt động)

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_WRITE_URI, // dùng tài khoản write (đã được cấp quyền trên 'sessions')
        dbName: config.DB_NAME,
        collectionName: 'sessions',
        ttl: 60 * 60 * 24, // 1 ngày
      }),
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );
};
