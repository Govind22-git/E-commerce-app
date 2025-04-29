const ReviewRatingModel = require('../models/review_rating.model');


// 💼 Admin 
// Get all reviews (Admin view)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await ReviewRatingModel.find()
            .populate('userId', 'name email')
            .populate('productId', 'name');
        res.status(200).json({ message: 'All reviews fetched successfully', data: reviews });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// 👤 User Routes (requires login)

// Add a review and rating
exports.addReviewRating = async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const userId = req.user._id;

        // Check if the user has already reviewed the product
        const existingReview = await ReviewRatingModel.findOne({ userId, productId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = new ReviewRatingModel({ userId, productId, rating, comment });
        await review.save();

        res.status(201).json({ message: 'Review added successfully', data: review });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Update a review
exports.updateReviewRating = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        const review = await ReviewRatingModel.findOne({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or not authorized' });
        }

        review.rating = rating || review.rating;
        review.comment = comment || review.comment;

        await review.save();

        res.status(200).json({ message: 'Review updated successfully', data: review });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Delete a review
exports.deleteReviewRating = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        const review = await ReviewRatingModel.findOneAndDelete({ _id: reviewId, userId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found or not authorized' });
        }

        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};


// Get current user's review for product
exports.getMyReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const review = await ReviewRatingModel.findOne({ userId, productId });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review fetched successfully', data: review });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};


// 🌐 Public/Common Routes
// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await ReviewRatingModel.find({ productId }).populate('userId', 'name email');

        res.status(200).json({ message: 'Reviews fetched successfully', data: reviews });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Get average rating for a product
exports.getAverageRating = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }


        const reviews = await ReviewRatingModel.find({ productId });

        if (reviews.length === 0) {
            return res.status(200).json({ message: 'No reviews yet', averageRating: 0 });
        }

        const averageRating =
            reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

        res.status(200).json({ message: 'Average rating fetched successfully', averageRating });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};