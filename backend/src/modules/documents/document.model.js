import mongoose from 'mongoose'

const emptyDocument = () => ({ type: 'doc', content: [{ type: 'paragraph' }] })

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    content: { type: mongoose.Schema.Types.Mixed, default: emptyDocument },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharedPermissions: [{
      _id: false,
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { type: String, enum: ['viewer', 'editor'], default: 'editor' },
    }],
  },
  { timestamps: true, minimize: false },
)

documentSchema.index({ sharedWith: 1, updatedAt: -1 })
documentSchema.index({ owner: 1, updatedAt: -1 })

export const Document = mongoose.model('Document', documentSchema)
