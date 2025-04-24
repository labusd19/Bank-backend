const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    console.log("Radi");
    return next();
  }
  return res
    .status(403)
    .json({ message: "This user does not have admin privileges." });
};
