const Product = require("../models/product")
const Cart = require('../models/cart')
const Order = require('../models/order');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');




exports.getProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
    // res.render("../views/product/product.ejs", { products: products });
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
};

exports.getListProduct = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("../views/product/product.ejs", { products: products });
  } catch (error) {
    res.status(500).send('Error fetching products');
  }
};




exports.getProductDetails = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server Ne12' });
  }
};



exports.addProduct = async (req, res) => {
  console.log(req.body);
  const { name, price, description, category, imageproduct } = req.body;

  let image_url = null; // Đặt mặc định là null

  if (req.file) {
    const destinationPath = path.join(__dirname, "../public/templates");
    const tempFilePath = req.file.path;
    const originalName = req.file.originalname;

    // Di chuyển tệp hình ảnh từ thư mục tạm đến thư mục đích
    fs.renameSync(tempFilePath, path.join(destinationPath, originalName));

    // Đường dẫn lưu trữ hình ảnh
    image_url = "templates/" + originalName;
  } else if (imageproduct) {
    // Nếu người dùng nhập link hình ảnh
    image_url = imageproduct;
  }
  console.log("check link 1: " + imageproduct);

  console.log("check link 2: " + image_url);

  try {
    const product = new Product({
      name,
      image_url,
      price,
      description,
      category,
    });

    await product.save();
    res.redirect("/products/listproducts");
  } catch (error) {
    console.error("Đã có lỗi xảy ra khi thêm sản phẩm mới: ", error);
    res.status(500).json({ msg: 'Lỗi khi thêm sản phẩm' });
  }
};


exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }

    res.redirect("/products");
  } catch (error) {
    console.error("Đã có lỗi xảy ra khi xóa sản phẩm:", error);
    res.status(500).json({ msg: 'Lỗi khi xóa sản phẩm' });
  }
};



exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;

  try {
    let cart = await Cart.findOne({ user: userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    } else {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }],
      });
    }

    await cart.save();
    res.status(201).json({ msg: 'Sản phẩm đã được thêm vào giỏ hàng' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ msg: 'Lỗi server Ne2' });
  }
};

exports.updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  console.log("check ne" + req.userId);

  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ msg: "Thiếu thông tin người dùng" });
  }

  try {
    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ user: userId });

    console.log("check cart" + cart);


    if (!cart) {
      return res.status(404).json({ msg: 'Giỏ hàng trống' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    console.log("item index" + itemIndex);
    console.log("product ID" + productId);
    console.log("cart item" + cart.items);


    if (itemIndex === -1) {
      return res.status(404).json({ msg: 'Sản phẩm không có trong giỏ hàng' });
    }

    // Cập nhật số lượng sản phẩm
    if (quantity <= 0) {
      // Nếu số lượng là 0, xóa sản phẩm khỏi giỏ hàng
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    res.json({ msg: 'Giỏ hàng đã được cập nhật', cart });
  } catch (error) {
    console.error("Đã có lỗi xảy ra khi cập nhật giỏ hàng:", error);
    res.status(500).json({ msg: 'Lỗi khi cập nhật giỏ hàng' });
  }
};



exports.getCart = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    console.error("User ID không tồn tại trong request");
    return res.status(400).json({ msg: "Thiếu thông tin người dùng" });
  }


  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart) {
      return res.status(404).json({ msg: 'Giỏ hàng trống' });
    }

    res.json(cart.items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Lỗi server neeeeeeeeeee' });
  }

};





exports.checkout = async (req, res) => {
  const userId = req.userId;
  const { address, phoneNumber } = req.body;

  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: 'Giỏ hàng của bạn đang trống' });
    }

    let totalAmount = 0;
    cart.items.forEach(item => {
      totalAmount += item.product.price * item.quantity;
    });


    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product,
        quantity: item.quantity,
      })),
      totalAmount,
      shippingAddress: {
        address,
        phoneNumber,
      },
    });


    await order.save();

    // Xóa giỏ hàng sau khi đặt đơn
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({ msg: 'Đơn hàng của bạn đã được gửi thành công', order });

  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server Ne3' });
  }
};



// Lấy danh sách đơn hàng

exports.getOrder = async (req, res) => {
  const userId = req.userId;

  try {
    // Tìm các đơn hàng của người dùng
    const orders = await Order.find({ user: userId }).populate('items.product').sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ msg: 'Bạn chưa có đơn hàng nào' });
    }

    res.json(orders);

  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server Ne4' });
  }
};


// API tìm kiếm sản phẩm theo tên

exports.search = async (req, res) => {
  const { q } = req.query;  // Lấy từ khóa tìm kiếm từ query params

  try {
    if (!q) {
      return res.status(400).json({ msg: 'Vui lòng nhập từ khóa tìm kiếm' });
    }

    // Tìm sản phẩm có tên chứa từ khóa (không phân biệt hoa thường)
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    });

    if (products.length === 0) {
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm phù hợp' });
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: 'Lỗi server Ne5' });
  }
};
