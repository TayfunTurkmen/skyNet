const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const generateRefreshToken = require('../utils/generateRefreshToken');
const sendPasswordResetEmail = require('../utils/sendPasswordResetEmail');

const buildUserResponse = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  avatarURL: userDoc.avatarURL,
  theme: userDoc.theme,
});

const normalizeEmailInput = (input) => {
  if (!input) {
    return '';
  }

  const trimmed = input.trim();
  return (
    validator.normalizeEmail(trimmed, {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    }) || trimmed.toLowerCase()
  );
};

const saveRefreshToken = async (userDoc, refreshToken) => {
  userDoc.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  await userDoc.save({ validateBeforeSave: false });
};

const sendAuthResponse = async ({ res, user, statusCode, message }) => {
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  await saveRefreshToken(user, refreshToken);

  res.status(statusCode).json({
    message,
    token,
    refreshToken,
    user: buildUserResponse(user),
  });
};

const getClientBaseURL = () => {
  if (!process.env.CLIENT_URL) {
    return 'http://localhost:3000';
  }

  const [firstURL] = process.env.CLIENT_URL.split(',').map((item) => item.trim()).filter(Boolean);
  return firstURL || 'http://localhost:3000';
};

const verifyRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error('Refresh token gereklidir');
    error.statusCode = 400;
    throw error;
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    const error = new Error('JWT_REFRESH_SECRET tanımlı değil');
    error.statusCode = 500;
    throw error;
  }

  try {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    const error = new Error('Geçersiz veya süresi dolmuş refresh token');
    error.statusCode = 401;
    throw error;
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'İsim, e-posta ve şifre zorunludur' });
    }

    const trimmedEmail = email.trim();

    if (!validator.isEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    if (!validator.isStrongPassword(password, { minNumbers: 1, minSymbols: 0 })) {
      return res.status(400).json({
        message:
          'Şifre en az 8 karakter olmalı, en az bir rakam ve en az bir büyük harf içermelidir',
      });
    }

    const normalizedEmail = normalizeEmailInput(trimmedEmail);
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'Bu e-posta ile kayıtlı kullanıcı bulunuyor' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    await sendAuthResponse({
      res,
      user,
      statusCode: 201,
      message: 'Kullanıcı başarıyla oluşturuldu',
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre zorunludur' });
    }

    const trimmedEmail = email.trim();

    if (!validator.isEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    const normalizedEmail = normalizeEmailInput(trimmedEmail);
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Email or password is incorrect' });
    }

    await sendAuthResponse({
      res,
      user,
      statusCode: 200,
      message: 'Başarıyla giriş yapıldı',
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = await verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId).select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: 'Refresh token doğrulanamadı' });
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Refresh token doğrulanamadı' });
    }

    await sendAuthResponse({
      res,
      user,
      statusCode: 200,
      message: 'Token yenilendi',
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(200).json({ message: 'Çıkış yapıldı' });
    }

    try {
      const decoded = await verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId).select('+refreshTokenHash');

      if (user && user.refreshTokenHash) {
        const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);

        if (isMatch) {
          user.refreshTokenHash = undefined;
          await user.save({ validateBeforeSave: false });
        }
      }
    } catch (err) {
      if (!err.statusCode || err.statusCode >= 500) {
        return next(err);
      }
      // token geçersizse de çıkışı başarılı sayıyoruz
    }

    res.status(200).json({ message: 'Çıkış yapıldı' });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    const trimmedEmail = email.trim();

    if (!validator.isEmail(trimmedEmail)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta adresi giriniz' });
    }

    const normalizedEmail = normalizeEmailInput(trimmedEmail);
    const user = await User.findOne({ email: normalizedEmail });
    const genericMessage = { message: 'Eğer e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi' };

    if (!user) {
      return res.status(200).json(genericMessage);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetTokenExpiry = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const clientURL = getClientBaseURL().replace(/\/$/, '');
    const resetURL = `${clientURL}/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetURL,
      });
    } catch (emailError) {
      user.passwordResetTokenHash = undefined;
      user.passwordResetTokenExpiry = undefined;
      await user.save({ validateBeforeSave: false });

      const error = new Error('Şifre sıfırlama e-postası gönderilemedi');
      error.statusCode = 500;
      throw error;
    }

    res.status(200).json(genericMessage);
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token ve yeni şifre gereklidir' });
    }

    if (!validator.isStrongPassword(password, { minNumbers: 1, minSymbols: 0 })) {
      return res.status(400).json({
        message:
          'Şifre en az 8 karakter olmalı, en az bir rakam ve en az bir büyük harf içermelidir',
      });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: resetTokenHash,
      passwordResetTokenExpiry: { $gt: Date.now() },
    }).select('+passwordResetTokenHash');

    if (!user) {
      return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş token' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiry = undefined;
    await user.save();

    await sendAuthResponse({
      res,
      user,
      statusCode: 200,
      message: 'Şifreniz güncellendi',
    });
  } catch (error) {
    next(error);
  }
};
