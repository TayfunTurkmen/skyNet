const mongoose = require('mongoose');

const connectDatabase = async () => {
  const dbURI = process.env.MONGODB_URI;

  if (!dbURI) {
    throw new Error('MONGODB_URI tanımlı değil');
  }

  await mongoose.connect(dbURI);
  // eslint-disable-next-line no-console
  console.log(`MongoDB bağlantısı başarılı: ${mongoose.connection.host}`);
};

module.exports = connectDatabase;
