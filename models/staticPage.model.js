const { Schema, model, Types } = require('mongoose');

const StaticPageSchema = new Schema(
    {
        page: {
            type: String,
            required: true,
            unique: true,
            enum: ['about-us', 'privacy-policy', 'terms-of-service', 'contact-us'], // Add your static pages
            lowercase: true,
            trim: true
        },
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        metaTags: {
            description: { type: String, default: '' },
            keywords: { type: [String], default: [] },
            author: { type: String, default: '' }
        },
        slug: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            index : true
        }
    },
    { timestamps: true }
);

// Pre-save hook to automatically generate a slug from the title or page
StaticPageSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.page.toLowerCase().split(' ').join('-'); // If not provided, generate from page name
    }
    next();
});

module.exports = model('StaticPage', StaticPageSchema);
