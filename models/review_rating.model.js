const { Schema, model, Types } = require('mongoose');
const { index } = require('./item.subschema');

const ReviewRatingSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',  // Populate with User details
            required: true,
            index : true,
        },
        productId: {
            type: Types.ObjectId,
            ref: 'Product',  // Populate with Product details
            required: true,
            index : true
        },
        rating: {
            type: Number,
            required: true,
            min: [1, 'Rating must be between 1 and 5'],
            max: [5, 'Rating must be between 1 and 5']
        },
        comment: {
            type: String,
            required: false,
            trim: true
        }
    },
    { timestamps: true }
);

productSchema.virtual('averageRating').get(function () {
    return this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length;
});  


module.exports = model('ReviewRating', ReviewRatingSchema);
