import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class ModulesRepository {
  get collection() {
    return db.collection('modules');
  }

  async create(data) {
    const courseId = data.course_id && typeof data.course_id === 'string' && ObjectId.isValid(data.course_id)
      ? new ObjectId(data.course_id)
      : data.course_id;

    const result = await this.collection.insertOne({
      ...data,
      course_id: courseId,
      created_at: new Date(),
      updated_at: new Date()
    });
    return await this.findById(result.insertedId);
  }

  async findAll(filter = {}) {
    const query = { ...filter };
    if (query.course_id && typeof query.course_id === 'string' && ObjectId.isValid(query.course_id)) {
      query.$or = [
        { course_id: new ObjectId(query.course_id) },
        { course_id: query.course_id }
      ];
      delete query.course_id;
    }
    return await this.collection.find(query).sort({ order: 1 }).limit(200).toArray();
  }

  async countByCourse(courseId) {
    if (!courseId) return 0;
    const query = typeof courseId === 'string' && ObjectId.isValid(courseId)
      ? { $or: [{ course_id: new ObjectId(courseId) }, { course_id: String(courseId) }] }
      : { $or: [{ course_id: courseId }, { course_id: String(courseId) }] };
    return await this.collection.countDocuments(query);
  }

  async findById(id) {
    const queryId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: queryId });
  }

  async update(id, data) {
    const queryId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
    await this.collection.updateOne(
      { _id: queryId },
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async delete(id) {
    const queryId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
    return await this.collection.deleteOne({ _id: queryId });
  }
}

export default new ModulesRepository();
