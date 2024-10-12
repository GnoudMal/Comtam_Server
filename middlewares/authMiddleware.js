const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Kiểm tra xem header Authorization có tồn tại không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Token không tồn tại hoặc định dạng không hợp lệ' });
  }

  const token = authHeader.split(' ')[1]; // Lấy token từ chuỗi 'Bearer [token]'

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Thêm userId vào request để sử dụng trong các endpoint sau
    req.userId = decoded.userId;

    next(); // Tiếp tục sang middleware hoặc route tiếp theo
  } catch (err) {
    console.error(err);

    // Kiểm tra lỗi token đã hết hạn hay không hợp lệ
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ msg: 'Token đã hết hạn' });
    }

    res.status(401).json({ msg: 'Token không hợp lệ' });
  }
};

module.exports = authMiddleware;
