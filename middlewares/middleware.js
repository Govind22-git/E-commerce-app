const jwt = require("jsonwebtoken");

exports.isLoggedIn = async (req, res, next) => {
    try {
        const token = req.session?.token;
        
        if (token) {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (decode?.id) {
                req.user = decode;
                next();
            } else {
                res.status(401).json({ message: "Unauthorized - Invalid Token", });
            }
        } else {
            res.status(401).json({ message: "Unauthorized - Invalid Token", });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something broke!" });
    }
};

exports.isAdmin = async (req, res, next) => {
    try {        
        const role = req.user?.role;
        if (role === "admin") {
            next();
        } else {
            res.status(401).json({ message: "Unauthorized - Invalid Token", });
        }
    } catch (error) {
        res.status(500).json({ message: "Something broke!" });
    }
};