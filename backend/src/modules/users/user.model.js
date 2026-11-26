import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    demoId: { type: String, required: true, unique: true, immutable: true },
    initials: { type: String, required: true, trim: true },
    passwordHash: { type: String, select: false },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
