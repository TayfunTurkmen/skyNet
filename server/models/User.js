const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'İsim gereklidir'],
      trim: true,
      minlength: [2, 'İsim en az 2 karakter olmalıdır'],
    },
    email: {
      type: String,
      required: [true, 'E-posta gereklidir'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Şifre gereklidir'],
      minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
      select: false,
    },
    avatarURL: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'violet'],
      default: 'light',
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiry: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
