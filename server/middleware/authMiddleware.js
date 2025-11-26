const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateUser = function (req, res, next) {
  const authHeader = req.header("Authorization") || req.header("x-auth-token");

  if (!authHeader) {
    return res.status(401).json({ message: "Token yok, yetkilendirme reddedildi." });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    if (!req.user || !req.user.userId) {
      throw new Error("Token, kullanıcı kimliği içermiyor.");
    }

    next();
  } catch (err) {
    console.error("Token doğrulama hatası:", err.message);
    res.status(401).json({ message: "Token geçerli değil." });
  }
};

module.exports = authenticateUser;
