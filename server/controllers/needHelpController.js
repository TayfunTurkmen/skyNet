const sendHelpEmail = require("../utils/sendHelpEmail.js");

exports.needHelpController = async (req, res) => {
  try {
    const { email, comment } = req.body;
    await sendHelpEmail({ email, comment });
    return res.status(200).json({ message: "Email başarıyla gönderildi" });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({
      message: err.message || "Email gönderilemedi",
    });
  }
};