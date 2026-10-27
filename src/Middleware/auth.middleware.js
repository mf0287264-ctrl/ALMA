import studentsRepository from '../Module/Students/Students.repository.js';
import teachersRepository from '../Module/Teachers/Teachers.repository.js';
import adminsRepository from '../Module/Admins/Admins.repository.js';
import { verifyToken } from '../Utils/jwt.util.js';

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || req.headers.authorize;
    if (!authorization) {
      const error = new Error('Authorization header is missing');
      error.statusCode = 400;
      throw error;
    }

    const decodedData = verifyToken(authorization);
    const userId = decodedData.id || decodedData._id;

    if (!userId) {
      const error = new Error('Invalid token: user ID missing');
      error.statusCode = 401;
      throw error;
    }

    // find user by id and attach to req object
    let user = null;
    if (decodedData.role === 'student') {
      user = await studentsRepository.findById(userId);
    } else if (decodedData.role === 'teacher') {
      user = await teachersRepository.findById(userId);
    } else if (decodedData.role === 'admin') {
      user = await adminsRepository.findById(userId);
    } else {
      user = (await studentsRepository.findById(userId)) ||
             (await teachersRepository.findById(userId)) ||
             (await adminsRepository.findById(userId));
    }

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    req.authUser = user;
    next();
  } catch (error) {
    if (!error.statusCode) error.statusCode = 401;
    next(error);
  }
};

export default authenticate;
