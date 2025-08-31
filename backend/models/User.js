import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // always lowercase
      trim: true,
    },

    picture: { type: String, default: '' }, // Google profile image

    password: {
      type: String,
      required: function () {
        return !this.google; // password required only if not Google login
      },
      minlength: 6,
      select: false, // ⬅ important: do not expose password by default
    },

    google: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Forgot Password OTP
    resetPasswordOTPHash: { type: String },
    resetPasswordOTPExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// ✅ Hash password only if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// ✅ Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ✅ Ensure email is always lowercase before saving
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
