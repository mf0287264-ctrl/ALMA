import { randomUUID } from 'node:crypto';
import { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken, tokenExpiration } from '../../Utils/jwt.util.js';
import sessions from './AuthSessions.repository.js';
import students from '../Students/Students.repository.js';
import teachers from '../Teachers/Teachers.repository.js';
import admins from '../Admins/Admins.repository.js';
import parents from '../Parents/Parents.repository.js';

const repositories = { student: students, teacher: teachers, admin: admins, parent: parents };
const unauthorized = () => Object.assign(new Error('Invalid or expired authentication session. Please log in again.'), { statusCode: 401 });

class AuthService {
  buildPayload(user, role) { return { id: String(user._id), role, auth_version: user.auth_version || 0 }; }
  async generateTokenPair(payload) {
    const sid = randomUUID();
    const identity = { id: String(payload.id || payload._id), role: payload.role, auth_version: payload.auth_version || 0, sid };
    const accessToken = generateToken(identity);
    const refreshToken = generateRefreshToken(identity);
    await sessions.create(sid, payload.id || payload._id, payload.role, refreshToken, tokenExpiration(refreshToken), identity.auth_version);
    return { accessToken, refreshToken };
  }
  async logout(accessToken, refreshToken) {
    let claims;
    if (refreshToken) claims = verifyRefreshToken(refreshToken);
    else claims = verifyToken(accessToken);
    if (!claims.sid) throw unauthorized();
    await sessions.revoke(claims.sid);
  }
  async refresh(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    const session = decoded.sid ? await sessions.findActive(decoded.sid, decoded.id, decoded.role) : null;
    if (!session) throw unauthorized();
    const user = await repositories[decoded.role].findById(decoded.id);
    if (!user || user.is_active === false || (session.auth_version || 0) !== (user.auth_version || 0)) { await sessions.revoke(decoded.sid); throw unauthorized(); }
    const payload = { ...this.buildPayload(user, decoded.role), sid: decoded.sid };
    const accessToken = generateToken(payload), nextRefresh = generateRefreshToken(payload);
    if (!await sessions.rotate(decoded.sid, refreshToken, nextRefresh, tokenExpiration(nextRefresh))) {
      await sessions.revoke(decoded.sid);
      throw unauthorized();
    }
    return { accessToken, refreshToken: nextRefresh };
  }
}
export default new AuthService();
