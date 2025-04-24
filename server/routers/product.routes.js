const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middlewares/middleware');
const upload = require('../middlewares/multer'); // For images
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsAdmin,
    getProductByIdAdmin,
    getAllProducts,
    getProductBySlug,
    updateProductStatus
} = require('../controllers/product.controller');
const { validateProduct } = require('../middlewares/validate.middleware');

// Admin Routes
router.post('/product', isLoggedIn, isAdmin, validateProduct(), upload.array('images'), createProduct);
router.put('/product/:id', isLoggedIn, isAdmin, validateProduct(), upload.array('images'), updateProduct);
router.delete('/product/:id', isLoggedIn, isAdmin, deleteProduct);
router.get('/product', isLoggedIn, isAdmin, getAllProductsAdmin);
router.get('/product/:id', isLoggedIn, isAdmin, getProductByIdAdmin);
router.patch('/product/status/:id', isLoggedIn, isAdmin, updateProductStatus);

// User Routes
router.get('/products', getAllProducts); // Paginated
router.get('/product/:slug', getProductBySlug); // Get single by slug

module.exports = router;
