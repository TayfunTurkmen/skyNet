const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Cloudinary Bağlantı Ayarları
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Motoru (Yükleme Kuralları)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'TaskProFolder', // <-- BURASI TaskProFolder OLMALI
    allowed_formats: ['jpg', 'png', 'jpeg'],
    public_id: (req, file) => `custom_${Date.now()}`, 
  },
});

const upload = multer({ storage: storage });

module.exports = upload;