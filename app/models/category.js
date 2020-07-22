/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'Name is required'],
  },
  location: {
    type: String,
  },
  groupId: {
    type: String,
  },
  supervision: {
    type: Boolean,
    default: false,
  },
  resolution: {
    type: Number,
  },
  size: {
    type: String,
  },
  color: {
    type: String,
  },
  imageLink: {
    type: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  type: {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, 'Type is required'],
  },
  subtype: {
    type: String,
    trim: true,
    lowercase: true,
  },
  format: {
    type: String,
  },
  imageStyle: {
    type: String,
  },
  isActive: {
    type: String,
    default: 'pending',
  },
  extension: {
    type: String,
  },
  tags: [String],
  downloadCount: {
    type: Number,
    default: 0,
  },
  viewedCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Category = mongoose.model('category', categorySchema);
export default Category;
