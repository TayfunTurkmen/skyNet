// server/controllers/boardController.js
const Board = require("../models/Board");
const upload = require("../config/cloudinary"); // Cloudinary ayarı

// [POST] Arkaplan Resmi Yükle
const uploadBackground = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi." });
    }
    const fullPublicId = req.file.filename;
    const cleanBgId = fullPublicId.split("/").pop(); // Sadece 'custom_...' kısmı

    res.json({ bgId: cleanBgId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Upload sırasında hata oluştu." });
  }
};

// [GET] Kullanıcının board'larını listele
const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.json(boards);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Hatası" });
  }
};

// [POST] Yeni board oluştur
const createBoard = async (req, res) => {
  const { title, icon, background } = req.body;

  try {
    const newBoard = new Board({
      title,
      icon,
      background,
      isFavorite: false,
      createdBy: req.user.userId,
    });

    const board = await newBoard.save();
    res.status(201).json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Hatası" });
  }
};

// [PUT] Board güncelle / favorile
const updateBoard = async (req, res) => {
  const { title, icon, background, isFavorite } = req.body;
  const updateData = {};
  if (title) updateData.title = title;
  if (icon) updateData.icon = icon;
  if (background) updateData.background = background;
  if (typeof isFavorite === "boolean") updateData.isFavorite = isFavorite;

  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.boardId, createdBy: req.user.userId },
      { $set: updateData },
      { new: true }
    );
    if (!board) return res.status(404).json({ message: "Board bulunamadı" });
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Hatası" });
  }
};

// [DELETE] Board sil
const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.boardId, createdBy: req.user.userId });
    if (!board) return res.status(404).json({ message: "Board bulunamadı" });
    res.json({ message: "Silindi" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server Hatası" });
  }
};

module.exports = {
  uploadBackground,
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
};
