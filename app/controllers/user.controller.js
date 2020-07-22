/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */

import BaseController from './base.controller';
import User from '../models/user';
import DefaultCategory from '../models/defaultCategory';
import Category from '../models/category';
import ContactUsStats from '../models/contactUsStats';
import ContactUs from '../models/contactUs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Constants from '../config/constants';
import { sendResetPassEmail, sendRegistrationLinkEmail } from '../lib/util';
import _ from 'lodash';

class UsersController extends BaseController {
	whitelist = [
	  'firstName',
	  'homePage',
	  'lastName',
	  'email',
	  'password',
	  'phoneNumber',
	  'profileImage',
	  'company',
	  'city',
	  'street',
	  'description',
	  'supervision',
	  'termsCondition',
	  'titleImage',
	  'oldPassword',
	];

	register = async (req, res, next) => {
	      const {
	        firstName,
	    lastName,
	    homePage,
	        email,
	        password,
	        phoneNumber,
	        company,
	        street,
	        city,
	        description,
	        supervision,
	        termsCondition,
	      } = req.body;
	      try {
	    const decode = jwt.verify(req.params.token, Constants.security.sessionSecret);
	        if (!decode) {
	          return res.status(400).json({ msg: Constants.messages.linkExpire });
	    }

	    if (decode.id === email) {
	    // See if user exist with email or register token before
	    const token = req.params.token;
	        let user = await User.findOne({ $or: [{ email }, { token }] });
	        if (user) {
	          return res.status(400).json({ msg: Constants.messages.userExist });
	        }
	    const isActive = true;
	        user = new User({
	          firstName,
	          lastName,
			  email,
			  homePage,
	          password,
	          phoneNumber,
	          street,
	    	  city,
	    	  description,
	    	  company,
	    	  termsCondition,
			  supervision,
			  isActive,
			  token,
	        });
	        // Encrypt password
	        const salt = await bcrypt.genSalt(10);
	  	  user.password = await bcrypt.hash(password, salt);
	  	  user.profileImage = `http://localhost:5000/public/users/profile/${req.files.profileImage[0].originalname}`;
	  	  user.titleImage = `http://localhost:5000/public/users/profile/${req.files.titleImage[0].originalname}`;
	  	  await user.save();
	        // Return jsonwebtoken

	    const payload = {
	      user: {
	        id: user.id,
	        email: user.email,
	        firstName: user.firstName,
	        lastName: user.lastName,
	        supervision: user.supervision,
	        company: user.company,
	        street: user.street,
	        city: user.city,
	        role: user.role,
	        homePage: user.homePage,
	        isActive: user.isActive,
	        profileImage: user.profileImage,
	        titleImage: user.titleImage,
	      },
	    };
	    jwt.sign(payload, Constants.security.sessionSecret, { expiresIn: '365d' }, (err, token) => {
	      if (err) throw err;
	      return res.status(200).json({ token: token, user: payload.user });
	    });
	  } else {
	      return res.status(400).json({ msg: 'You have to create your account with the email where you got invited by admin!' });
	  }
	  } catch (err) {
		  console.log('error: --', err);
	    if (err.message === 'jwt expired' || err.message === 'jwt malformed') {
	      return res.status(400).json({ msg: Constants.messages.linkExpire });
		  }
		  err.status = 400;
		  next(err);
	  }
	};

