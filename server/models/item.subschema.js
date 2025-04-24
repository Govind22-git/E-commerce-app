// models/item.subschema.js
const { Schema, Types } = require('mongoose');

const ItemSchema = new Schema({
    productId: {
        type: Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtPurchase: {
        type: Number,
        required: true,
        min: 0
    }
},
    //  { _id: false }// Optional: _id false if you don’t need _id for each item
);

module.exports = ItemSchema;
