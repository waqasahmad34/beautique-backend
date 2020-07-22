/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */

import BaseController from './base.controller';
import User from '../models/user';
import DefaultCategory from '../models/defaultCategory';
import Category from '../models/category';
import SupervisionRequest from '../models/supervisionRequest';
import SearchTag from '../models/searchTag';
import Constants from '../config/constants';
import sizeOf from 'image-size';
import _ from 'lodash';

class CategoryController extends BaseController {
	whitelist = [
	  'categoryId',
	  'name',
	  'location',
	  'type',
	  'subtype',
	  'format',
	  'imageStyle',
	  'color',
	  'extension',
	  'tags',
	  'resolution',
	  'imageLink',
	  'supervision',
	  'groupId',
	];
  imageUpload = async (req, res, next) => {
    // filter data of whitelist with body
    const params = this.filterParams(req.body, this.whitelist);
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
	  params['imageLink'] = `http://localhost:5000/public/users/category/${req.files.imageLink[0].originalname}`;
      const dimensions = sizeOf(`app/public/users/category/${req.files.imageLink[0].originalname}`);
      params['resolution'] = Math.round((dimensions.width*dimensions.height) / 1000000);
      params['user'] = req.user.id;
      params['format'] = req.body.type;
      params['size'] = req.files.imageLink[0].size;
      params['supervision'] = req.user.supervision;
      params['isActive'] = 'pending';
      params['extension'] = req.files.imageLink[0].filename.split('.')[1];
      const category = new Category({
        ...params,
      });
      await category.save();
      return res.status(200).json({ msg: Constants.messages.imageUploadSuccess });
    } catch (err) {
      console.log('err: ', err);
      err.status = 400;
      next(err);
    }
  };


  search = async (req, res, next) => {
    // extract data from body
    const { search, type, subtype } = req.body;
    try {
      // find categories based on name, with help of type and subtype
      const categories = await Category.find({
        $and: [
          {
            $expr: {
              $cond: { if: { $or: [
                { subtype: subtype },
              ] }, then: true, else: true },
            },
          },
          {
            $and: [
              { name: { $regex: search } },
              { type: type },
              { isActive: 'active' },
            ],
          },
        ],
      }).populate('user', 'firstName lastName profileImage company description');
      if (!categories) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      const searchTag = new SearchTag({
        tagName: search,
      });
      await searchTag.save();
      return res.status(200).json({ msg: Constants.messages.success, categories: categories });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  filter = async (req, res, next) => {
    // extract data from body
    const { format, resolution, color, supervision, imageStyle, search, type, subtype } = req.body;

    try {
      // find categories based on name, with help of type and subtype
      const categories = await Category.find({
        $and: [
          {
            $expr: {
              $cond: { if: { $or: [
                { format: format },
                { resolution: resolution },
                { color: color },
                { supervision: supervision },
                { imageStyle: imageStyle },
                { subtype: subtype },
              ] }, then: true, else: true },
            },
          },
          {
            $and: [
              { name: { $regex: search } },
              { type: type },
              { isActive: 'active' },
            ],
          },
        ],
      }).populate('user', 'firstName lastName profileImage company description');
      if (!categories) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, categories: categories });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getSearchTags = async (req, res, next) => {
    try {
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      // find categorie and update
      const searchTag = await SearchTag.aggregate([
        { $group: { _id: '$tagName', createdAt: { $last: '$createdAt' }, mostSearchedTags: { $sum: 1 } } },
        { $sort: { mostSearchedTags: -1 } },
      ]);
      if (!searchTag) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, searchTag: searchTag });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  addSupervisionRequest = async (req, res, next) => {
    const { name, email, highlightId, categoryId, user, imageLink, imageUser } = req.body;
    try {
	 const supervisionRequest = await SupervisionRequest.findOne({ $and: [{ email: email }, { categoryId: categoryId }] });
	 if (!supervisionRequest) {
        const supervisionReq = new SupervisionRequest({
          name,
          email,
          highlightId,
          user,
          categoryId,
          imageLink,
          imageUser,
        });
        await supervisionReq.save();
        return res.status(200).json({ msg: Constants.messages.supervisionReqSuccess });
      }

      return res.status(400).json({ msg: Constants.messages.supervisionReqFail });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getOpenedSupervisionRequests = async (req, res, next) => {
    try {
      // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	 const supervisionRequests = await SupervisionRequest.find({ status: 'opened' }).populate('imageUser');
	 if (!supervisionRequests) {
        return res.status(400).json({ msg: Constants.messages.supervisionReqNotFound });
      }

      return res.status(200).json({ msg: Constants.messages.success, openedSupervisionRequests: supervisionRequests });
    } catch (err) {
      console.log('error: ', err);
      err.status = 400;
      next(err);
    }
  };

  getResolvedSupervisionRequests = async (req, res, next) => {
    try {
      // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	 const supervisionRequests = await SupervisionRequest.find({ status: 'resolved' }).populate('imageUser');
	 if (!supervisionRequests) {
        return res.status(400).json({ msg: Constants.messages.supervisionReqNotFound });
      }

      return res.status(200).json({ msg: Constants.messages.success, resolvedSupervisionRequests: supervisionRequests });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  resolveSupervisionRequestStatus = async (req, res, next) => {
	  const { supervisionRequestId } = req.body;
	  try {
	    // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	    const supervisionReques = await SupervisionRequest.findByIdAndUpdate(
	        { _id: supervisionRequestId },
	        { $set: { status: 'resolved', resolvedAt: new Date() } },
	        { new: true },
	    );
	    if (!supervisionReques) {
	      return res.status(400).json({ msg: Constants.messages.supervisionReqNotFound });
	    }
	    return res.status(200).json({ msg: Constants.messages.success });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
  };

  reopenSupervisionRequestStatus = async (req, res, next) => {
	  const { supervisionRequestId } = req.body;
	  try {
	    // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	    const supervisionReques = await SupervisionRequest.findByIdAndUpdate(
	        { _id: supervisionRequestId },
	        { $set: { status: 'opened', resolvedAt: new Date() } },
	        { new: true },
	    );
	    if (!supervisionReques) {
	      return res.status(400).json({ msg: Constants.messages.supervisionReqNotFound });
	    }
	    return res.status(200).json({ msg: Constants.messages.success });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
  };


  getGroupedImages = async (req, res, next) => {
    try {
      // find categorie group based on location
      const category = await Category.aggregate([
        { $group: { _id: '$location', mostSearchedTags: { $sum: 1 } } },
        { $sort: { mostSearchedTags: -1 } },
        // { $unwind: '$location' },
      ]);
      if (!category) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, category: category });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  activeUserImage = async (req, res, next) => {
    // extract data from body
    const { categoryId, isActive } = req.body;

    try {
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      // find categorie and update
      const categorie = await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { isActive: isActive } }, { new: true });
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.imageActiveSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getActiveUserImages = async (req, res, next) => {
    try {
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      // find categorie and update
      const categorie = await Category.find({ $and: [{ user: { $ne: req.user.id } }, { isActive: 'active' }] }).populate('user', 'firstName lastName profileImage description company city supervision');
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, activeUserImages: categorie });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  updateViewedCount = async (req, res, next) => {
    // extract data from body
    const { categoryId } = req.body;

    try {
      // find categorie and update
      const categorie = await Category.findByIdAndUpdate({ _id: categoryId }, { $inc: { viewedCount: 1 } }, { new: true });
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, viewedCount: categorie.viewedCount });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getPerspectiveImages = async (req, res, next) => {
    // extract data from body
    const { groupId } = req.body;

    try {
      // find categorie and groupId
      const categorie = await Category.find({ $and: [{ isActive: 'active' }, { groupId: groupId }] }).populate('user');
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, category: categorie });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  updateDownloadCount = async (req, res, next) => {
    // extract data from body
    const { categoryId } = req.body;

    try {
      // find categorie and update
      const categorie = await Category.findByIdAndUpdate({ _id: categoryId }, { $inc: { downloadCount: 1 } }, { new: true });
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, downloadCount: categorie.downloadCount });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getUserImageCount = async (req, res, next) => {
    // extract data from body
    const { userId } = req.body;

    try {
      // See if user exist
	  const user = await User.findOne({ _id: userId });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const categorie = await Category.find({ user: userId }).count();
      // if (!categorie) {
      //   return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      // }
      return res.status(200).json({ msg: Constants.messages.success, imageCount: categorie });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getUserInActiveImages = async (req, res, next) => {
    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const category = await Category.find({ $and: [{ user: { $ne: req.user.id } }, { isActive: 'block' }] }).populate('user', 'firstName lastName profileImage description company city supervision');
      // if (!categorie) {
      //   return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      // }
      return res.status(200).json({ msg: Constants.messages.success, inActiveUserImages: category });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getUserPendingImages = async (req, res, next) => {
    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const category = await Category.find({ $and: [{ user: { $ne: req.user.id } }, { isActive: 'pending' }] }).populate('user', 'firstName lastName profileImage description company city supervision');
      // if (!categorie) {
      //   return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      // }
      return res.status(200).json({ msg: Constants.messages.success, pendingUserImages: category });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };


  getViewedCount = async (req, res, next) => {
    // extract data from body
    const { categoryId } = req.body;

    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const categorie = await Category.findById({ _id: categoryId }).select('viewedCount');
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, viewedCount: categorie.viewedCount });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };


  getDownloadCount = async (req, res, next) => {
    // extract data from body
    const { categoryId } = req.body;

    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const categorie = await Category.findById({ _id: categoryId }).select('downloadCount');
      if (!categorie) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, downloadCount: categorie.downloadCount });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };


  getAllUserImagesBasedOnType = async (req, res, next) => {
	    const { type } = req.body;
	    try {
	    const categories = await Category.find({
	      $and: [
			  { type: type },
			  { isActive: 'active' },
	      ],
		  }).sort({ createdAt: -1 }).populate('user', 'firstName lastName profileImage company description supervision');
		  if (!categories) {
	      return res.status(404).json({ msg: Constants.messages.noCategoryFound });
		  }
		  return res.status(200).json({ msg: Constants.messages.success, categories: categories });
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

export default new CategoryController();
