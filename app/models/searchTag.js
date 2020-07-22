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
    });

const SearchTag = mongoose.model('searchTag', searchTag);

export default SearchTag;
