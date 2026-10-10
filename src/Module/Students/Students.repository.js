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
}

export default new StudentsRepository();
