import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

//email,password, name
const userSchema = new mongoose.Schema({
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
},
    {
        timestamps: true,
    }
);

// // Middleware Mongoose chạy trước khi save document
// userSchema.pre('save', async function (next) {
//     // 1. Kiểm tra xem field 'password' có bị thay đổi không
//     //    Nếu không thay đổi → không cần hash lại, gọi next()
//     if (!this.isModified('password')) return next();

//     // 2. Hash password mới trước khi lưu vào database
//     //    10 là số salt rounds, càng cao càng bảo mật nhưng tốn thời gian
//     this.password = await bcrypt.hash(this.password, 10);

//     next(); // tiếp tục save document
// });

// // Method để so sánh password nhập vào với password đã hash
// userSchema.methods.comparePassword = async function (password) {
//     // bcrypt.compare trả về true nếu password khớp, false nếu không
//     return await bcrypt.compare(password, this.password);
// };

export default mongoose.model('User', userSchema);