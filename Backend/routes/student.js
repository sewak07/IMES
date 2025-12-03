import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware(["student"]), (req, res) => {
  res.json({ message: "Welcome Student" });
});

export default router;