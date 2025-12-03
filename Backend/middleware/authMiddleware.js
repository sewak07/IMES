import jwt from "jsonwebtoken";

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    let token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "SECRET_KEY"
      );

      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

export default authMiddleware;
