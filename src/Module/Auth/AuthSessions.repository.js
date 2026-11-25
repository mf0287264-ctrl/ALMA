import { createHash } from "node:crypto";
import { db } from "../../DB/db.connection.js";

export const tokenDigest = (token) =>
  createHash("sha256").update(token).digest("hex");

class AuthSessionsRepository {
  get collection() {
    return db.collection("auth_sessions");
  }
  async create(sid, userId, role, refreshToken, expiresAt, authVersion = 0) {
    await this.collection.insertOne({
      _id: sid,
      user_id: String(userId),
      role,
      auth_version: authVersion,
      refresh_hash: tokenDigest(refreshToken),
      expires_at: expiresAt,
      revoked: false,
      created_at: new Date(),
    });
  }
  async findActive(sid, userId, role) {
    return await this.collection.findOne({
      _id: sid,
      user_id: String(userId),
      role,
      revoked: false,
      expires_at: { $gt: new Date() },
    });
  }
  async rotate(sid, oldRefresh, newRefresh, expiresAt) {
    // Rotation does not extend the absolute lifetime of the session family.
    const result = await this.collection.updateOne(
      {
        _id: sid,
        revoked: false,
        refresh_hash: tokenDigest(oldRefresh),
        expires_at: { $gt: new Date() },
      },
      {
        $set: { refresh_hash: tokenDigest(newRefresh), updated_at: new Date() },
      },
    );
    return result.modifiedCount === 1;
  }
  async revoke(sid) {
    await this.collection.updateOne(
      { _id: sid },
      { $set: { revoked: true, revoked_at: new Date() } },
    );
  }
  async revokeUser(userId, olderThanVersion) {
    await this.collection.updateMany(
      {
        user_id: String(userId),
        revoked: false,
        ...(olderThanVersion !== undefined
          ? { auth_version: { $lt: olderThanVersion } }
          : {}),
      },
      { $set: { revoked: true, revoked_at: new Date() } },
    );
  }
}
export default new AuthSessionsRepository();
