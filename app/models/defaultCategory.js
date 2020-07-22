/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const defaultCategorySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  imageLink: {
    type: String,
    required: [true, 'Image is required'],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const DefaultCategory = mongoose.model('defaultCategory', defaultCategorySchema);
export default DefaultCategory;
