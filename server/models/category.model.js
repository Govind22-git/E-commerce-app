const { Schema, model, Types } = require('mongoose');
const { default: slugify } = require('slugify');

const CategorySchema = new Schema(
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
    parent: {
      type: Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    image: {
      type: String,
      default: null // Optional category image
    },
    status: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);


CategorySchema.pre('validate', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = model('Category', CategorySchema);
