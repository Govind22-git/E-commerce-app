const UserModel = require('../models/users.model');

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already registered.' });

        UserModel.create({ name, email, password, phone });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something broke!' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.status) return res.status(401).json({ message: 'User is inactive. Please contact admin' });

        const isMatch = await user.isPasswordValid(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = user.generateJWTToken();
        req.session.token = token;

        res.json({ message: 'Login successful', data: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something broke!' });
    }
};

// Logout user
exports.logoutUser = async (req, res) => {
    try {
        req.session.destroy();
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: 'Failed to logout user' });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req?.user?._id;
    const { currentPassword, newPassword } = req?.body;

    // checking user has entered password or not
    if (!currentPassword) return res.status(400).json({ message: "Current password is required" });
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    try {
        // finding user and extracting password
        const user = await UserModel.findById(userId, { password: 1 });
        if (!user) return res.status(404).json({ message: "User not found" });

        // validating current password  and password entered by user
        const isMatch = await user.isPasswordValid(currentPassword);
        if (!isMatch) return res.status(401).json({ message: "Current password Incorrect!" });

        // Step 3: Set new password and trigger save (hashing happens in pre-save hook)
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ message: "password changed successfully" });
    } catch (error) {
        console.log("Error :", error);
        return res.status(500).json({ message: "Something broke!" });
    }
}

exports.changePasswordByAdmin = async (req, res) => {
    const userId = req.params?.id;
    const { newPassword } = req?.body;

    // checking user has entered password or not
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    try {
        // finding user and extracting password
        const user = await UserModel.findById(userId, { password: 1 });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Set new password and trigger save (hashing happens in pre-save hook)
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ message: "password changed successfully" });
    } catch (error) {
        console.log("Error :", error);
        return res.status(500).json({ message: "Something broke!" });
    }
}

exports.updateUserStatus = async (req, res) => {
    try {
        const userId = req.params?.id;
        const { status } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = status;
        await user.save();
        return res.status(200).json({ message: "User status updated successfully", data: user });
    } catch (error) {
        console.log("Error :", error);
        return res.status(500).json({ message: "Something broke!" });
    }
}

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params?.id;
        const user = await UserModel.findById(userId, { password: 0 });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: "User fetched successfully", data: user });
    } catch (error) {
        console.error("Error :", error);
        return res.status(500).json({ message: 'Something broke!' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10, sort = 'createdAt', order = 'desc', status } = req.query;

        const query = {};
        if (status) query.status = status;

        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
        ];

        // const users = await UserModel.find({}, { password: 0 });
        const [users] = await UserModel.aggregate([
            { $match: query },
            // { $sort: { [sort]: order === 'asc' ? 1 : -1 } },
            // { $skip: (page - 1) * limit },
            // { $limit: limit },
            {
                $facet: {
                    data: [
                        { $sort: { [sort]: order === 'asc' ? 1 : -1 } },
                        { $skip: parseInt(+page - 1) * parseInt(limit || 10) || 0 },
                        { $limit: parseInt(limit) || 10 },
                        { $project: { password: 0 } },
                    ],
                    count: [{ $count: "totalLength" }],
                },
            },

        ]
        )

        if (!users) return res.status(404).json({ message: 'Users not found' });
        res.status(200).json({
            message: "Users fetched successfully",
            data: users?.data || [],
            count: users?.count[0].totalLength || 0,
            page: parseInt(page),
            limit: parseInt(limit),
        });
    } catch (error) {
        console.error("Error :", error);
        return res.status(500).json({ message: 'Something broke!' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params?.id;
        const { name, email, phone, addressBook } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = name;
        user.email = email;
        user.phone = phone;
        user.addressBook = addressBook || [];

        await user.save();
        res.status(200).json({ message: "User updated successfully", data: user });
    } catch (error) {
        console.log("Error :", error);
        return res.status(500).json({ message: "Something broke!" });
    }
}

