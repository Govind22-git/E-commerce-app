const express = require('express');
const router = express.Router();
const reviewRatingController = require('../controllers/review_rating.controller');
const { isLoggedIn, isAdmin } = require('../middlewares/middleware');

// ------------------------------
// 💼 Admin Routes
// ------------------------------
router.get('/admin/review_rating/all', isLoggedIn, isAdmin, reviewRatingController.getAllReviews); // Admin view of all reviews

// ------------------------------
// 👤 User Routes (requires login)
// ------------------------------
router.post('/review_rating/add', isLoggedIn, reviewRatingController.addReviewRating);              // Add a review
router.put('/review_rating/update/:reviewId', isLoggedIn, reviewRatingController.updateReviewRating); // Update user's review
router.delete('/review_rating/delete/:reviewId', isLoggedIn, reviewRatingController.deleteReviewRating); // Delete user's review
router.get('/review_rating/my/:productId', isLoggedIn, reviewRatingController.getMyReview);         // Get current user's review for a product

// ------------------------------
// 🌐 Public/Common Routes
// ------------------------------
router.get('/review_rating/:productId', reviewRatingController.getProductReviews);                 // Get all reviews for a product
router.get('/review_rating/average/:productId', reviewRatingController.getAverageRating);          // Get average rating for a product

module.exports = router;
