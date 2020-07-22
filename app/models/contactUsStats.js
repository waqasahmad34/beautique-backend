/* eslint-disable linebreak-style */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const contactUsStats = new Schema(
    {
      contactUsCount: {
        type: Number,
        default: 0,
      },
      createdAt: {
        type: Date,
        default: new Date(),
      },
    });

const ContactUsStats = mongoose.model('contactUsStats', contactUsStats);

export default ContactUsStats;
