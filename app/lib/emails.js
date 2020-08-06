/* eslint-disable linebreak-style */
/* eslint-disable no-tabs */
/* eslint-disable max-len */
export const sendContactUsEmailTemplate = (subject, message) =>
  `Hi <strong>you recieved contact us email</strong><br>
  <p>Subject: ${subject}</p>
  <p>Message: ${message}</p>`;

export const sendPasswordResetEmail = (user, link) =>
  `Hi <strong>${user.firstName} ${user.lastName}!</strong><br> Here is Your Reset Password Link, Please Click: <strong><a href='${link}'>Here</a></strong> Which is only valid for 2 minutes `;

export const sendRegistrationEmail = (link) =>
  `Hi! <br> Here is Your Registration Link, Please Click: <strong><a href='${link}'>Here</a></strong> Which is only valid for 24 Hour `;

