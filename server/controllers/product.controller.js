const ProductModel = require('../models/products.model');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, sku, category, subCategory, brand, specifications, tags, salePrice } = req.body;

        const images = req.files?.map(file => file.path) || [];

        await ProductModel.create({
            name,
            description,
            price,
            salePrice,
            stock,
            sku,
            images,
            category,
            subCategory,
            brand,
            specifications: JSON.parse(specifications || '{}'),
            tags: tags?.split(',') || []
        });

        res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (req.files) {
            updates.images = req.files.map(file => file.path);
        };

        const product = await ProductModel.findByIdAndUpdate(id, updates, { new: true });
        // Delete old images
        if (product) {
            product.images.forEach(image => {
                if (!updates.images.includes(image)) {
                    const publicId = image.split('/').pop().split('.')[0];
                    cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
                }
            });
        }
        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Something broke!", error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await ProductModel.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Delete images from Cloudinary
        product.images.forEach(image => {
            const publicId = image.split('/').pop().split('.')[0];
            cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
        });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};

exports.getAllProductsAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const [products] = await ProductModel.aggregate([
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
            message: "Products fetched successfully",
            data: products?.data || [],
            count: products?.count[0]?.totalLength || 0,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.log("Error :", error);
        res.status(500).json({ message: "Failed to fetch", error: error.message });
    }
};

exports.getProductByIdAdmin = async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id).populate('category subCategory brand');
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product fetched successfully", data: product });
    } catch (error) {
        res.status(500).json({ message: "Error fetching product", error: error.message });
    }
};

exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductModel.findById(id, { status: 1 });

        product.status = !product.status;
        await product.save();

        res.status(200).json({ message: "Product status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update product status", error: error.message });
    }
};


// User Controller
exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sort = 'createdAt', order = 'desc' } = req.query;

        const query = { status: true };
        if (search) {
            query.$text = { $search: search };
        }

        const products = await ProductModel.find(query)
            .populate('category subCategory brand')
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .skip((+page - 1) * +limit)
            .limit(+limit);

        const total = await ProductModel.countDocuments(query);

        res.status(200).json({
            message: "Products fetched successfully",
            data: products,
            count: total,
            page: +page,
            limit: +limit
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.getProductBySlug = async (req, res) => {
    try {
        const product = await ProductModel.findOne({ slug: req.params.slug, status: true }).populate('category subCategory brand');
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product fetched successfully", data: product });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};