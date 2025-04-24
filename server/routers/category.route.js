const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
    getSubcategoryBySlug,
    deleteCategoryPermanently,
    deleteCategorySaveHierarchy,
    softDeleteCategory
} = require('../controllers/category.controller');
const upload = require('../middlewares/multer');
const { isLoggedIn, isAdmin } = require('../middlewares/middleware');
const { validateCategory } = require('../middlewares/validate.middleware');

// Admin Routes
router.post('/category', isLoggedIn, isAdmin, validateCategory(), upload.single('image'), createCategory);
router.get('/category/:id', isLoggedIn, isAdmin, getCategoryById);
router.put('/category/:id', isLoggedIn, isAdmin, upload.single('image'), updateCategory);
router.patch('/category/:id', isLoggedIn, isAdmin, softDeleteCategory);
router.delete('/category/:id', isLoggedIn, isAdmin, deleteCategorySaveHierarchy);
router.delete('/category/permanently/:id', isLoggedIn, isAdmin, deleteCategoryPermanently);

// Common Routes
router.get('/category', getAllCategories);

// User Route using slug
router.get('/category/slug/:slug', getCategoryBySlug);
router.get('/category/subcategories/:slug', getSubcategoryBySlug);


module.exports = router;
