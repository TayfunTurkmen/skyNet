const express = require("express");
const router = express.Router();
const { needHelpController } = require("../controllers/needHelpController.js");

// Rota: /api/help
router.post("/", needHelpController);

module.exports = router;