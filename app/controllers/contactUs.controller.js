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
	  'firstName',
	  'lastName',
	  'phoneNumber',
	  'subject',
	  'email',
	  'message',
	  'category',
	  'user',
	  'contactUsId',
	];

  // add contact us
  addContactUs = async (req, res, next) => {
    // extract data from body
    const params = this.filterParams(req.body, this.whitelist);
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
    params['user'] === '' ? delete params['user'] : params;
    params['category'] === '' ? delete params['category'] : params;
    try {
	 const contactUs = new ContactUs({
        ...params,
	  });
      // save data into database
      await contactUs.save();
      await sendContactUsEmail(email, subject, message);
      return res.status(200).json({ msg: Constants.messages.contactUsAddedSuccess });
    } catch (err) {
      err.status = 400;
      next(err);
    }
  };

  // reopen contact us by admin
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
  // resolve contact us by admin
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

  // get count of contact us that how many times user clicked the button
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

  // update contact us count
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
  // delete contact us by admin
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

  // get all contact us list by admin
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

  // get all opened contact us list by admin
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
  // get all resolved contact us list by admin
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
