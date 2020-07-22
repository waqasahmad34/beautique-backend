/* eslint-disable linebreak-style */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const contactUs = new Schema(
    {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      subject: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        default: 'opened',
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null,
      },
      category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        default: null,
      },
      createdAt: {
        type: Date,
        default: new Date(),
      },
      resolvedAt: {
        type: Date,
      },
    });

const ContactUs = mongoose.model('contactUs', contactUs);

export default ContactUs;
