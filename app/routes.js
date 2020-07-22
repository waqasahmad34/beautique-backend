/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

import { Router } from 'express';
import UsersController from './controllers/user.controller';
import HighlightController from './controllers/highlight.controller';
import CategoryController from './controllers/category.controller';
import ContactUsController from './controllers/contactUs.controller';
import DefaultCategoryController from './controllers/defaultCategory.controller';
import authenticate from './middleware/authenticate';
import adminAuth from './middleware/admin-auth';
import profile from './middleware/register-media';
import category from './middleware/category-media';
import defaultCategory from './middleware/default-category-media';
import errorHandler from './middleware/error-handler';

const routes = new Router();

// User Api's
routes.post('/api/users/register/:token', profile.fields( [
  {
    name: 'profileImage',
    maxCount: 1,
  },
  {
    name: 'titleImage',
    maxCount: 1,
  },
]), UsersController.register);
routes.post('/api/users/login', UsersController.login);
routes.post('/api/users/resetPassword', authenticate, UsersController.resetPassword);
routes.post('/api/users/sendforgetPasswordEmail', UsersController.sendForgetPassEmail);
routes.post('/api/users/forgetPassword/:userId/:token', UsersController.forgetPassword);
routes.post('/api/users/getUserProfile', UsersController.getUserProfile);
routes.post('/api/users/getUserProfileImages', UsersController.getUserProfileImages);
routes.post('/api/users/getUserImages', authenticate, UsersController.getUserImages);
routes.get('/api/users/getAllowSupervisionUsers', UsersController.getAllowSupervisionUsers);
routes.post('/api/users/updateSupervision', authenticate, UsersController.updateSupervision);
routes.post('/api/users/updateProfileBioData', authenticate, UsersController.updateProfileBioData);
routes.post('/api/users/updateProfile', [authenticate, profile.fields( [
  {
    name: 'profileImage',
    maxCount: 1,
  },
])], UsersController.updateProfile);
routes.post('/api/users/updateCover', [authenticate, profile.fields( [
  {
    name: 'titleImage',
    maxCount: 1,
  },
])], UsersController.updateCover);

// Category Api's
routes.post('/api/users/imageUpload', [authenticate, category.fields( [
  {
    name: 'imageLink',
    maxCount: 1,
  },
])], CategoryController.imageUpload);
routes.post('/api/users/search', CategoryController.search);
routes.get('/api/users/getGroupedImages', CategoryController.getGroupedImages);
routes.post('/api/users/filter', CategoryController.filter);
routes.post('/api/users/updateViewedCount', CategoryController.updateViewedCount);
routes.post('/api/users/updateDownloadCount', CategoryController.updateDownloadCount);
routes.get('/api/users/getSearchTags', [authenticate, adminAuth], CategoryController.getSearchTags);
routes.post('/api/users/getDownloadCount', [authenticate, adminAuth], CategoryController.getDownloadCount);
routes.post('/api/users/getViewedCount', CategoryController.updateViewedCount);
routes.post('/api/users/getUserImageCount', [authenticate, adminAuth], CategoryController.getUserImageCount);
routes.post('/api/users/activeUserImage', [authenticate, adminAuth], CategoryController.activeUserImage);
routes.get('/api/users/getUserInActiveImages', [authenticate, adminAuth], CategoryController.getUserInActiveImages);
routes.get('/api/users/getUserPendingImages', [authenticate, adminAuth], CategoryController.getUserPendingImages);
routes.get('/api/users/getActiveUserImages', [authenticate, adminAuth], CategoryController.getActiveUserImages);
routes.post('/api/users/getAllUserImagesBasedOnType', CategoryController.getAllUserImagesBasedOnType);
routes.post('/api/users/getPerspectiveImages', CategoryController.getPerspectiveImages);
routes.post('/api/users/addSupervisionRequest', CategoryController.addSupervisionRequest);
routes.get('/api/users/getOpenedSupervisionRequests', [authenticate, adminAuth], CategoryController.getOpenedSupervisionRequests);
routes.get('/api/users/getResolvedSupervisionRequests', [authenticate, adminAuth], CategoryController.getResolvedSupervisionRequests);
routes.post('/api/users/resolveSupervisionRequestStatus', [authenticate, adminAuth], CategoryController.resolveSupervisionRequestStatus);
routes.post('/api/users/reopenSupervisionRequestStatus', [authenticate, adminAuth], CategoryController.reopenSupervisionRequestStatus);

