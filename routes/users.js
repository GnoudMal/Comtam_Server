var express = require('express');
var router = express.Router();
const uc = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/reg', uc.reg)
router.post('/login', uc.login)
router.get('/validate-token', authMiddleware, (req, res) => {
    console.log('Token validation requested');

    if (res.statusCode === 200) {
        console.log(`User ID: ${req.userId} - Token validation successful`);
    }

    res.status(200).json({ msg: 'Token còn hợp lệ' });
});

router.put('/update/:id', authMiddleware, uc.updateUser);

router.get('/:id', authMiddleware, uc.getUser);

module.exports = router;