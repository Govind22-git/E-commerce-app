const { Schema, model, Types } = require('mongoose');
const slugify = require('slugify');

const BrandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    logo: {
      type: String, // Should be a URL or filename
      default: null
    },
    status: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);


BrandSchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});


module.exports = model('Brand', BrandSchema);
