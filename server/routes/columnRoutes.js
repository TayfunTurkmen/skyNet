const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const { updateColumn, deleteColumn } = require("../controllers/columnController");
const { getCards, createCard } = require("../controllers/cardController");

const router = express.Router();

// GET and CREATE Cards by column
router.get("/:columnId/cards", authenticateUser, getCards);
router.post("/:columnId/cards", authenticateUser, createCard);

// UPDATE and DELETE
router.put("/:columnId", authenticateUser, updateColumn);
router.delete("/:columnId", authenticateUser, deleteColumn);

module.exports = router;
