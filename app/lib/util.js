/* eslint-disable linebreak-style */
/* eslint-disable no-tabs */
/* eslint-disable no-mixed-spaces-and-tabs */

import nodemailer from 'nodemailer';
import Constants from '../config/constants';
import { sendPasswordResetEmail, sendRegistrationEmail, sendContactUsEmailTemplate } from './emails';

export const sendResetPassEmail = (user, link) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: Constants.messages.email,
      pass: Constants.messages.password,
    },
  });

  // setup email data with unicode symbols
  const mailOptions = {
    from: 'myguardiansixtesting@gmail.com', // sender address
    to: [user.email], // list of receivers
    subject: 'Link To Reset Password', // Subject line
    html: sendPasswordResetEmail(user, link), // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};


export const sendRegistrationLinkEmail = (email, link) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
	  service: 'Gmail',
	  auth: {
      user: Constants.messages.email,
      pass: Constants.messages.password,
	  },
  });

  // setup email data with unicode symbols
  const mailOptions = {
	  from: 'myguardiansixtesting@gmail.com', // sender address
	  to: email, // list of receivers
	  subject: 'Registration Link', // Subject line
	  html: sendRegistrationEmail(link), // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
	  if (error) {
      return console.log(error);
	  }
	  console.log('Message sent: %s', info.messageId);
	  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};


export const sendContactUsEmail = (email, subject, message) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
	  service: 'Gmail',
	  auth: {
      user: Constants.messages.email,
      pass: Constants.messages.password,
	  },
  });

  // setup email data with unicode symbols
  const mailOptions = {
	  from: email, // sender address
	  to: 'myguardiansixtesting@gmail.com', // list of receivers
	  subject: 'Contact Us', // Subject line
	  html: sendContactUsEmailTemplate(subject, message), // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
	  if (error) {
      return console.log(error);
	  }
	  console.log('Message sent: %s', info.messageId);
	  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};
