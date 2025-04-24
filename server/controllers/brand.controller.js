const BrandModel = require('../models/brand.model');
// const Brand = require('../models/brand.model');
const cloudinary = require('../utils/cloudinary');

exports.createBrand = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const logo = req.file?.path || null;

        const brand = await BrandModel.create({ name, logo });
        res.status(201).json({ message: 'Brand created successfully', data: brand });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

exports.getAllBrands = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;

        const query = {};

        // If search keyword provided, match against brand name (case-insensitive)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const [brands] = await BrandModel.aggregate([
            { $match: query },
            {
                $facet: {
                    data: [
                        { $sort: { [sort]: order === 'asc' ? 1 : -1 } },
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    count: [{ $count: 'totalLength' }],
                },
            },
        ]);

        res.status(200).json({
            message: 'Brands fetched successfully',
            data: brands?.data || [],
            count: brands?.count[0]?.totalLength || 0,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

exports.getBrandBySlug = async (req, res) => {
    try {
        const brand = await BrandModel.findOne({ slug: req.params?.slug });
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        return res.status(200).json({ message: 'Brand fetched successfully', data: brand });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const { name } = req.body;
        const brand = await BrandModel.findById(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        // Update logo only if a new one is uploaded
        if (req.file?.path) {
            brand.logo = req.file.path;
            // Delete from Cloudinary if needed
            if (brand.logo) {
                const publicId = brand.logo.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
            }
        }


        brand.name = name || brand.name;
        await brand.save();

        res.status(200).json({ message: 'Brand updated successfully', data: brand });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const brand = await BrandModel.findByIdAndDelete(req.params.id);
        if (!brand) return res.status(404).json({ message: 'Brand not found' });

        // Delete from Cloudinary if needed
        if (brand.logo) {
            const publicId = brand.logo.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
        }

        res.status(200).json({ message: 'Brand deleted successfully' });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
