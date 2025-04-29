const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const bcrypt = require('bcrypt');
const AddressSchema = require('./address.subschema');
const jwt = require('jsonwebtoken');
const { required } = require('joi');

const userSchema = new Schema(
    {
        name: { type: String, required: true },  // Added 'required' for name
        email: { type: String, required: true, unique: true, index: true, lowercase: true },
        password: { type: String, required: true }, // Fixed the syntax
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
        phone: { type: String, index: true, required: true, unique: true }, // Phone is unique (if needed)
        addressBook: [AddressSchema],
        status: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// 🔐 Password hashing
userSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
    next();
});

// ✅ Method to validate password
userSchema.methods.isPasswordValid = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWTToken = function (expiresIn = "1d") {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            role: this.role,
        },
        process.env.JWT_SECRET,
        { expiresIn }
    );
};

module.exports = model('User', userSchema);
