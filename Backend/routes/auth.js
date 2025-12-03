import express from "express";
import {login, setPassword} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/set-password", setPassword);

export default router;
