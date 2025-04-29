const Joi = require('joi');
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((err) => err.message);
            return res.status(400).json({ message: errors[0] });
        }
        next();
    };
};

exports.validateRegister = () => {
    const registerSchema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 3 characters long',
                'string.max': 'Name must be at most 50 characters long',
                'any.required': 'Name is required',
            }),

        email: Joi.string()
            .email()
            .lowercase()
            .required()
            .messages({
                'string.base': 'Email must be a string',
                'string.email': 'Email must be a valid email address',
                'string.empty': 'Email is required',
                'any.required': 'Email is required',
            }),

        password: Joi.string()
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{6,}$'))
            .required()
            .messages({
                'string.pattern.base':
                    'Password must include uppercase, lowercase, number, and special character',
                'string.empty': 'Password is required',
                'any.required': 'Password is required',
            }),

        phone: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                'string.pattern.base': 'Phone number must be exactly 10 digits',
                'string.empty': 'Phone number is required',
                'any.required': 'Phone number is required',
            }),
    });
    return validate(registerSchema);
};

exports.validateUser = () => {
    const UserSchema = Joi.object({
        name: Joi.string()
            .min(3)
            .max(50)
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 3 characters long',
                'string.max': 'Name must be at most 50 characters long',
                'any.required': 'Name is required',
            }),

        email: Joi.string()
            .email()
            .lowercase()
            .required()
            .messages({
                'string.base': 'Email must be a string',
                'string.email': 'Email must be a valid email address',
                'string.empty': 'Email is required',
                'any.required': 'Email is required',
            }),
        phone: Joi.string()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                'string.pattern.base': 'Phone number must be exactly 10 digits',
                'string.empty': 'Phone number is required',
                'any.required': 'Phone number is required',
            }),
    });
    return validate(UserSchema);
};

exports.validateLogin = () => {
    const loginSchema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.base': 'Email must be a string',
            'string.email': 'Email must be a valid email address',
            'string.empty': 'Email is required',
            'any.required': 'Email is required',
        }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required',
        }),
    }); return validate(loginSchema);
};

exports.validateCategory = () => {
    const CategorySchema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.base': 'Name must be a string',
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name must be at most 100 characters long',
                'any.required': 'Name is required',
            }),

        parent: Joi.string()
            .optional()
            .allow(null, '')
            .messages({
                'string.base': 'Parent ID must be a string',
            }),

        description: Joi.string()
            .max(1000)
            .optional()
            .allow('')
            .messages({
                'string.base': 'Description must be a string',
                'string.max': 'Description can be at most 1000 characters long',
            }),

        //   image: Joi.string()
        //     .uri()
        //     .optional()
        //     .allow(null, '')
        //     .messages({
        //       'string.uri': 'Image must be a valid URL',
        //     }),
    });

    return validate(CategorySchema);
};

exports.validateProduct = () => {
    const productSchema = Joi.object({
        name: Joi.string().min(3).max(100).required().messages({
            'string.base': 'Name must be a string',
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 3 characters long',
            'string.max': 'Name must be at most 100 characters long',
            'any.required': 'Name is required',
        }),

        description: Joi.string().required().messages({
            'string.empty': 'Description is required',
            'any.required': 'Description is required',
        }),

        price: Joi.number().min(0).required().messages({
            'number.base': 'Price must be a number',
            'number.min': 'Price must be a positive number',
            'any.required': 'Price is required',
        }),

        salePrice: Joi.number().min(0).allow(null).optional().messages({
            'number.base': 'Sale price must be a number',
            'number.min': 'Sale price must be a positive number',
        }),

        stock: Joi.number().min(0).required().messages({
            'number.base': 'Stock must be a number',
            'number.min': 'Stock cannot be negative',
            'any.required': 'Stock is required',
        }),

        sku: Joi.string().required().messages({
            'string.empty': 'SKU is required',
            'any.required': 'SKU is required',
        }),

        category: Joi.string().required().messages({
            'string.empty': 'Category ID is required',
            'any.required': 'Category ID is required',
        }),

        subCategory: Joi.string().optional().allow(null, ''),

        brand: Joi.string().optional().allow(null, ''),

        specifications: Joi.object().optional().messages({
            'object.base': 'Specifications must be an object',
        }),

        tags: Joi.array().items(Joi.string()).optional(),

        rating: Joi.number().min(0).max(5).optional(),
    });

    return validate(productSchema);
};

