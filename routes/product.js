var express = require('express');
var router = express.Router();
const p = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');

// Route để lấy danh sách sản phẩm
router.get('/', p.getProduct);

router.get('/listproducts', p.getListProduct);

// Route để thêm sản phẩm
router.post('/add', upload.single('imageproduct'), p.addProduct);

// Route để xóa sản phẩm
router.post('/delete/:productId', p.deleteProduct);

// Route để thêm sản phẩm vào giỏ hàng
router.post('/cart', authMiddleware, p.addToCart);

// Route để lấy giỏ hàng
router.get('/get-cart', authMiddleware, p.getCart);

// Route để cập nhật giỏ hàng
router.post('/update-cart', authMiddleware, p.updateCart);

// Route để checkout giỏ hàng
router.post('/checkout', authMiddleware, p.checkout);

// Route để lấy danh sách đơn hàng
router.get('/orders', authMiddleware, p.getOrder);

// Route để tìm kiếm sản phẩm
router.get('/search', p.search); // http://localhost:3000/products/search?q=xxxx

// Route để lấy chi tiết sản phẩm
router.get('/details/:productId', p.getProductDetails); // Thay đổi tên route cho rõ ràng

module.exports = router;
