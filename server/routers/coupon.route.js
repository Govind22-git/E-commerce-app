const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/middleware');
const { validateCreateCoupon, validateApplyCoupon } = require('../middlewares/validate.middleware');

// ADMIN ROUTES
router.post('/admin/coupon', isLoggedIn, isAdmin, validateCreateCoupon(), couponController.createCoupon);
router.get('/admin/coupons', isLoggedIn, isAdmin, couponController.getAllCoupons);
router.get('/admin/coupon/:id', isLoggedIn, isAdmin, couponController.getCouponById);
router.put('/admin/coupon/:id', isLoggedIn, isAdmin, couponController.updateCoupon);
router.delete('/admin/coupon/:id', isLoggedIn, isAdmin, couponController.deleteCoupon);

// USER ROUTES
router.post('/coupon/apply', isLoggedIn, validateApplyCoupon(), couponController.applyCoupon); // apply coupon to cart

module.exports = router;
