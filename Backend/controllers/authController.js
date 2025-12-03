import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Teacher from "../models/Teacher.js";
import Student from "../models/Student.js";


//login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user =
      (await Admin.findOne({ email })) ||
      (await Student.findOne({ email })) ||
      (await Teacher.findOne({ email }));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        role: user.constructor.modelName,
      },
      process.env.JWT_SECRET || "SECRET_KEY",
      { expiresIn: "1h" }
    );
    res.json({
      token,
      role: user.constructor.modelName,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
}

//set password controller
export const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user =
      (await Teacher.findOne({ email })) ||
      (await Student.findOne({ email }));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.password) {
      return res.status(400).json({ message: "password already set" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    await user.save();
    res.json({ message: "Password set successfully" });
  } catch (error) {
    console.log("error");
    res.status(500).json({ message: "Server Error" });
  }
}