exports.validateAddToCart = () => {
    const schema = Joi.object({
        productId: Joi.string().required().messages({
            'any.required': 'Product ID is required',
            'string.empty': 'Product ID cannot be empty',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'Quantity must be a number',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
        }),
    });
    return validate(schema);
};

exports.validateUpdateCartItem = () => {
    const schema = Joi.object({
        productId: Joi.string().required().messages({
            'any.required': 'Product ID is required',
            'string.empty': 'Product ID cannot be empty',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
            'number.base': 'Quantity must be a number',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required',
        }),
    });
    return validate(schema);
};

exports.validateRemoveCartItem = () => {
    const schema = Joi.object({
        productId: Joi.string().required().messages({
            'any.required': 'Product ID is required',
            'string.empty': 'Product ID cannot be empty',
        }),
    });
    return validate(schema);
};

exports.validateCreateCoupon = () => {
    const schema = Joi.object({
        code: Joi.string()
            .trim()
            .uppercase()
            .required()
            .messages({
                'string.base': 'Code must be a string',
                'string.empty': 'Coupon code is required',
                'any.required': 'Coupon code is required',
            }),

        discountType: Joi.string()
            .valid('flat', 'percent')
            .required()
            .messages({
                'any.only': 'Discount type must be either "flat" or "percent"',
                'any.required': 'Discount type is required',
            }),

        value: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': 'Discount value must be a number',
                'number.min': 'Discount value must be greater than or equal to 0',
                'any.required': 'Discount value is required',
            }),

        minOrderValue: Joi.number()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Minimum order value must be a number',
                'number.min': 'Minimum order value must be 0 or more',
            }),

        expiryDate: Joi.date()
            .greater('now')
            .required()
            .messages({
                'date.base': 'Expiry date must be a valid date',
                'date.greater': 'Expiry date must be in the future',
                'any.required': 'Expiry date is required',
            }),

        usageLimit: Joi.number()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Usage limit must be a number',
                'number.min': 'Usage limit must be at least 1',
            }),

        isActive: Joi.boolean()
            .default(true)
    });

    return validate(schema);
};

exports.validateApplyCoupon = () => {
    const schema = Joi.object({
        code: Joi.string()
            .trim()
            .uppercase()
            .required()
            .messages({
                'string.base': 'Code must be a string',
                'string.empty': 'Coupon code is required',
                'any.required': 'Coupon code is required',
            }),
    });
    return validate(schema);
};

exports.validateCreateOrder = () => {
    const schema = Joi.object({
        shippingAddress: Joi.object({
            street: Joi.string()
                .required()
                .messages({
                    'string.base': 'Street must be a string',
                    'string.empty': 'Street is required',
                    'any.required': 'Street is required',
                }),
            city: Joi.string()
                .required()
                .messages({
                    'string.base': 'City must be a string',
                    'string.empty': 'City is required',
                    'any.required': 'City is required',
                }),
            state: Joi.string()
                .required()
                .messages({
                    'string.base': 'State must be a string',
                    'string.empty': 'State is required',
                    'any.required': 'State is required',
                }),
            postalCode: Joi.string()
                .required()
                .messages({
                    'string.base': 'Postal code must be a string',
                    'string.empty': 'Postal code is required',
                    'any.required': 'Postal code is required',
                }),
            country: Joi.string()
                .required()
                .messages({
                    'string.base': 'Country must be a string',
                    'string.empty': 'Country is required',
                    'any.required': 'Country is required',
                }),
        }).required(),
        paymentMethod: Joi.string()
            .valid('COD', 'online')
            .required()
            .messages({
                'any.only': 'Payment method must be either "COD" or "online"',
                'any.required': 'Payment method is required',
            }),
    });

    return validate(schema);
};

