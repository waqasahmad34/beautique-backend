/* eslint-disable linebreak-style */
/* eslint-disable babel/new-cap */
/* eslint-disable new-cap */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */

import BaseController from './base.controller';
import User from '../models/user';
import Category from '../models/category';
import Highlight from '../models/highlight';
import Constants from '../config/constants';
import mongoose from 'mongoose';
import _ from 'lodash';

class HighlightController extends BaseController {
	whitelist = [
	  'title',
	  'highlightId',
	];
  addHighlight = async (req, res, next) => {
    const {
	  title,
      images,
      user,
    } = req.body;
    try {
      const threshold = 5;
      if (images.length >= threshold) {
        return res.status(400).json({ msg: Constants.messages.highlightImagesCheck });
      }
      const img = images.find( (image) => image.userId !== user);
      if (img) {
        return res.status(400).json({ msg: Constants.messages.highlightImagesBelongedCheck, matchImage: img });
      }
      const reqUser = await User.findById({ _id: req.user.id });
	    if (!reqUser) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
      }

      const highlightCount = await Highlight.find({}).count();
      if (highlightCount === 3) {
        const highlightDate = await Highlight.find({}).select('createdAt').sort({ createdAt: 1 });
        const updateHighlight = await Highlight.findByIdAndUpdate({ _id: highlightDate[0]._id }, { $set: { title, images, user, createdAt: new Date() } }, { new: true });
        return res.status(200).json({ msg: Constants.messages.highlightAddedSuccess });
      } else {
        console.log('create new');
        const isActive = true;
        const highlight = new Highlight({
          title,
          images,
          user,
          isActive,
        });
        await highlight.save();
        return res.status(200).json({ msg: Constants.messages.highlightAddedSuccess });
      }
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getHighlights = async (req, res, next) => {
    try {
	  // See if user exist
      //   const user = await User.findOne({ _id: req.user.id });
      //   if (!user) {
    //     return res.status(400).json({ msg: Constants.messages.userNotFound });
      //   }

	 const highlights = await Highlight.find({ isActive: true }).populate('user', '-password');
	 if (!highlights) {
        return res.status(400).json({ msg: Constants.messages.highlightNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.success, highlights: highlights });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };


  getHighlight = async (req, res, next) => {
    const { highlightId } = req.body;
    try {
	 const highlight = await Highlight.findOne({ _id: highlightId }).populate('user images.userId images.categoryId');
	 if (!highlight) {
        return res.status(400).json({ msg: Constants.messages.highlightNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.success, highlight: highlight });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  highlightSupervisionRequest = async (req, res, next) => {
    const { email, highlightId } = req.body;
    try {
	 const highlight = await Highlight.findOne({ _id: highlightId }).select('supervisionRequest');
	 if (!highlight) {
        return res.status(400).json({ msg: Constants.messages.highlightNotFound });
      }
      if (highlight.supervisionRequest.length === 0) {
        highlight.supervisionRequest.push(email);
        await highlight.save();
        return res.status(200).json({ msg: Constants.messages.supervisionReqSuccess });
      } else {
        const request = highlight.supervisionRequest.find( (req) => req === email );
        if (!request) {
          highlight.supervisionRequest.push(email);
          await highlight.save();
          return res.status(200).json({ msg: Constants.messages.supervisionReqSuccess });
        }
        return res.status(200).json({ msg: Constants.messages.supervisionReqFail });
      }
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getHighlightSupervisionRequest = async (req, res, next) => {
    const { highlightId } = req.body;
    try {
    	  // See if user exist
      const user = await User.findOne({ _id: req.user.id });
      if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
	 const highlight = await Highlight.findOne({ _id: highlightId }).select('supervisionRequest');
	 if (!highlight) {
        return res.status(400).json({ msg: Constants.messages.highlightNotFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, highlightSupervisionReq: highlight.supervisionRequest });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  deleteHighlight = async (req, res, next) => {
    const { highlightId } = req.body;
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }

	 const highlight = await Highlight.findByIdAndRemove({ _id: highlightId });
	 if (!highlight) {
        return res.status(400).json({ msg: Constants.messages.highlightNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.highlightRemovedSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
}

export default new HighlightController();
