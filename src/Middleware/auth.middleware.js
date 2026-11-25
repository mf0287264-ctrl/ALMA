import students from '../Module/Students/Students.repository.js';
import teachers from '../Module/Teachers/Teachers.repository.js';
import admins from '../Module/Admins/Admins.repository.js';
import parents from '../Module/Parents/Parents.repository.js';
import sessions from '../Module/Auth/AuthSessions.repository.js';
import { verifyToken, extractRawToken } from '../Utils/jwt.util.js';
import { ObjectId } from 'mongodb';

const repositories = { student: students, teacher: teachers, admin: admins, parent: parents };
const invalid = () => Object.assign(new Error('Authentication required. Please log in again.'), { statusCode: 401 });

export const authenticate = async (req, res, next) => {
  if (req.authUser && req.decodedToken && req.rawToken) return next();
  try {
    const authorization = req.headers.authorization;
    if (typeof authorization !== 'string' || !/^Bearer \S+$/.test(authorization)) throw invalid();
    const decoded = verifyToken(authorization);
    if (typeof decoded.sid !== 'string' || typeof decoded.id !== 'string' || !ObjectId.isValid(decoded.id)) throw invalid();
    const session = await sessions.findActive(decoded.sid, decoded.id, decoded.role);
    if (!session) throw invalid();
    const user = await repositories[decoded.role].findById(decoded.id);
    if (!user || user.is_active === false || (decoded.auth_version || 0) !== (user.auth_version || 0) || (session.auth_version || 0) !== (user.auth_version || 0)) throw invalid();
    req.rawToken = extractRawToken(authorization);
    req.decodedToken = decoded;
    // A database collection determines the account role; stored profile fields cannot change it.
    req.authUser = { ...user, role: decoded.role };
    delete req.authUser.password;
    delete req.authUser.password_hash;
    next();
  } catch (error) {
    if (error.statusCode !== 401) error = Object.assign(new Error('The authentication service is temporarily unavailable.'), { statusCode: 503 });
    next(error);
  }
};

export const optionalAuthenticate = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return authenticate(req, res, next);
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.authUser) return next(invalid());
  if (!roles.includes(req.authUser.role)) return next(Object.assign(new Error('You do not have permission to access this resource.'), { statusCode: 403 }));
  next();
};
export default authenticate;