// Admin Api's
routes.post('/api/users/sendRegistrationLink', [authenticate, adminAuth], UsersController.sendRegistrationEmail);
routes.post('/api/users/accountAcceptReject', [authenticate, adminAuth], UsersController.accountAcceptReject);
routes.post('/api/users/acceptAccount', [authenticate, adminAuth], UsersController.acceptAccount);
routes.post('/api/users/rejectAccount', [authenticate, adminAuth], UsersController.rejectAccount);
routes.get('/api/users/getActiveUsersList', [authenticate, adminAuth], UsersController.getActiveUsersList);
routes.get('/api/users/getInActiveUsersList', [authenticate, adminAuth], UsersController.getInActiveUsersList);
routes.post('/api/users/deleteUsers', [authenticate, adminAuth], UsersController.deleteUsers);
routes.get('/api/users/stats', [authenticate, adminAuth], UsersController.adminStats);


// ContactUs Api's
routes.post('/api/users/addContactUs', ContactUsController.addContactUs);
routes.post('/api/users/addPrivateContactUs', authenticate, ContactUsController.addPrivateContactUs);
routes.post('/api/users/deleteContactUs', [authenticate, adminAuth], ContactUsController.deleteContactUs);
routes.get('/api/users/getContactUsCount', [authenticate, adminAuth], ContactUsController.getContactUsCount);
routes.get('/api/users/updateContactUsStats', ContactUsController.updateContactUsCount);
routes.post('/api/users/resolveContactUsStatus', [authenticate, adminAuth], ContactUsController.resolveContactUsStatus);
routes.post('/api/users/reopenContactUsStatus', [authenticate, adminAuth], ContactUsController.reopenContactUsStatus);
routes.get('/api/users/getOpenedContactUs', [authenticate, adminAuth], ContactUsController.getOpenedContactUs);
routes.get('/api/users/getResolvedContactUs', [authenticate, adminAuth], ContactUsController.getResolvedContactUs);
routes.post('/api/users/getContactUs', [authenticate, adminAuth], ContactUsController.getContactUs);


// Admin DefaultCategory Api's
routes.post('/api/users/addDefaultCategory', [authenticate, adminAuth, defaultCategory.fields( [
  {
    name: 'imageLink',
    maxCount: 1,
  },
])], DefaultCategoryController.addDefaultCategory);
routes.post('/api/users/deleteDefaultCategory', [authenticate, adminAuth], DefaultCategoryController.deleteDefaultCategory);
routes.post('/api/users/updateDefaultCategory', [authenticate, adminAuth, defaultCategory.fields( [
  {
    name: 'imageLink',
    maxCount: 1,
  },
])], DefaultCategoryController.updateDefaultCategory);
routes.get('/api/users/getDefaultCategories', DefaultCategoryController.getDefaultCategories);


// Admin Highlight Api's
routes.get('/api/users/getHighlights', HighlightController.getHighlights);
routes.post('/api/users/getHighlight', HighlightController.getHighlight);
routes.post('/api/users/addHighlight', [authenticate, adminAuth], HighlightController.addHighlight);
routes.post('/api/users/deleteHighlight', [authenticate, adminAuth], HighlightController.deleteHighlight);
routes.post('/api/users/highlightSupervisionRequest', HighlightController.highlightSupervisionRequest);
routes.post('/api/users/getHighlightSupervisionRequest', [authenticate, adminAuth], HighlightController.getHighlightSupervisionRequest);

routes.use(errorHandler);

export default routes;
