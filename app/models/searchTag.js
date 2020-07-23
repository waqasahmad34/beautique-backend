/* eslint-disable linebreak-style */
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const searchTag = new Schema(
    {
      tagName: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: new Date(),
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        default: null,
      },
    });

const SearchTag = mongoose.model('searchTag', searchTag);

export default SearchTag;
