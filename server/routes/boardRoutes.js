const express = require("express");
const authenticateUser = require("../middleware/authMiddleware.js");
const { getBoards, createBoard, updateBoard, deleteBoard, uploadBackground } = require("../controllers/boardController.js");
const { createColumn, getColumns } = require("../controllers/columnController.js");
const upload = require("../config/cloudinary");

const router = express.Router();

// Board CRUD
router.get("/", authenticateUser, getBoards);
router.post("/", authenticateUser, createBoard);
router.put("/:boardId", authenticateUser, updateBoard);
router.delete("/:boardId", authenticateUser, deleteBoard);

// Upload custom board background
router.post("/upload-bg", authenticateUser, upload.single("image"), uploadBackground);

// Column under board
router.post("/:boardId/columns", authenticateUser, createColumn);
router.get("/:boardId/columns", authenticateUser, getColumns);

module.exports = router;
