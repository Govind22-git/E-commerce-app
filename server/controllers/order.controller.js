const cartModel = require('../models/cart.model');
const orderModel = require('../models/order.model');

exports.createOrder = async (req, res) => {
    try {
        const cart = await cartModel.findOne({ userId: req.user._id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const order = await orderModel.create({
            userId: req.user._id,
            items: cart.items,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            paymentStatus: 'pending',
        });

        await cartModel.deleteOne({ userId: req.user._id });

        res.status(201).json({ message: 'Order placed successfully', data: order });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Something broke!' });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ message: 'Orders fetched successfully', data: orders });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Something broke!' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = search
            ? { 'userId.name': { $regex: search, $options: 'i' } }
            : {};

        const orders = await orderModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'name email');

        const count = await orderModel.countDocuments(query);

        res.json({ message: 'Orders fetched successfully', data: orders, total: count });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Something broke!' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await orderModel
            .findById(req.params.id)
            .populate('userId', 'name email');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order fetched successfully', data: order });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Something broke!' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.orderStatus = req.body.orderStatus;
        await order.save();

        res.json({ message: 'Order status updated', data: order });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Something broke!' });
    }
};
