import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class LessonsRepository {
  get collection() {
    return db.collection('lessons');
  }

  async create(data) {
    const result = await this.collection.insertOne({
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
    return await this.findById(result.insertedId);
  }

  async findAll(filter = {}, { summary = false } = {}) {
    // Whiteboard scenes are large. List screens only need the lesson outline,
    // so `summary` leaves the scenes and plans out of the response.
    const projection = summary
      ? { 'versions.sections.whiteboard.scenes': 0, 'versions.sections.whiteboard.plan': 0 }
      : {};
    return await this.collection.find(filter, { projection }).toArray();
  }

  async findById(id) {
    const queryId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: queryId });
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

export default new LessonsRepository();
