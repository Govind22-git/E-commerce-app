const { Schema, model, Types } = require('mongoose');
const ItemSchema = require('./item.subschema');
const AddressSchema = require('./address.subschema');

const OrderSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User', // Optionally populate user info
            required: true,
            index : true
        },
        items: {
            type: [ItemSchema],
            required: true
        },
        shippingAddress: {
            type: AddressSchema,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending'
        },
        orderStatus: {
            type: String,
            enum: ['processing', 'shipped', 'delivered', 'cancelled'],
            default: 'processing'
        }
    },
    { timestamps: true }
);

OrderSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
    next();
});


module.exports = model('Order', OrderSchema);
