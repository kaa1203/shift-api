import express from "express";
import {
  addUser,
  login,
  register,
  verifyAccount,
} from "../../controllers/usersControllers.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/addUser", addUser);

router.get("/verify-account/:token", verifyAccount);

export { router };
