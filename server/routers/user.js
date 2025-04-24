const express = require("express");
const { register, login, logoutUser, getUserById, getUsers, changePassword, changePasswordByAdmin, updateUser, updateUserStatus } = require("../controllers/auth.controller");
const { validateRegister, validateLogin, validateUser } = require("../middlewares/validate.middleware");
const { isLoggedIn, isAdmin } = require("../middlewares/middleware");
const router = express.Router();

router.get("/user", (req, res) => res.send("user router"));
// Authenticate APIs
router.post('/user/register', isLoggedIn, validateRegister(), register);
router.post('/auth/login', validateLogin(), login);
router.get('/auth/logout', logoutUser);

// Admin APIs
router.get('/users', isLoggedIn, isAdmin, getUsers);
router.patch("/change-password/:id", isLoggedIn, isAdmin, changePasswordByAdmin);
router.patch("/user/status/:id", isLoggedIn, isAdmin, updateUserStatus);

// User APIs
router.get('/me', isLoggedIn, (req, res) => res.json(req.user));
router.get('/user/:id', isLoggedIn, getUserById);
router.patch("/change-password", isLoggedIn, changePassword);
router.put("/user/profile/:id", isLoggedIn, validateUser(), updateUser);


module.exports = router;