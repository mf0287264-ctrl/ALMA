import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class StudentsRepository {
  get collection() {
    return db.collection('students');
  }

  async findByEmail(email) {
    if (!email) return null;
    return await this.collection.findOne({ email: email.toLowerCase().trim() });
  }

  async create(data) {
    const result = await this.collection.insertOne({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
    return await this.findById(result.insertedId);
  }

  async findAll(filter = {}) {
    return await this.collection.find(filter, { projection: { password_hash: 0 } }).toArray();
  }

  async findById(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: queryId }, { projection: { password_hash: 0 } });
  }

  async update(id, data) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    await this.collection.updateOne(
      { _id: queryId },
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async delete(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.deleteOne({ _id: queryId });
  }

  async findStudentsByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const objectIds = ids.map(id => typeof id === 'string' ? new ObjectId(id) : id);
    return await this.collection.find(
      { _id: { $in: objectIds } },
      {
        projection: {
          first_name: 1,
          last_name: 1,
          email: 1,
          student_code: 1,
          grade_level: 1,
          profile_image: 1,
          role: 1
        }
      }
    ).toArray();
  }

  async followStudent(currentId, targetId) {
    const cId = typeof currentId === 'string' ? new ObjectId(currentId) : currentId;
    const tId = typeof targetId === 'string' ? new ObjectId(targetId) : targetId;

    await this.collection.updateOne(
      { _id: cId },
      { $addToSet: { following: tId }, $set: { updated_at: new Date() } }
    );
    await this.collection.updateOne(
      { _id: tId },
      { $addToSet: { followers: cId }, $set: { updated_at: new Date() } }
    );
    return await this.findById(cId);
  }

  async unfollowStudent(currentId, targetId) {
    const cId = typeof currentId === 'string' ? new ObjectId(currentId) : currentId;
    const tId = typeof targetId === 'string' ? new ObjectId(targetId) : targetId;

    await this.collection.updateOne(
      { _id: cId },
      { $pull: { following: tId }, $set: { updated_at: new Date() } }
    );
    await this.collection.updateOne(
      { _id: tId },
      { $pull: { followers: cId }, $set: { updated_at: new Date() } }
    );
    return await this.findById(cId);
  }

  async sendFriendRequest(fromId, toId) {
    const fId = typeof fromId === 'string' ? new ObjectId(fromId) : fromId;
    const tId = typeof toId === 'string' ? new ObjectId(toId) : toId;

    await this.collection.updateOne(
      { _id: fId },
      { $addToSet: { friend_requests_sent: tId }, $set: { updated_at: new Date() } }
    );
    await this.collection.updateOne(
      { _id: tId },
      { $addToSet: { friend_requests_received: fId }, $set: { updated_at: new Date() } }
    );
  }

  async acceptFriendRequest(currentId, fromId) {
    const cId = typeof currentId === 'string' ? new ObjectId(currentId) : currentId;
    const fId = typeof fromId === 'string' ? new ObjectId(fromId) : fromId;

    // Both become friends and follow each other
    await this.collection.updateOne(
      { _id: cId },
      {
        $pull: { friend_requests_received: fId },
        $addToSet: { friends: fId, following: fId, followers: fId },
        $set: { updated_at: new Date() }
      }
    );
    await this.collection.updateOne(
      { _id: fId },
      {
        $pull: { friend_requests_sent: cId },
        $addToSet: { friends: cId, following: cId, followers: cId },
        $set: { updated_at: new Date() }
      }
    );
    return await this.findById(cId);
  }

  async rejectFriendRequest(currentId, fromId) {
    const cId = typeof currentId === 'string' ? new ObjectId(currentId) : currentId;
    const fId = typeof fromId === 'string' ? new ObjectId(fromId) : fromId;

    await this.collection.updateOne(
      { _id: cId },
      { $pull: { friend_requests_received: fId }, $set: { updated_at: new Date() } }
    );
    await this.collection.updateOne(
      { _id: fId },
      { $pull: { friend_requests_sent: cId }, $set: { updated_at: new Date() } }
    );
  }

  async addBookmark(studentId, postId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: sId },
      { $addToSet: { bookmarks: pId }, $set: { updated_at: new Date() } }
    );
  }

  async removeBookmark(studentId, postId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const pId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: sId },
      { $pull: { bookmarks: pId }, $set: { updated_at: new Date() } }
    );
  }
}

export default new StudentsRepository();
