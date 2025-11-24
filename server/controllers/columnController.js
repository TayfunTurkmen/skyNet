const Column = require("../models/Column");
const Card = require("../models/Card");
const Board = require("../models/Board");

// Get all columns for a board
const getColumns = async (req, res) => {
  try {
    const { boardId } = req.params;

    // Board'u bul ve kullanıcıya ait mi kontrol et
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: "Pano bulunamadı" });
    }
    if (board.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Bu işlemi yapmaya yetkiniz yok" });
    }

    // Columnları order'a göre sırala
    const columns = await Column.find({ board: boardId }).sort({ order: 1 });
    res.json(columns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new column
const createColumn = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Kolon başlığı gereklidir" });
    }

    const board = await Board.findOne({ _id: boardId, createdBy: req.user.userId });
    if (!board) {
      return res.status(404).json({ message: "Pano bulunamadı" });
    }

    // Son kolonu bul ve order'ı bir artır
    const lastColumn = await Column.findOne({ board: boardId }).sort({ order: -1 });
    const newOrder = lastColumn ? lastColumn.order + 1 : 0;

    const column = new Column({
      title: title.trim(),
      board: boardId,
      order: newOrder,
    });

    await column.save();
    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update column
const updateColumn = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Kolon başlığı gereklidir" });
    }

    const column = await Column.findById(columnId).populate("board");
    if (!column) {
      return res.status(404).json({ message: "Kolon bulunamadı" });
    }

    if (column.board.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    column.title = title.trim();
    await column.save();
    res.json(column);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete column
const deleteColumn = async (req, res) => {
  try {
    const { columnId } = req.params;

    console.log(req.params);

    const column = await Column.findById(columnId).populate("board");
    console.log(column);
    if (!column) {
      return res.status(404).json({ message: "Kolon bulunamadı" });
    }

    if (column.board.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }

    // Kolona ait tüm kartları sil
    await Card.deleteMany({ column: columnId });

    // Kolonu sil
    await Column.deleteOne({ _id: columnId });

    res.json({ message: "Kolon silindi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
};
