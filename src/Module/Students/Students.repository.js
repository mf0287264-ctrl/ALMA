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

  async searchStudents(query, excludeId) {
    const exclId = typeof excludeId === 'string' ? new ObjectId(excludeId) : excludeId;
    const filter = { _id: { $ne: exclId } };
    if (query && query.trim()) {
      const q = query.trim();
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { first_name: regex },
        { last_name: regex },
        { student_code: regex },
        { email: regex }
      ];
    }
    return await this.collection.find(filter, {
      projection: {
        first_name: 1,
        last_name: 1,
        email: 1,
        student_code: 1,
        grade_level: 1,
        profile_image: 1,
        current_streak: 1,
        role: 1
      }
    }).limit(20).toArray();
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

  async enrollCourse(studentId, courseId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const cId = typeof courseId === 'string' && ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
    await this.collection.updateOne(
      { _id: sId },
      { $addToSet: { enrolled_courses: cId }, $set: { updated_at: new Date() } }
    );
    return await this.findById(sId);
  }

  async unenrollCourse(studentId, courseId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const cId = typeof courseId === 'string' && ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
    await this.collection.updateOne(
      { _id: sId },
      { $pull: { enrolled_courses: cId }, $set: { updated_at: new Date() } }
    );
    return await this.findById(sId);
  }

  async isEnrolled(studentId, courseId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const cId = typeof courseId === 'string' && ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId;
    const student = await this.collection.findOne({
      _id: sId,
      $or: [
        { enrolled_courses: cId },
        { enrolled_courses: typeof courseId === 'string' ? courseId : courseId.toString() }
      ]
    });
    return Boolean(student);
  }
}

export default new StudentsRepository();
