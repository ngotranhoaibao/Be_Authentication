import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);
userSchema.methods.createPasswordResetToken = function () {
  // 1. Tạo token ngẫu nhiên (gửi cho user)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Mã hóa token để lưu vào DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Hết hạn sau 10 phút
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Middleware Mongoose chạy trước khi save document
userSchema.pre("save", async function () {
  // 1. Kiểm tra xem field 'password' có bị thay đổi không
  //    Nếu không thay đổi → không cần hash lại, gọi next()
  if (!this.isModified("password")) return ;

  // 2. Hash password mới trước khi lưu vào database
  //    10 là số salt rounds, càng cao càng bảo mật nhưng tốn thời gian
  this.password = await bcrypt.hash(this.password, 10);
});

// Method để so sánh password nhập vào với password đã hash
userSchema.methods.comparePassword = async function (password) {
  // bcrypt.compare trả về true nếu password khớp, false nếu không
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
