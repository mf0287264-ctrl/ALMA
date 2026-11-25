import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class TeachersRepository {
  get collection() {
    return db.collection('teachers');
  }

  async findByEmail(email) {
    if (!email) return null;
    const doc = await this.collection.findOne({ email: email.toLowerCase().trim() });
    return doc ? { ...doc, role: 'teacher' } : null;
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
    return docs.map((d) => ({ ...d, role: 'teacher' }));
  }

  async findById(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    const doc = await this.collection.findOne({ _id: queryId }, { projection: { password_hash: 0 } });
    return doc ? { ...doc, role: 'teacher' } : null;
  }

  async update(id, data) {
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
    return doc ? { ...doc, role: 'teacher' } : null;
  }

  async updateDocumentById(id, data, options = {}) {
    return await this.update(id, data);
  }

  async delete(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.deleteOne({ _id: queryId });
  }
}

export default new TeachersRepository();
