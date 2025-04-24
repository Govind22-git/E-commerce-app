const express = require('express');
const router = express.Router();
const upload = require('../middlewares/multer');
const {
    createBrand,
    getAllBrands,
    updateBrand,
    deleteBrand,
    getBrandBySlug,
} = require('../controllers/brand.controller');

const { isLoggedIn, isAdmin } = require('../middlewares/middleware'); // your existing auth middleware

router.post('/brand', isLoggedIn, isAdmin, upload.single('logo'), createBrand);
router.get('/brand', getAllBrands);
router.get('/brand/:slug', getBrandBySlug);
router.put('/brand/:id', isLoggedIn, isAdmin, upload.single('logo'), updateBrand);
router.delete('/brand/:id', isLoggedIn, isAdmin, deleteBrand);

module.exports = router;
