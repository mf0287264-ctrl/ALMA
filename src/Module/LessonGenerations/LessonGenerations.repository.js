import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class LessonGenerationsRepository {
  get collection() {
    return db.collection('lesson_generations');
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
    return await this.collection.find(filter).toArray();
  }

  async findById(id) {
    if (typeof id === 'string') {
      if (ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
        const doc = await this.collection.findOne({ _id: new ObjectId(id) });
        if (doc) return doc;
      }
      return await this.collection.findOne({
        $or: [{ job_id: id }, { _id: id }]
      });
    }
    return await this.collection.findOne({ _id: id });
  }

  async findByJobId(jobId) {
    return await this.collection.findOne({ job_id: jobId });
  }

  async update(id, data) {
    const query = typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id
      ? { _id: new ObjectId(id) }
      : { $or: [{ job_id: id }, { _id: id }] };

    await this.collection.updateOne(
      query,
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async delete(id) {
    const query = typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id
      ? { _id: new ObjectId(id) }
      : { $or: [{ job_id: id }, { _id: id }] };

    return await this.collection.deleteOne(query);
  }
}

export default new LessonGenerationsRepository();
