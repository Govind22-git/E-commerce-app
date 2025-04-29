const CartModel = require('../models/cart.model');
const ProductModel = require('../models/products.model'); // To check price etc.

// Admin: Get all user carts (with pagination)
exports.getAllCarts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const carts = await CartModel.find()
            .populate('userId', 'name email') // Optional: populate user details
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ updatedAt: -1 });

        const total = await CartModel.countDocuments();

        res.status(200).json({
            message: 'Carts fetched successfully',
            data: carts,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Admin: Get specific user's cart
exports.getCartByUser = async (req, res) => {
    try {
        const cart = await CartModel.findOne({ userId: req.params.userId })
            .populate('items.productId', 'name price salePrice images')
            .populate('userId', 'name email'); // Optional

        if (!cart) return res.status(404).json({ message: 'Cart not found for this user' });

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Admin: Force clear a user's cart
exports.clearUserCart = async (req, res) => {
    try {
        const cart = await CartModel.findOne({ userId: req.params.userId });

        if (!cart) return res.status(404).json({ message: 'Cart not found for this user' });

        cart.items = [];
        await cart.save();

        res.status(200).json({ message: 'User cart cleared successfully' });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Get user's cart
exports.getCart = async (req, res) => {
    try {
        const cart = await CartModel.findOne({ userId: req.user._id })
            .populate('items.productId', 'name price salePrice images');
        res.status(200).json(cart || { items: [] });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await ProductModel.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await CartModel.findOne({ userId: req.user._id });
        if (!cart) {
            cart = new CartModel({ userId: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                quantity,
                priceAtPurchase: product.discountedPrice // Use virtual discountedPrice
            });
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart' });

    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const cart = await CartModel.findOne({ userId: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: 'Product not in cart' });

        item.quantity = quantity;

        await cart.save();
        res.status(200).json({ message: 'Cart updated', cart });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Remove item from cart
exports.removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await CartModel.findOneAndUpdate(
            { userId: req.user._id },
            { $pull: { items: { productId } } },
            { new: true }
        );

        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        res.status(200).json({ message: 'Item removed' });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        await CartModel.findOneAndUpdate({ userId: req.user._id }, { items: [] });
        res.status(200).json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Error :', error);
        res.status(500).json({ message: 'Something broke!' });
    }
};
