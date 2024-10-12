const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// Đăng ký
exports.reg = async (req, res) => {
    const { name, username, email, password } = req.body;

    try {
        // Kiểm tra xem email hoặc username đã tồn tại chưa
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ msg: 'Email hoặc username đã tồn tại' });
        }

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo người dùng mới
        user = new User({
            name,
            username,
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({ msg: 'Đăng ký thành công' });

    } catch (error) {
        res.status(500).json({ msg: 'Lỗi server' });
    }
}

// Đăng nhập
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Email không tồn tại' });
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Mật khẩu không đúng' });
        }

        // Tạo token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            _id: user._id, // Gửi userId
            username: user.username, // Có thể gửi thêm thông tin khác nếu cần
            email: user.email // Gửi email để người dùng có thể biết thông tin đăng nhập
        });

    } catch (error) {
        res.status(500).json({ msg: 'Lỗi server' });
    }
};


exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, username, email, phoneNumber, address } = req.body;

    try {
        // Tìm người dùng và cập nhật thông tin
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, username, email, phoneNumber, address }, // Cập nhật các trường
            { new: true, runValidators: true } // Trả về bản cập nhật mới và kiểm tra hợp lệ
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        return res.status(200).json({ message: 'Cập nhật thông tin thành công', user: updatedUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// Lấy thông tin người dùng theo ID
exports.getUser = async (req, res) => {
    const userId = req.params.id;

    console.log("day la id" + userId);


    try {
        // Tìm người dùng theo ID và loại bỏ mật khẩu khỏi kết quả
        const user = await User.findById(userId).select('-password');
        console.log("day la user: " + user);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};
