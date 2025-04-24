const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  const authHeader = await req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token not found" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedToken;
    next();
  } catch (error) {
    console.log("Invalid token: ", error.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};
