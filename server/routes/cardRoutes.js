const express = require("express");
const authenticateUser = require("../middleware/authMiddleware");
const { getCards, createCard, updateCard, deleteCard, moveCard } = require("../controllers/cardController");

const router = express.Router();

// UPDATE, DELETE, MOVE Cards Operations
router.put("/:cardId", authenticateUser, updateCard);
router.delete("/:cardId", authenticateUser, deleteCard);
router.patch("/:cardId/move", authenticateUser, moveCard);

module.exports = router;
