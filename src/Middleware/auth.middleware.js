import studentsRepository from '../Module/Students/Students.repository.js';
import teachersRepository from '../Module/Teachers/Teachers.repository.js';
import adminsRepository from '../Module/Admins/Admins.repository.js';
import parentsRepository from '../Module/Parents/Parents.repository.js';
import { verifyToken, extractRawToken } from '../Utils/jwt.util.js';
import { isBlacklisted } from '../Utils/redis.util.js';

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || req.headers.authorize;
    if (!authorization) {
      const error = new Error('Authorization header is missing');
      error.statusCode = 400;
      throw error;
    }

    // Extract raw token for blacklist check
    const rawToken = extractRawToken(authorization);

    // Check Redis blacklist — reject tokens that have been logged out
    const blacklisted = await isBlacklisted(rawToken);
    if (blacklisted) {
      const error = new Error('Token has been invalidated. Please log in again.');
      error.statusCode = 401;
      throw error;
    }

    const decodedData = verifyToken(authorization);
    const userId = decodedData.id || decodedData._id;

    if (!userId) {
      const error = new Error('Invalid token: user ID missing');
      error.statusCode = 401;
      throw error;
    }

    // Attach the raw token to the request so controllers can use it (e.g. for logout)
    req.rawToken = rawToken;
    req.decodedToken = decodedData;

    // Find user by id and attach to req object
    let user = null;
    if (decodedData.role === 'student') {
      user = await studentsRepository.findById(userId);
    } else if (decodedData.role === 'teacher') {
      user = await teachersRepository.findById(userId);
    } else if (decodedData.role === 'admin') {
      user = await adminsRepository.findById(userId);
    } else if (decodedData.role === 'parent') {
      user = await parentsRepository.findById(userId);
    } else {
      user = (await studentsRepository.findById(userId)) ||
             (await teachersRepository.findById(userId)) ||
             (await adminsRepository.findById(userId)) ||
             (await parentsRepository.findById(userId));
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

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization || req.headers.authorize;
    if (!authorization) {
      return next();
    }

    const rawToken = extractRawToken(authorization);
    const blacklisted = await isBlacklisted(rawToken);
    if (blacklisted) return next();

    const decodedData = verifyToken(authorization);
    const userId = decodedData.id || decodedData._id;
    if (!userId) return next();

    req.rawToken = rawToken;
    req.decodedToken = decodedData;

    let user = null;
    if (decodedData.role === 'student') {
      user = await studentsRepository.findById(userId);
    } else if (decodedData.role === 'teacher') {
      user = await teachersRepository.findById(userId);
    } else if (decodedData.role === 'admin') {
      user = await adminsRepository.findById(userId);
    } else if (decodedData.role === 'parent') {
      user = await parentsRepository.findById(userId);
    } else {
      user = (await studentsRepository.findById(userId)) ||
             (await teachersRepository.findById(userId)) ||
             (await adminsRepository.findById(userId)) ||
             (await parentsRepository.findById(userId));
    }

    if (user) {
      req.authUser = user;
    }
  } catch (err) {
    // Gracefully ignore token errors for optional authentication
  }
  next();
};

export default authenticate;
