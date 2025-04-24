const { Schema, model, Types } = require('mongoose');

const CouponDiscountSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    discountType: {
      type: String,
      enum: ['flat', 'percent'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    minOrderValue: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    usedBy: [{
      type: Types.ObjectId,
      ref: 'User'
    }]
  },
  { timestamps: true }
);

module.exports = model('CouponDiscount', CouponDiscountSchema);
