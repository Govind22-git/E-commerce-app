const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/middleware');
const { validateCreateOrder } = require('../middlewares/validate.middleware');

// 👤 USER ROUTES
router.post('/order', isLoggedIn, validateCreateOrder(), orderController.createOrder);
router.get('/my-orders', isLoggedIn, orderController.getMyOrders);

// 💼 ADMIN ROUTES
router.get('/admin/orders', isLoggedIn, isAdmin, orderController.getAllOrders);
router.get('/admin/order/:id', isLoggedIn, isAdmin, orderController.getOrderById);
router.patch('/admin/order/:id', isLoggedIn, isAdmin, orderController.updateOrderStatus);

module.exports = router;
