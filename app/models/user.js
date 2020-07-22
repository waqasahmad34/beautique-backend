/* eslint-disable linebreak-style */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
  },
  phoneNumber: {
    type: String,
    unique: true,
    required: [true, 'Phone number is required'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Email is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  profileImage: {
    type: String,
  },
  city: {
    type: String,
  },
  company: {
    type: String,
  },
  homePage: {
    type: String,
  },
  street: {
    type: String,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  supervision: {
    type: Boolean,
    default: false,
  },
  termsCondition: {
    type: Boolean,
    default: false,
  },
  titleImage: {
    type: String,
  },
  token: {
    type: String,
  },
  role: {
    type: String,
    enum: ['photographer', 'admin'],
    default: 'photographer',
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const User = mongoose.model('user', userSchema);
export default User;