	login = async (req, res, next) => {
	  const { email, password } = req.body;

	  try {
	    // See if user exist
	    const user = await User.findOne({ email });
	    if (!user) {
	      return res.status(400).json({ msg: Constants.messages.userInvalidCredentials });
	    }

	    const isMatch = await bcrypt.compare(password, user.password);
	    if (!isMatch) {
	      return res.status(400).json({ msg: Constants.messages.userInvalidCredentials });
	    }

	    // Return jsonwebtoken
	    const payload = {
	      user: {
	        id: user.id,
	        email: user.email,
	        firstName: user.firstName,
	        lastName: user.lastName,
	        supervision: user.supervision,
	        company: user.company,
	        street: user.street,
	        city: user.city,
	        role: user.role,
	        isActive: user.isActive,
	        profileImage: user.profileImage,
	        titleImage: user.titleImage,
			  },
	    };
	    jwt.sign(payload, Constants.security.sessionSecret, { expiresIn: '365d' }, (err, token) => {
	      if (err) throw err;
	      return res.status(200).json({ token: token, user: payload.user });
	    });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	updateProfile = async (req, res, next) => {
	  try {
	    const user = await User.findById({ _id: req.user.id }).select('profileImage');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    user.profileImage = `http://localhost:5000/public/users/profile/${req.files.profileImage[0].originalname}`;
	    await user.save();
	    return res.status(200).json({ msg: 'Profile Uploaded Successfully!', link: user.profileImage });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};


	updateProfileBioData = async (req, res, next) => {
	  const params = this.filterParams(req.body, this.whitelist);
	  console.log('params: ', params);
	  try {
		  const user = await User.findById({ _id: req.user.id });
		  if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    if ( params.oldPassword && params.password ) {
	      const isMatch = await bcrypt.compare(params.oldPassword, user.password);
	      if (isMatch) {
			  const salt = await bcrypt.genSalt(10);
			  delete params['oldPassword'];
			  params['password'] = await bcrypt.hash(params.password, salt);
			  console.log('params: --inside', params);
			  const updateUserdata = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: params }, { new: true });
	        return res.status(200).json({ msg: 'Profile Updated Successfully!', profile: updateUserdata });
	      }
	      return res.status(400).json({ msg: 'Old Password Does Not Match!' });
	    } else {
	      delete params['oldPassword'];
	      delete params['password'];
		   const updateUser = await User.findByIdAndUpdate({ _id: req.user.id }, { $set: params }, { new: true });
	      if (!updateUser) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	      }
	      return res.status(200).json({ msg: 'Profile Updated Successfully!', profile: updateUser });
	    }
	  } catch (err) {
		  err.status = 400;
		  next(err);
	  }
	  };

