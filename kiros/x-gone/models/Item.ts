import mongoose from 'mongoose';

export interface IItem extends mongoose.Document {
  content: string;
  type: string;
  createdAt: number;
  expiresAt: number;
}

const ItemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide content.'],
  },
  type: {
    type: String,
    enum: ['note', 'file'],
    default: 'note',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema);
