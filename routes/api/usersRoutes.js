import express from "express";
import {
  changePassword,
  changePasswordRequest,
  createUser,
  getProfile,
  getUserById,
  getUsers,
  login,
  logout,
  register,
  softDeleteUser,
  test,
  updateUser,
  verifyAccount,
  verifyAccountRequest,
} from "../../controllers/usersControllers.js";

import checkAccountStatus from "../../middlewares/checkAccStatusMiddleware.js";
import authenticate from "../../middlewares/authMiddleware.js";
import checkAccountType from "../../middlewares/checkAccTypeMiddleware.js";

const router = express.Router();

router
  .post("/register", register)
  .post("/verify-account-request", verifyAccountRequest);

router.get("/verify-account/:token", verifyAccount);

router.post("/change-password-request", changePasswordRequest);
router.patch("reset-password", changePassword);
router.patch("change-password", authenticate, changePassword);

router.post("/login", checkAccountStatus, login);

router.get("/device", test);
router.get("/profile", authenticate, getProfile);
router
  .get("/get-users", authenticate, checkAccountType, getUsers)
  .get("/get-users/:userId", authenticate, checkAccountType, getUserById);

router.post("/create-user", authenticate, checkAccountType, createUser);

router
  .patch("/update-user", authenticate, updateUser)
  .patch("/update-user/:userId", authenticate, checkAccountType, updateUser);

router.patch("/soft-delete", authenticate, softDeleteUser);

router.post("/logout", authenticate, logout);

export { router };
