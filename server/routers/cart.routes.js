const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/middleware'); // Assuming you already have isLoggedIn
const { validateAddToCart, validateUpdateCartItem, validateRemoveCartItem } = require('../middlewares/validate.middleware');

// ADMIN CART ROUTES
router.get('/admin/carts', isLoggedIn, isAdmin, cartController.getAllCarts); // Get all user carts (paginated)
router.get('/admin/cart/:userId', isLoggedIn, isAdmin, cartController.getCartByUser); // View specific user's cart
router.delete('/admin/cart/:userId/clear', isLoggedIn, isAdmin, cartController.clearUserCart); // Force clear a user's cart


// USER CART ROUTES
router.get('/cart', isLoggedIn, cartController.getCart);            // Get user's cart
router.post('/cart/add', isLoggedIn, validateAddToCart(), cartController.addToCart);       // Add item to cart
router.patch('/cart/update', isLoggedIn, validateUpdateCartItem(), cartController.updateCartItem);// Update quantity
router.delete('/cart/remove/:productId', isLoggedIn, validateRemoveCartItem(), cartController.removeCartItem); // Remove item
router.delete('/cart/clear', isLoggedIn, cartController.clearCart);   // Clear entire cart


module.exports = router;
