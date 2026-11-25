import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class AdminsRepository {
  get collection() {
    return db.collection('admins');
  }

  async findByEmail(email) {
    if (!email) return null;
    const doc = await this.collection.findOne({ email: email.toLowerCase().trim() });
    return doc ? { role: 'admin', ...doc } : null;
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
    const docs = await this.collection.find(filter, { projection: { password_hash: 0 } }).toArray();
    return docs.map((d) => ({ role: 'admin', ...d }));
  }

  async findById(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    const doc = await this.collection.findOne({ _id: queryId }, { projection: { password_hash: 0 } });
    return doc ? { role: 'admin', ...doc } : null;
  }

  async update(id, data) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    await this.collection.updateOne(
      { _id: queryId },
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async updateDocumentById(id, data, options = {}) {
    return await this.update(id, data);
  }

  async delete(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.deleteOne({ _id: queryId });
  }
}

export default new AdminsRepository();
