const Card = require("../models/Card");
const Column = require("../models/Column");
const Board = require("../models/Board");

// Get all cards for a column
const getCards = async (req, res) => {
  try {
    const { columnId } = req.params;

    const column = await Column.findById(columnId).populate("board");
    if (!column) return res.status(404).json({ message: "Column not found" }); // Çevrildi
    if (!column.board || !column.board.createdBy)
      return res.status(400).json({ message: "Board associated with this column not found" }); // Çevrildi

    // Check if board belongs to user
    if (column.board.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ message: "You are not authorized to perform this action" }); // Çevrildi

    const cards = await Card.find({ column: columnId }).sort({ order: 1 });
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new card
const createCard = async (req, res) => {
  try {
    const { columnId } = req.params;
    // boardId'yi req.body'den kaldırdık veya kullanmıyoruz
    const { title, description, priority, deadline } = req.body;

    // Validate required fields
    if (!title || !title.trim()) return res.status(400).json({ message: "Card title is required" }); // Çevrildi
    if (!description || !description.trim()) return res.status(400).json({ message: "Card description is required" }); // Çevrildi

    const column = await Column.findById(columnId).populate("board");
    if (!column) return res.status(404).json({ message: "Column not found" }); // Çevrildi

    // Validate board ownership
    if (!column.board || column.board.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ message: "You are not authorized to perform this action" }); // Çevrildi

    // Get the highest order value in the column
    const lastCard = await Card.findOne({ column: columnId }).sort({ order: -1 });
    const newOrder = lastCard ? lastCard.order + 1 : 0;

    // Validate deadline if provided
    let parsedDeadline = null;
    if (deadline) {
      parsedDeadline = new Date(deadline);

      // Tarih doğrulamasını sadece güne indirge
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDateOnly = new Date(parsedDeadline);
      deadlineDateOnly.setHours(0, 0, 0, 0);

      if (deadlineDateOnly < today) {
        return res.status(400).json({ message: "Cannot select a past date" }); // Çevrildi
      }
    }

    const card = new Card({
      title: title.trim(),
      description: description.trim(),
      priority: priority || "Without",
      deadline: parsedDeadline,
      column: columnId,
      board: column.board._id, // boardId kolon üzerinden alınır
      order: newOrder,
      createdBy: req.user.userId,
    });

    await card.save();
    res.status(201).json(card);
  } catch (error) {
    console.error("Card Create Hata:", error.message, error.stack);
    if (error.name === "ValidationError") {
      // Mongoose Validation Error'dan gelen mesajlar modelinizdeki İngilizce mesajlar olacaktır
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error: Failed to create card" }); // Çevrildi
  }
};

// Update card
const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description, priority, deadline } = req.body;

    const card = await Card.findById(cardId).populate({ path: "column", populate: "board" });
    if (!card) return res.status(404).json({ message: "Card not found" }); // Çevrildi

    if (card.column.board.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ message: "You are not authorized to perform this action" }); // Çevrildi

    if (title && !title.trim()) return res.status(400).json({ message: "Card title cannot be empty" }); // Çevrildi
    if (description && !description.trim())
      return res.status(400).json({ message: "Card description cannot be empty" });

    if (title) card.title = title.trim();
    if (description) card.description = description.trim();
    if (priority) card.priority = priority;

    if (deadline !== undefined) {
      if (deadline) {
        const parsedDeadline = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDateOnly = new Date(parsedDeadline);
        deadlineDateOnly.setHours(0, 0, 0, 0);

        if (deadlineDateOnly < today) return res.status(400).json({ message: "Cannot select a past date" }); // Çevrildi
        card.deadline = parsedDeadline;
      } else {
        card.deadline = null;
      }
    }

    await card.save();
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Delete card
const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    const card = await Card.findById(cardId).populate({ path: "column", populate: "board" });
    if (!card) return res.status(404).json({ message: "Card not found" }); // Çevrildi

    if (card.column.board.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ message: "You are not authorized to perform this action" }); // Çevrildi

    await Card.deleteOne({ _id: cardId });
    res.json({ message: "Card deleted successfully" }); // Çevrildi
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Move card to another column
const moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { columnId } = req.body;

    const card = await Card.findById(cardId).populate({ path: "column", populate: "board" });
    if (!card) return res.status(404).json({ message: "Card not found" }); // Çevrildi

    if (card.column.board.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ message: "You are not authorized to perform this action" }); // Çevrildi

    const targetColumn = await Column.findById(columnId).populate("board");
    if (!targetColumn) return res.status(404).json({ message: "Target column not found" }); // Çevrildi
    if (targetColumn.board.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ message: "You are not authorized to perform this action" }); // Çevrildi

    const lastCard = await Card.findOne({ column: columnId }).sort({ order: -1 });
    const newOrder = lastCard ? lastCard.order + 1 : 0;

    card.column = columnId;
    card.order = newOrder;
    card.board = targetColumn.board._id;
    await card.save();

    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCards,
  createCard,
  updateCard,
  deleteCard,
  moveCard,
};
