import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware(["Teacher"]), (req, res)=>{
  res.json({message:"Welcome Teacher"});
});

export default router;