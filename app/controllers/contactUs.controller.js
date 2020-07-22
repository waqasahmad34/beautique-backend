/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */

import BaseController from './base.controller';
import User from '../models/user';
import ContactUs from '../models/contactUs';
import ContactUsStats from '../models/contactUsStats';
import Constants from '../config/constants';
import { sendContactUsEmail } from '../lib/util';
import _ from 'lodash';

class ContactUsController extends BaseController {
	whitelist = [
	  'name',
	  'email',
	  'message',
	  'contactUsId',
	];
  addContactUs = async (req, res, next) => {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      subject,
      message,
      category,
      user,
    } = req.body;
    try {
	 const contactUs = new ContactUs({
        firstName,
        lastName,
        subject,
        phoneNumber,
        email,
        message,
        category,
        user,
	  });

      await contactUs.save();
      await sendContactUsEmail(email, subject, message);
      return res.status(200).json({ msg: Constants.messages.contactUsAddedSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  addPrivateContactUs = async (req, res, next) => {
    const {
      name,
      email,
      message,
      category,
    } = req.body;
    try {
	  // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      const user = req.user.id;
      const contactUs = new ContactUs({
        name,
        email,
        message,
        user,
        category,
      });

      await contactUs.save();
      return res.status(200).json({ msg: Constants.messages.contactUsAddedSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  reopenContactUsStatus = async (req, res, next) => {
	  const { contactId } = req.body;
	  try {
	    // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	    const contact = await ContactUs.findByIdAndUpdate(
	        { _id: contactId },
	        { $set: { status: 'opened', resolvedAt: new Date() } },
	        { new: true },
	    );
	    if (!contact) {
	      return res.status(400).json({ msg: Constants.messages.noContactUsFound });
	    }
	    return res.status(200).json({ msg: Constants.messages.success });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
  };

	resolveContactUsStatus = async (req, res, next) => {
	  const { contactId } = req.body;
	  try {
	    // See if user exist
	  const userExist = await User.findOne({ _id: req.user.id });
	  if (!userExist) {
	      return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
	    const contact = await ContactUs.findByIdAndUpdate(
	        { _id: contactId },
	        { $set: { status: 'resolved', resolvedAt: new Date() } },
	        { new: true },
	    );
	    if (!contact) {
	      return res.status(400).json({ msg: Constants.messages.noContactUsFound });
	    }
	    return res.status(200).json({ msg: Constants.messages.success });
	  } catch (err) {
	    err.status = 400;
	    next(err);
	  }
	};


  getContactUsCount = async (req, res, next) => {
    try {
      // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }
      // find categorie and update
      const stats = await ContactUsStats.findOne({ }).select('contactUsCount');
      if (!stats) {
        return res.status(404).json({ msg: Constants.messages.contactUsStatsNotFound });
      }
      return res.status(200).json({ msg: Constants.messages.success, contactUsCount: stats.contactUsCount });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  updateContactUsCount = async (req, res, next) => {
    try {
      const stats = await ContactUsStats.findOne({ });
      if (!stats) {
        const contactCount = new ContactUsStats({
          contactUsCount: 1,
        });
        contactCount.save();
        return res.status(200).json({ msg: Constants.messages.success, contactUsCount: contactCount.contactUsCount });
      } else {
        // find categorie and update
        const contactUsStats = await ContactUsStats.findByIdAndUpdate({ _id: stats._id }, { $inc: { contactUsCount: 1 } }, { new: true });
        if (!contactUsStats) {
          return res.status(404).json({ msg: Constants.messages.contactUsStatsNotFound });
        }
        return res.status(200).json({ msg: Constants.messages.success, contactUsCount: contactUsStats.contactUsCount });
      }
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  deleteContactUs = async (req, res, next) => {
    const { contactUsId } = req.body;
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }

	 const contactUs = await ContactUs.findByIdAndRemove({ _id: contactUsId });
	 if (!contactUs) {
        return res.status(400).json({ msg: Constants.messages.contactUsNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.contactUsRemovedSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };


  getContactUs = async (req, res, next) => {
    const { contactUsId } = req.body;
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }

	 const contactUs = await ContactUs.findById({ _id: contactUsId });
	 if (!contactUs) {
        return res.status(400).json({ msg: Constants.messages.contactUsNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.success, contact: contactUs });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getOpenedContactUs = async (req, res, next) => {
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }

	 const contactUs = await ContactUs.find({ status: 'opened' });
	 if (!contactUs) {
        return res.status(400).json({ msg: Constants.messages.contactUsNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.sucess, contacts: contactUs });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  getResolvedContactUs = async (req, res, next) => {
    try {
	  // See if user exist
	  const user = await User.findOne({ _id: req.user.id });
	  if (!user) {
        return res.status(400).json({ msg: Constants.messages.userNotFound });
	  }

	 const contactUs = await ContactUs.find({ status: 'resolved' });
	 if (!contactUs) {
        return res.status(400).json({ msg: Constants.messages.contactUsNotFound });
	  }
      return res.status(200).json({ msg: Constants.messages.sucess, contacts: contactUs });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };
}

export default new ContactUsController();
