const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { isLoggedIn } = require('../middlewares/middleware'); // Assuming you have an auth middleware

// Add a product to the wishlist
router.post('/wishlist/add', isLoggedIn, wishlistController.addToWishlist);

// Remove a product from the wishlist
router.post('/wishlist/remove', isLoggedIn, wishlistController.removeFromWishlist);

// Get the user's wishlist
router.get('/wishlist', isLoggedIn, wishlistController.getWishlist);

// Clear the wishlist
router.delete('/wishlist/clear', isLoggedIn, wishlistController.clearWishlist);

module.exports = router;