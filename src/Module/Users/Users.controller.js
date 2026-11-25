import express from 'express';
import { authenticate } from '../../Middleware/auth.middleware.js';
import { multerUpload } from '../../Middleware/multer.middleware.js';
import { BadRequestException } from '../../Common/Utils/Errors/exceptions.error.js';
import * as userService from './Users.service.js';

export const uploadProfilePictureHandler = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new BadRequestException(
        'Please upload a profile picture file',
        null,
        'MISSED_FILE'
      );
    }

    const { authUser } = req;
    const result = await userService.uploadProfilePicture(file, authUser);

    res.status(200).json({
      success: true,
      message: 'Profile picture is Uploaded successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserNameHandler = async (req, res, next) => {
  try {
    const { first_name, last_name, firstName, lastName } = req.body || {};
    const finalFirstName = (first_name ?? firstName ?? '').trim();
    const finalLastName = (last_name ?? lastName ?? '').trim();

    if (!finalFirstName || !finalLastName) {
      throw new BadRequestException(
        'Both first name and last name are required and cannot be empty.',
        null,
        'INVALID_NAME_FIELDS'
      );
    }

    if (finalFirstName.length < 2 || finalLastName.length < 2) {
      throw new BadRequestException(
        'First name and last name must each be at least 2 characters long.',
        null,
        'NAME_TOO_SHORT'
      );
    }

    const { authUser } = req;
    const result = await userService.updateUserName(
      { first_name: finalFirstName, last_name: finalLastName },
      authUser
    );

    res.status(200).json({
      success: true,
      message: 'Name updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const userController = express.Router();

// Name update endpoints (supporting both PATCH and PUT)
userController.patch('/name', authenticate, updateUserNameHandler);
userController.put('/name', authenticate, updateUserNameHandler);

// File upload endpoints (supporting both PATCH and POST)
userController.patch(
  '/profile-picture',
  authenticate,
  multerUpload({ desiredPath: 'Profiles' }).single('profile'),
  uploadProfilePictureHandler
);

userController.post(
  '/profile-picture',
  authenticate,
  multerUpload({ desiredPath: 'Profiles' }).single('profile'),
  uploadProfilePictureHandler
);

export { userController };
export default userController;
