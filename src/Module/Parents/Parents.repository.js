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
    if (!id) return null;
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: queryId }, { projection: { password_hash: 0 } });
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
