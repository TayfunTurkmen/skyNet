const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const { getBoards, createBoard, updateBoard, deleteBoard } = require("../controllers/boardController.js");

const { createColumn, getColumns } = require("../controllers/columnController.js");

const router = express.Router();

// Board CRUD
router.get("/", authenticateUser, getBoards);
router.post("/", authenticateUser, createBoard);
router.put("/:boardId", authenticateUser, updateBoard);
router.delete("/:boardId", authenticateUser, deleteBoard);

// Column under board
router.post("/:boardId/columns", authenticateUser, createColumn);
router.get("/:boardId/columns", authenticateUser, getColumns);

module.exports = router;