	updateCover = async (req, res, next) => {
	  try {
		  const user = await User.findById({ _id: req.user.id }).select('titleImage');
		  if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
		  }
		  user.titleImage = `http://localhost:5000/public/users/profile/${req.files.titleImage[0].originalname}`;

	    await user.save();
	    return res.status(200).json({ msg: 'Cover Uploaded Successfully!', link: user.titleImage });
	  } catch (err) {
		  err.status = 400;
		  next(err);
	  }
	  };

	sendForgetPassEmail = async (req, res, next) => {
	  const { email } = req.body;
	  try {
	    const user = await User.findOne({ email: email }).select('firstName lastName email');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    const payload = { id: user._id };
	    const token = jwt.sign(payload, Constants.security.sessionSecret, {
	      expiresIn: '2m', // 2 minutes
	    });
	    const link = `http://localhost:3000/reset-password/${user._id}/${token}`;
	    await sendResetPassEmail(user, link);
	    return res.status(200).json({ msg: 'Email Sent!' });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};

	forgetPassword = async (req, res, next) => {
	  const { password } = req.body;
	  try {
	    const user = await User.findOne({ _id: req.params.userId }).select('password');
	    if (!user) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
	    }
	    const decode = jwt.verify(req.params.token, Constants.security.sessionSecret);
	    if (!decode) {
	      return res.status(400).json({ msg: Constants.messages.linkExpire });
	    }

	    const salt = await bcrypt.genSalt(10);
	    user.password = await bcrypt.hash(password, salt);
	    await user.save();

	    return res.status(200).json({ msg: Constants.messages.userPasswordChangeSuccess });
	  } catch (err) {
	    if (err.message === 'jwt expired' || err.message === 'jwt malformed') {
	      return res.status(400).json({ msg: Constants.messages.linkExpire });
	    }
	    err.status = 400;
	    next(err);
	  }
	};

	resetPassword = async (req, res, next) => {
	  const { oldPassword, newPassword } = req.body;

	  try {
	    const user = await User.findById({ _id: req.user.id });
	    if (!user) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	    }
	    const isMatch = await bcrypt.compare(oldPassword, user.password);
	    if (isMatch) {
	      const salt = await bcrypt.genSalt(10);
	      const updateUserPassword = await User.findByIdAndUpdate(
	          req.user.id,
	          {
	            $set: {
	              password: await bcrypt.hash(newPassword, salt),
	            },
	          },
	          { new: true },
	      );
	      return res.status(200).json({ msg: Constants.messages.userPasswordChangeSuccess });
	    }
	    return res.status(400).json({ msg: Constants.messages.userInvalidPassword });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};
	getUserProfile = async (req, res, next) => {
	  const { userId } = req.body;
	  try {
	    const user = await User.findById({ _id: userId }).select('-password');
	    if (!user) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	    }
	    const imagesCount = await Category.find({
	      $and: [
	        { user: userId },
	        { type: 'images' },
	        { isActive: 'active' },
	      ],
	    }).count();
	    const hdrSpheresCount = await Category.find({
	      $and: [
			  { user: userId },
			  { type: 'hdr-spheres' },
			  { isActive: 'active' },
	      ],
		  }).count();
		  const threeSixtyImagesCount = await Category.find({
	      $and: [
			  { user: userId },
			  { type: '360 images' },
			  { isActive: 'active' },
	      ],
		  }).count();
	    const data = {
	      id: user._id,
	      email: user.email,
	      firstName: user.firstName,
	      lastName: user.lastName,
	      phoneNumber: user.phoneNumber,
	      street: user.street,
	      city: user.city,
	      description: user.description,
	      company: user.company,
	      profileImage: user.profileImage,
		  titleImage: user.titleImage,
		  homePage: user.homePage,
	      role: user.role,
	      isActive: user.isActive,
	      supervision: user.supervision,
	      termsCondition: user.termsCondition,
		  imagesCount: imagesCount,
		  hdrSpheresCount: hdrSpheresCount,
		  threeSixtyImagesCount: threeSixtyImagesCount,
	    };
	    return res.status(200).json({ msg: Constants.messages.success, profile: data });
	  } catch (err) {
		  err.status = 400;
		  next(err);
	  }
	  };

	  getUserImages = async (req, res, next) => {
	    const { type, subtype } = req.body;
	    try {
	        const user = await User.findById({ _id: req.user.id });
	    if (!user) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	    }
	    const categories = await Category.find({
	      $and: [
			  { user: req.user.id },
			  { type: type },
			  { subtype: subtype },
			  { isActive: 'active' },
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

	  getAllowSupervisionUsers = async (req, res, next) => {
	    try {
	    const users = await User.find({
	      $and: [
			  { supervision: true },
			  { role: { $ne: 'admin' } },
			  { isActive: true },
	      ],
		  }).select('-password').sort({ createdAt: -1 });
		  if (!users) {
	      return res.status(404).json({ msg: Constants.messages.userNotFound });
		  }
		  return res.status(200).json({ msg: Constants.messages.success, users: users });
	    } catch (err) {
	      err.status = 400;
	      next(err);
	    }
	  };

	getUserProfileImages = async (req, res, next) => {
	  // remove subtype like nature etc
	    const { userId, type } = req.body;
	    try {
	        const user = await User.findById({ _id: userId });
	    if (!user) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	    }
	    const categories = await Category.find({
	      $and: [
			  { user: userId },
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

	  // Admin Api's

  sendRegistrationEmail = async (req, res, next) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ _id: req.user.id });
      if (!user) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
	  const payload = { id: email };
	  const token = jwt.sign(payload, Constants.security.sessionSecret, {
        expiresIn: '24h', // 24 hour
	  });
	  const link = `http://localhost:3000/register/${token}`;
	  await sendRegistrationLinkEmail(email, link);
	  return res.status(200).json({ msg: 'Email Sent!' });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  deleteUsers = async (req, res, next) => {
	  const { userId } = req.body;
    try {
      const userExist = await User.findOne({ _id: req.user.id });
      if (!userExist) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
	  const user = await User.findByIdAndRemove({ _id: userId });
	  const removeCategory = await Category.remove({ user: userId });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
	  return res.status(200).json({ msg: Constants.messages.userRemoved });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  getActiveUsersList = async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.user.id });
      if (!user) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      //   const users = await User.find({ $and: [{ role: { $ne: 'admin' } }, { isActive: true }] });
      //   if (!users) {
      //     return res.status(400).json({ msg: Constants.messages.userNotFound });
      //   }
      const users = await User.aggregate([
		  { $match: { $and: [{ role: { $ne: 'admin' } }, { isActive: true }] } },
        { $lookup:
			{
			   from: 'categories',
			   localField: '_id',
			   foreignField: 'user',
			   as: 'imagesCount',
			},
        },
        { $project: {
          _id: 0,
          id: '$_id',
          isActive: '$isActive',
          supervision: '$supervision',
          termsCondition: '$termsCondition',
          role: '$role',
          createdAt: '$createdAt',
          firstName: '$firstName',
          lastName: '$lastName',
          email: '$email',
          phoneNumber: '$phoneNumber',
          street: '$street',
          city: '$city',
          description: '$description',
          company: '$company',
          profileImage: '$profileImage',
		  titleImage: '$titleImage',
		  uploadedImagesCount: { $size: '$imagesCount' },
		 } },
      ]);
	  return res.status(200).json({ msg: Constants.messages.success, users: users });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  getInActiveUsersList = async (req, res, next) => {
    try {
      const user = await User.findOne({ _id: req.user.id });
      if (!user) {
		  return res.status(400).json({ msg: Constants.messages.userNotFound });
      }
      //   const users = await User.find({ $and: [{ role: { $ne: 'admin' } }, { isActive: true }] });
      //   if (!users) {
      //     return res.status(400).json({ msg: Constants.messages.userNotFound });
      //   }
      const users = await User.aggregate([
		  { $match: { $and: [{ role: { $ne: 'admin' } }, { isActive: false }] } },
        { $lookup:
			{
			   from: 'categories',
			   localField: '_id',
			   foreignField: 'user',
			   as: 'imagesCount',
			},
        },
        { $project: {
          _id: 0,
          id: '$_id',
          isActive: '$isActive',
          supervision: '$supervision',
          termsCondition: '$termsCondition',
          role: '$role',
          createdAt: '$createdAt',
          firstName: '$firstName',
          lastName: '$lastName',
          email: '$email',
          phoneNumber: '$phoneNumber',
          street: '$street',
          city: '$city',
          description: '$description',
          company: '$company',
          profileImage: '$profileImage',
		  titleImage: '$titleImage',
		  uploadedImagesCount: { $size: '$imagesCount' },
		 } },
      ]);
	  return res.status(200).json({ msg: Constants.messages.success, users: users });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  acceptAccount = async (req, res, next) => {
    const { userId } = req.body;
    try {
	  const user = await User.findById({ _id: userId }).select('isActive');
	  if (!user) {
        return res.status(404).json({ msg: Constants.messages.userNotFound });
	  }
	  user.isActive = true;
	  user.save();
	  return res.status(200).json({ msg: Constants.messages.accountAcceptSuccess });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  accountAcceptReject = async (req, res, next) => {
    const { userId, isActive } = req.body;
    try {
	  const user = await User.findByIdAndUpdate({ _id: userId }, { $set: { isActive: isActive } }, { new: true } );
	  if (!user) {
        return res.status(404).json({ msg: Constants.messages.userNotFound });
	  }
	  return res.status(200).json({ msg: Constants.messages.accountAcceptSuccess });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  rejectAccount = async (req, res, next) => {
    const { userId } = req.body;
    try {
	  const user = await User.findById({ _id: userId }).select('isActive');
	  if (!user) {
        return res.status(404).json({ msg: Constants.messages.userNotFound });
	  }
	  user.isActive = false;
	  user.save();
	  return res.status(200).json({ msg: Constants.messages.accountRejectedSuccess });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  updateSupervision = async (req, res, next) => {
    const { supervision } = req.body;
    try {
	  const user = await User.findById({ _id: req.user.id }).select('supervision');
	  if (!user) {
        return res.status(404).json({ msg: Constants.messages.userNotFound });
	  }
      //   const category = await Category.updateMany({ user: req.user.id }, { $set: { supervision: supervision } });
	  user.supervision = supervision;
	  user.save();
	  return res.status(200).json({ msg: Constants.messages.success });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };

  adminStats = async (req, res, next) => {
    try {
	  const user = await User.findById({ _id: req.user.id });
	  if (!user) {
        return res.status(404).json({ msg: Constants.messages.userNotFound });
	  }
	  const usersCount = await User.find({}).count();
	  const imagesCount = await Category.find({}).count();
	  const contactUsCount = await ContactUs.find({ status: 'opened' }).count();
	  const contactUsStatsCount = await ContactUsStats.findOne({ }).select('contactUsCount');
	  const downloadCount = await Category.aggregate([{
		 $group: {
		    '_id': null,
		    'totalDownloads': {
			   $sum: '$downloadCount',
		    },
		 },
	  }] );
	  const stats = {
		  users: usersCount,
		  images: imagesCount,
		  downloads: downloadCount[0].totalDownloads,
		  openTickets: contactUsCount,
		  contactChecked: contactUsStatsCount.contactUsCount,
	  };
	  return res.status(200).json({ msg: Constants.messages.success, stats: stats });
    } catch (err) {
	  err.status = 400;
	  next(err);
    }
  };
}

export default new UsersController();
