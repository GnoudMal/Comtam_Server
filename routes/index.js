var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

// router.get('/login', function (req, res, next) {
//     res.render('auth/login'); // Chỉ rõ thư mục auth
// });

// // Route cho trang register (nếu có)
// router.get('/register', function (req, res, next) {
//     res.render('auth/register'); // Tạo thêm file register.ejs tương tự
// });


module.exports = router;