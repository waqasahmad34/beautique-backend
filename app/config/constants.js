/* eslint-disable linebreak-style */
import path from 'path';
import merge from 'lodash/merge';

// Default configuations applied to all environments
const defaultConfig = {
  env: process.env.NODE_ENV,
  get envs() {
    return {
      test: process.env.NODE_ENV === 'test',
      development: process.env.NODE_ENV === 'development',
      production: process.env.NODE_ENV === 'production',
    };
  },

  version: require('../../package.json').version,
  root: path.normalize(__dirname + '/../../..'),
  port: process.env.PORT || 5000,
  ip: process.env.IP || '0.0.0.0',
  apiPrefix: '', // Could be /api/resource or /api/v2/resource
  userRoles: ['photographer', 'admin'],

  /**
   * MongoDB configuration options
   */
  mongo: {
    seed: true,
    options: {
      db: {
        safe: true,
      },
    },
  },

  /**
   * Security configuation options regarding sessions, authentication and hashing
   */
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'i-am-the-secret-key-of-beautique-project',
    sessionExpiration: process.env.SESSION_EXPIRATION || '1h', // 1 hour
    saltRounds: process.env.SALT_ROUNDS || 12,
  },

  /**
   * Api Response messages
   */
  messages: {
    userNotFound: 'User Not Found!',
    userRemoved: 'User Removed Successfully!',
    userPasswordSuccess: 'Password Set Successfully!',
    userPasswordChangeSuccess: 'Password Change Successfully!',
    userInvalidPassword: 'Invalid Password!',
    userInvalidCredentials: 'Invalid Credentials!',
    linkExpire: 'Link Expired,Please Generate Again!',
    userExist: 'User Already Exist!',
    imageUploadSuccess: 'Image Uploaded Successfully!',
    imageActiveSuccess: 'Image Active Successfully!',
    emailSuccess: 'Email Sent!',
    noCategoryFound: 'No Category Found!',
    noContactUsFound: 'No Contact Us Found!',
    defaultCategoryRemovedSuccess: 'Default Category Removed Successfully!',
    defaultCategoryUpdateSuccess: 'Default Category Updated Successfully!',
    accountAcceptSuccess: 'Account Accepted Successfully!',
    accountRejectedSuccess: 'Account Blocked Successfully!',
    success: 'success',
    email: 'myguardiansixtesting@gmail.com',
    password: 'myguardiansix6',
    contactUsAddedSuccess: 'Contacted Successfully!',
    contactUsRemovedSuccess: 'Contact Us Removed Successfully!',
    contactUsNotFound: 'Contact Us Not Found!',
    contactUsStatsNotFound: 'Contact Us Stats Not Found!',
    highlightNotFound: 'Highlight Not Found!',
    highlightImagesCheck: 'Highlight Images Must Be Less Than 5!',
    highlightImagesBelongedCheck: 'All Images Must Be Belonged To The Same User!',
    supervisionReqSuccess: 'Supervision Request Sent!',
    supervisionReqNotFound: 'Supervision Request Not Found!',
    supervisionReqFail: 'You Already Makes Supervision Request!',
    highlightAddedSuccess: 'Highlight Created Successfully!',
    highlightRemovedSuccess: 'Highlight Removed Successfully!',
    resetPasswordEmailSubject: 'Link To Reset Password',
    historyNotFound: 'History Not Found!',
    conversationNotFound: 'Conversation Not Found!',
    chatNotFound: 'Chat Not Found!',
    eventNotFound: 'Event Not Found!',
    settingsNotFound: 'Settings Not Found!',
    invalidEventType: 'Invalid Event Type!',
    stripeSceretKey: 'sk_test_nxJqnIMdYpm8n6fVQvxGFeGU00FWevmEYX',
    s3AccessKeyId: 'AKIARHHKSX2XQBEMXMZD',
    s3SecretAccessKey: 'acceZdtzq5ody36jtjSbaY2gywaitdBzP007fnHSssKeyId',
    s3Region: 'us-west-2',
    paypalMode: 'sandbox',
    paypalClientId: 'Ads_PX1qhMjgBBOvBcz-zBQ24GB_qrZm6xS4FWvS0NEjwUY07IAGbO5FotIl4m75OoR6jJjIpn97WjFj',
    paypalClientSecret: 'EPswChI9g19ivu_EQFj5VbOspxZZ8yE4KhwnfkVAXaDCNqakYLhtdG22j6jx3w-wZByLNXkdXbTDceGk',
    dataSecret: 'data-secret-key-is-here-euy26eviy923',
    developmentLink: 'http://localhost:3000',
    productionLink: 'http://localhost:3000',
  },
};

// Environment specific overrides
const environmentConfigs = {
  development: {
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/beautique_db',
    },
    security: {
      saltRounds: 4,
    },
  },
  test: {
    port: 27017,
    mongo: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/beautique_db',
    },
    security: {
      saltRounds: 4,
    },
  },
  production: {
    mongo: {
      seed: false,
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/beautique_db',
    },
  },
};

// Recursively merge configurations
export default merge(defaultConfig, environmentConfigs[process.env.NODE_ENV] || {});
