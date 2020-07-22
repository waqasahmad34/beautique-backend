/* eslint-disable linebreak-style */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const supervisionRequest = new Schema(
    {
      name: {
        type: String,
        required: [true, 'Name is required'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null,
      },
      imageUser: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null,
      },
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        default: null,
      },
      highlightId: {
        type: Schema.Types.ObjectId,
        ref: 'highlight',
        default: null,
      },
      imageLink: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: new Date(),
      },
      status: {
        type: String,
        default: 'opened',
      },
      resolvedAt: {
        type: Date,
      },
    });

const SupervisionRequest = mongoose.model('supervisionRequest', supervisionRequest);

export default SupervisionRequest;
