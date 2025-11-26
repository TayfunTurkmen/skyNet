const express = require('express');
const path = require('path');
const multer = require('multer');
const authenticateUser = require('../middleware/authMiddleware');
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} = require('../controllers/authController');

const router = express.Router();

// Multer storage for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', authenticateUser, getProfile);
router.patch('/profile', authenticateUser, upload.single('avatar'), updateProfile);

module.exports = router;
