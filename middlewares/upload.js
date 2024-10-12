// middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ và định dạng tệp
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/templates'); // Thư mục nơi lưu trữ tệp
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Đặt tên tệp theo tên gốc
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
