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
import { v4 as uuidv4 } from 'uuid';
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
	  'email',
	  'highlightId',
	  'imageUser',
	  'user',

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
	  params['imageLink'] = `${req.files.imageLink[0].originalname}`;
      const dimensions = sizeOf(`app/public/users/category/${params['imageLink']}`);
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
      // save data into database
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
      // if there is no categories found
      if (!categories) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      // create tags object which is most searched
      const searchTag = new SearchTag({
        tagName: search,
      });
      // save tags into database
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
      // See if user exist
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      // find all tags based on how many times this word searched
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

  removeTag = async (req, res, next) => {
    // extract tag id from body
    const { tagId } = req.body;
    try {
      // See if user exist
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      const tag = await SearchTag.findByIdAndRemove({ _id: tagId });
      if (!tag) {
        return res.status(400).json({ msg: 'Tag Not Foundd!' });
      }
      return res.status(200).json({ msg: Constants.messages.success });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  updateTag = async (req, res, next) => {
    // extract tag id from body
    const { tagId, tagName } = req.body;
    try {
      // See if user exist
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      const tag = await SearchTag.findByIdAndUpdate({ _id: tagId }, { $set: { tagName: tagName } }, { new: true });
      if (!tag) {
        return res.status(400).json({ msg: 'Tag Not Foundd!' });
      }
      return res.status(200).json({ msg: Constants.messages.success });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  addTags = async (req, res, next) => {
    // extract tag name from body
    const { tagName } = req.body;
    try {
      // See if user exist
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      const tag = new SearchTag({
        tagName,
        user: req.user.id,
      });
      // save tag into database
      await tag.save();
      return res.status(200).json({ msg: Constants.messages.success });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getTags = async (req, res, next) => {
    try {
      // See if user exist
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      // return all tags added by admin
      const tags = await SearchTag.find({ user: req.user.id });
      return res.status(200).json({ msg: Constants.messages.success, tags: tags });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  // add supervision requests into database
  addSupervisionRequest = async (req, res, next) => {
    // extract data from body
    const params = this.filterParams(req.body, this.whitelist);
    const { name, email, highlightId, categoryId, user, imageLink, imageUser } = req.body;
    params['user'] === '' ? delete params['user'] : params;
    try {
	 const supervisionRequest = await SupervisionRequest.findOne({ $and: [{ email: email }, { categoryId: categoryId }] });
	 if (!supervisionRequest) {
        const supervisionReq = new SupervisionRequest({
          ...params,
        });
        // save data into database
        await supervisionReq.save();
        return res.status(200).json({ msg: Constants.messages.supervisionReqSuccess });
      }

      return res.status(400).json({ msg: Constants.messages.supervisionReqFail });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
  // get all opened supervision requests by admin
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
  // get all resolved supervision requests by admin
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
  // resolved supervision request status by admin
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
  // reopen supervision request status by admin
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
  // active user image by admin when he/she upload
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

  // get all active user images
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

  // update images count that how many times image viewed by user
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

  // get all grouped images by location
  getPerspectiveImages = async (req, res, next) => {
    // extract data from body
    const { groupId } = req.body;

    try {
      // find categorie by groupId
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

  // update download images count that how many times image downloaded by user
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
  // get images count by admin
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

      return res.status(200).json({ msg: Constants.messages.success, imageCount: categorie });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
  // get all active user images
  getUserInActiveImages = async (req, res, next) => {
    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const category = await Category.find({ $and: [{ user: { $ne: req.user.id } }, { isActive: 'block' }] }).populate('user', 'firstName lastName profileImage description company city supervision');
      return res.status(200).json({ msg: Constants.messages.success, inActiveUserImages: category });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
  // get all user pending images
  getUserPendingImages = async (req, res, next) => {
    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const category = await Category.find({ $and: [{ user: { $ne: req.user.id } }, { isActive: 'pending' }] }).populate('user', 'firstName lastName profileImage description company city supervision');
      return res.status(200).json({ msg: Constants.messages.success, pendingUserImages: category });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  // get images viewed count by admin that how many times image viewed by user
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

  // update images download count that how many times image downloaded by user
  getDownloadCount = async (req, res, next) => {
    // extract data from body
    const { categoryId } = req.body;

    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find category by id
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

  // get all newest  images based on its type like ( images, 360 images and hdr-spheres)
  getAllUserImagesBasedOnType = async (req, res, next) => {
    const { type } = req.params;
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

  // get all oldest  images based on its type like ( images, 360 images and hdr-spheres)
  getAllUserImagesBasedOnTypeOldest = async (req, res, next) => {
    const { type } = req.params;
    try {
      const categories = await Category.find({
        $and: [
          { type: type },
          { isActive: 'active' },
        ],
      }).sort({ createdAt: 1 }).populate('user', 'firstName lastName profileImage company description supervision');
      if (!categories) {
        return res.status(404).json({ msg: Constants.messages.noCategoryFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, categories: categories });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
    // get all images based on there status like ( active, block and pending)
    getAllStatusUserImagesBasedOnType = async (req, res, next) => {
	    const { type } = req.body;
	    try {
	    const categoriesActive = await Category.find({
	      $and: [
			  { type: type },
			  { isActive: 'active' },
	      ],
		  }).sort({ createdAt: -1 }).populate('user', 'firstName lastName profileImage company description supervision');
        const categoriesBlock = await Category.find({
	      $and: [
			  { type: type },
			  { isActive: 'block' },
	      ],
        }).sort({ createdAt: -1 }).populate('user', 'firstName lastName profileImage company description supervision');
        const categoriesPending = await Category.find({
	      $and: [
			  { type: type },
			  { isActive: 'pending' },
	      ],
		  }).sort({ createdAt: -1 }).populate('user', 'firstName lastName profileImage company description supervision');
        if (!categoriesActive) {
	      return res.status(404).json({ msg: Constants.messages.noCategoryFound });
        }
        if (!categoriesBlock) {
	      return res.status(404).json({ msg: Constants.messages.noCategoryFound });
        }
        if (!categoriesPending) {
	      return res.status(404).json({ msg: Constants.messages.noCategoryFound });
		  }
		  return res.status(200).json({ msg: Constants.messages.success, active: categoriesActive, block: categoriesBlock, pending: categoriesPending });
	    } catch (err) {
	      err.status = 400;
	      next(err);
	    }
	  };
}

export default new CategoryController();
