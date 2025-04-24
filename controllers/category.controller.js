const CategoryModel = require('../models/category.model');
const deleteChildrenRecursively = async (parentId) => {
    const children = await CategoryModel.find({ parent: parentId });

    for (let child of children) {
        if (child.image) {
            const publicId = child.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`categories/${publicId}`);
        }

        await deleteChildrenRecursively(child._id);
        await child.deleteOne();
    }
};

// Create category (Admin)
exports.createCategory = async (req, res) => {
    try {
        const { name, parent, description } = req.body;
        const image = req.file?.path || null;

        const category = await CategoryModel.create({ name, parent, image, description });
        res.status(201).json({ message: "Category created successfully", data: category });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Get all categories (Admin/User)
exports.getAllCategories = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        const role = req?.user?.role;
        const query = {};
        console.log(req?.user);
        
        // If search keyword provided, match against category name (case-insensitive)
        if (search) query.name = { $regex: search, $options: 'i' };
        if (role && role != 'admin') query.status = true;
        if (role && status && role == 'admin') query.status = status;

        // const categories = await CategoryModel.find(query).sort({ createdAt: -1 });  
        const [categories] = await CategoryModel.aggregate([
            { $match: query },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    count: [{ $count: 'totalLength' }],
                },
            },
        ]);

        return res.status(200).json({
            message: "Categories fetched",
            data: categories?.data || [],
            count: categories?.count[0]?.totalLength || 0,
            page: parseInt(page), limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Get category by ID (Admin)
exports.getCategoryById = async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category fetched", data: category });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Get category by Slug (User)
exports.getCategoryBySlug = async (req, res) => {
    try {
        const category = await CategoryModel.find({ slug: req.params.slug, status: true });
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category fetched", data: category });
    } catch (error) {
        logger.error("Error :", error);
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.getSubcategoryBySlug = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        const parent = await CategoryModel.exists({ slug: req.params?.slug });
        if (!parent) return res.status(404).json({ message: "Category not found" });

        const query = { parent: parent?._id };

        // If search keyword provided, match against category name (case-insensitive)
        if (search) query.name = { $regex: search, $options: 'i' };

        if (role != 'admin') query.status = true;
        if (status && role == 'admin') query.status = status;

        const [category] = await CategoryModel.aggregate([
            { $match: query },
            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: (parseInt(page) - 1) * parseInt(limit) },
                        { $limit: parseInt(limit) },
                    ],
                    count: [{ $count: 'totalLength' }],
                },
            },
        ]);

        return res.status(200).json({
            message: "Category fetched successfully",
            data: category?.data || [],
            count: category?.count[0]?.totalLength || 0,
            page: parseInt(page), limit: parseInt(limit)
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

// Update category (Admin)
exports.updateCategory = async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        category.name = req.body.name || category.name;
        category.slug = req.body.slug || category.slug;
        category.description = req.body.description || category.description;
        category.parent = req.body.parent ?? category.parent;

        if (req.file?.path) {
            category.image = req.file?.path;

            // Delete image of parent category
            if (category.image) {
                const publicId = category.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
            }
        }


        await category.save();

        res.status(200).json({ message: "Category updated", data: category });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.softDeleteCategory = async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id, { status: 1 });
        if (!category) return res.status(404).json({ message: "Category not found" });

        category.status = !category?.status;
        await category.save();

        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: "Something broke!" });
    }
}

// Delete category (Admin)
exports.deleteCategorySaveHierarchy = async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        // 1. Reassign children to the parent of the current category
        await CategoryModel.updateMany(
            { parent: category._id },
            { $set: { parent: category.parent || null } }
        );

        // 2. Delete image from Cloudinary
        if (category.image) {
            const publicId = category.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
        }

        // 3. Delete the category itself
        await category.deleteOne();

        res.status(200).json({ message: "Category deleted and children reassigned to parent" });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

exports.deleteCategoryPermanently = async (req, res) => {
    try {
        const category = await CategoryModel.findById(req.params.id);
        if (!category) return res.status(404).json({ message: "Category not found" });

        // Delete all children recursively
        await deleteChildrenRecursively(category._id);

        // Delete image of parent category
        if (category.image) {
            const publicId = category.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`infinityElectronic/Images/${publicId}`);
        }

        // Delete current category
        await category.deleteOne();

        res.status(200).json({ message: "Category and all children deleted" });

    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};