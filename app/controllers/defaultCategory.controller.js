/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */

import BaseController from './base.controller';
import User from '../models/user';
import DefaultCategory from '../models/defaultCategory';
import Constants from '../config/constants';
import _ from 'lodash';

class DefaultCategoryController extends BaseController {
	whitelist = [
	  'imageLink',
	  'title',
	  'defaultCategoryId',
	  'description',
	];
  addDefaultCategory = async (req, res, next) => {
    const {
	  title,
	  description,
    } = req.body;

    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      const treshold = 3;
      const categoryCheck = await DefaultCategory.find({ }).count();
	  if (categoryCheck === treshold) {
        return res.status(400).json({ msg: 'Cannot Add Category More Than 3!' });
	  } else {
        const imageLink = `http://localhost:5000/public/users/defaultCategory/${req.files.imageLink[0].originalname}`;
        const defaultCategory = new DefaultCategory({
          title: title,
          description: description,
          imageLink: imageLink,
          userId: req.user.id,
        });

        await defaultCategory.save();
        return res.status(200).json({ msg: Constants.messages.success });
      }
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getDefaultCategories = async (req, res, next) => {
    try {
	  // See if user exist
	 const defaultCategories = await DefaultCategory.find({ });
	 if (!defaultCategories) {
        return res.status(400).json({ msg: Constants.messages.noCategoryFound });
	  }
      return res.status(200).json({ msg: Constants.messages.success, defaultCategories: defaultCategories });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  deleteDefaultCategory = async (req, res, next) => {
    const { defaultCategoryId } = req.body;
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }

	 const defaultCategory = await DefaultCategory.findByIdAndRemove({ _id: defaultCategoryId });
	 if (!defaultCategory) {
        return res.status(400).json({ msg: Constants.messages.noCategoryFound });
	  }
      return res.status(200).json({ msg: Constants.messages.defaultCategoryRemovedSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  updateDefaultCategory = async (req, res, next) => {
    const { defaultCategoryId, title, description } = req.body;
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	  const obj = {};
	  if (!_.isEmpty(req.files)) {
        obj['imageLink'] = `http://localhost:5000/public/users/defaultCategory/${req.files.imageLink[0].originalname}`;
	  }
	  if (title) {
        obj['title'] = title;
	  }

	  if (description) {
        obj['description'] = description;
	  }
	 const defaultCategory = await DefaultCategory.findByIdAndUpdate({ _id: defaultCategoryId }, { $set: obj }, { new: true });
	 if (!defaultCategory) {
        return res.status(400).json({ msg: Constants.messages.noCategoryFound });
	  }
      return res.status(200).json({ msg: Constants.messages.defaultCategoryUpdateSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
}

export default new DefaultCategoryController();
