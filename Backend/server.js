import app from "./app.js";
import Admin from "./models/Admin.js";
import bcrypt from "bcrypt";
import connectDb from "./db/database.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 9001;

const start = async () => {
  try {
    await connectDb();

    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
    const defaultUser = process.env.DEFAULT_ADMIN_USERNAME || "admin";
    const defaultPass = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

    const existing = await Admin.findOne({ email: defaultEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(defaultPass, 10);
      await Admin.create({ username: defaultUser, email: defaultEmail, password: hashed });
      console.log("Default admin created:", defaultEmail, defaultPass);
    } else {
      console.log("Default admin exists:", defaultEmail);
    }

    app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

start();
