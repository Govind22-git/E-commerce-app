const { object } = require('joi');
const { Schema, model, Types } = require('mongoose');

const productSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price must be a positive number']
        },
        salePrice: {
            type: Number,
            default: null,
            min: [0, 'Sale price must be a positive number']
        },
        inStock: {
            type: Boolean,
            default: true
        },
        stock: {
            type: Number,
            required: true,
            min: [0, 'Stock cannot be negative']
        },
        sku: {
            type: String,
            required: true,
            unique: true
        },
        images: { type: Object },
        category: {
            type: Types.ObjectId,
            ref: 'Category',
            required: true, index: true
        },
        subCategory: {
            type: Types.ObjectId,
            ref: 'Category'
        },
        brand: {
            type: Types.ObjectId,
            ref: 'Brand'
        },
        specifications: {
            type: Schema.Types.Mixed, // If specifications are varied, Schema.Types.Mixed can store any type
            default: {}
        },
        tags: {
            type: [String],
            default: []
        },
        rating: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot be more than 5']
        },
        reviews: [{
            type: Types.ObjectId,
            ref: 'Review'
        }],
        status: { type: Boolean, default: true },
    },
    { timestamps: true }
);
productSchema.index({ name: 'text', description: 'text' });

// Pre-save hook for slug generation from name
productSchema.pre('validate', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name.toLowerCase().split(' ').join('-');
    }
    next();
});

productSchema.pre('save', function (next) {
    if (this.stock === 0) {
        this.inStock = false;
    } else {
        this.inStock = true;
    }
    next();
});

productSchema.virtual('discountedPrice').get(function () {
    return this.salePrice ? this.salePrice : this.price;
});


module.exports = model('Product', productSchema);
