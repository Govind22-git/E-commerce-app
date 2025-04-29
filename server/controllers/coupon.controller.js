const CouponModel = require('../models/couponDiscount.model');
const CartModel = require('../models/cart.model'); // Required for checking order value

// ADMIN CONTROLLERS
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await CouponModel.create(req.body);
    res.status(201).json({ message: 'Coupon created successfully' });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await CouponModel.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Coupons fetched successfully', data: coupons });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

exports.getCouponById = async (req, res) => {
  try {
    const coupon = await CouponModel.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: "Coupon fetched successfully", data: coupon });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await CouponModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await CouponModel.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.status(200).json({ message: 'Coupon deleted' });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

// USER CONTROLLER
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const coupon = await CouponModel.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(400).json({ message: 'Invalid or inactive coupon' });

    if (coupon.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Coupon expired' });
    }

    if (coupon.usedBy.includes(userId)) {
      return res.status(400).json({ message: 'Coupon already used' });
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const cartTotal = cart.items.reduce((acc, item) => acc + item.priceAtPurchase * item.quantity, 0);
    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order value is ₹${coupon.minOrderValue}` });
    }

    let discount = 0;
    if (coupon.discountType === 'flat') {
      discount = coupon.value;
    } else if (coupon.discountType === 'percent') {
      discount = (coupon.value / 100) * cartTotal;
    }

    discount = Math.min(discount, cartTotal); // Ensure no negative total

    // Update the coupon's usedBy array to include the userId
    coupon.usedBy.push(userId);
    await coupon.save();
    
    res.status(200).json({
      message: 'Coupon applied',
      discount,
      finalAmount: cartTotal - discount
    });
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({ message: 'Something broke!' });
  }
};
