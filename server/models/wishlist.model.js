const { Schema, model, Types } = require('mongoose');

const WishlistSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User', // Populating User data
      required: true,
      index : true
    },
    productIds: {
      type: [Types.ObjectId],
      ref: 'Product',
      validate: [(val) => val.length <= 50, 'Wishlist cannot have more than 50 products'],
      index : true
    }
  },
  { timestamps: true }
);

WishlistSchema.pre('save', function(next) {
  this.productIds = [...new Set(this.productIds)]; // Removes duplicates
  next();
});

module.exports = model('Wishlist', WishlistSchema);
