const WishlistModel = require('../models/wishlist.model');

// Add a product to the wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let wishlist = await WishlistModel.findOne({ userId });

    if (!wishlist) {
      wishlist = new WishlistModel({ userId, productIds: [productId] });
    } else {
      if (wishlist.productIds.includes(productId)) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      wishlist.productIds.push(productId);
    }

    await wishlist.save();
    res.status(200).json({ message: 'Product added to wishlist', data: wishlist });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

// Remove a product from the wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const wishlist = await WishlistModel.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.productIds = wishlist.productIds.filter((id) => id.toString() !== productId);

    await wishlist.save();
    res.status(200).json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

// Get the user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await WishlistModel.findOne({ userId }).populate('productIds');

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    res.status(200).json({ message: 'Wishlist fetched successfully', data: wishlist });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something broke!' });
  }
};

// Clear the wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await WishlistModel.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.productIds = [];
    await wishlist.save();

    res.status(200).json({ message: 'Wishlist cleared successfully', data: wishlist });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Something broke!' });
  }
};