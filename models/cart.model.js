const { Schema, model, Types } = require('mongoose');
const ItemSchema = require('./item.subschema');

const CartSchema = new Schema({
    userId: { type: Types.ObjectId, required: true, ref: 'User', index : true },
    items: [ItemSchema],
}, { timestamps: true });

module.exports = model('Cart', CartSchema);
