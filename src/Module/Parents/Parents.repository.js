import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class ParentsRepository {
  get collection() {
    return db.collection('parents');
  }

  get messagesCollection() {
    return db.collection('parent_messages');
  }

  async findByEmail(email) {
    if (!email) return null;
    const doc = await this.collection.findOne({ email: email.toLowerCase().trim() });
    return doc ? { ...doc, role: 'parent' } : null;
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
    const docs = await this.collection.find(filter, { projection: { password_hash: 0 } }).limit(200).toArray();
    return docs.map((d) => ({ ...d, role: 'parent' }));
  }

  async findById(id) {
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    const doc = await this.collection.findOne({ _id: queryId }, { projection: { password_hash: 0 } });
    return doc ? { ...doc, role: 'parent' } : null;
  }

  async update(id, data) {
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    await this.collection.updateOne(
      { _id: queryId },
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async updateCredentials(id, data) {
    const clean = { ...data };
    delete clean.auth_version;
    const doc = await this.collection.findOneAndUpdate({ _id: new ObjectId(String(id)) }, { $set: { ...clean, updated_at: new Date() }, $inc: { auth_version: 1 } }, { returnDocument: 'after', projection: { password_hash: 0 } });
    return doc ? { ...doc, role: 'parent' } : null;
  }

  async updateDocumentById(id, data, options = {}) {
    return await this.update(id, data);
  }

  async delete(id) {
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.deleteOne({ _id: queryId });
  }

  async addChild(parentId, childId) {
    const pId = typeof parentId === 'string' ? new ObjectId(parentId) : parentId;
    const cId = typeof childId === 'string' ? new ObjectId(childId) : childId;
    await this.collection.updateOne(
      { _id: pId },
      { 
        $addToSet: { children: cId },
        $set: { updated_at: new Date() }
      }
    );
    return await this.findById(parentId);
  }

  async removeChild(parentId, childId) {
    const pId = typeof parentId === 'string' ? new ObjectId(parentId) : parentId;
    const cId = typeof childId === 'string' ? new ObjectId(childId) : childId;
    await this.collection.updateOne(
      { _id: pId },
      {
        $pull: { children: cId },
        $set: { updated_at: new Date() }
      }
    );
    await db.collection('students').updateOne(
      { _id: cId, parent_id: pId },
      {
        $set: {
          parent_id: null,
          parent_name: null,
          parent_phone: null,
          parent_email: null,
          parent_relation: null,
          updated_at: new Date()
        }
      }
    );
    return await this.findById(parentId);
  }

  async findChildrenDetails(childrenIds = [], parentId) {
    if (!childrenIds || childrenIds.length === 0) return [];
    const objectIds = childrenIds.map((id) => (typeof id === 'string' ? new ObjectId(id) : id));
    return await db.collection('students').find(
      { _id: { $in: objectIds }, parent_id: new ObjectId(String(parentId)), guardian_verified_at: { $exists: true } },
      { projection: { password_hash: 0 } }
    ).toArray();
  }

  async getChildSessions(studentId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    return await db.collection('student_lesson_sessions')
      .find({ student_id: sId })
      .sort({ created_at: -1 })
      .toArray();
  }

  async getChildAchievements(studentId) {
    const sId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    return await db.collection('achievements')
      .find({ student_id: sId })
      .sort({ awarded_at: -1 })
      .toArray();
  }

  async saveMessage(messageData) {
    const doc = {
      ...messageData,
      created_at: new Date(),
      read: false
    };
    const res = await this.messagesCollection.insertOne(doc);
    return { ...doc, _id: res.insertedId };
  }

  async getMessagesByParent(parentId) {
    const pId = typeof parentId === 'string' ? new ObjectId(parentId) : parentId;
    return await this.messagesCollection
      .find({ from_parent_id: pId })
      .sort({ created_at: -1 })
      .toArray();
  }
}

export default new ParentsRepository();
