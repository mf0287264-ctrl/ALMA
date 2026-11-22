import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class LessonsRepository {
  get collection() {
    return db.collection('lessons');
  }

  async create(data) {
    const courseId = data.course_id && typeof data.course_id === 'string' && ObjectId.isValid(data.course_id)
      ? new ObjectId(data.course_id)
      : data.course_id;

    const moduleId = data.module_id && typeof data.module_id === 'string' && ObjectId.isValid(data.module_id)
      ? new ObjectId(data.module_id)
      : data.module_id;

    const result = await this.collection.insertOne({
      ...data,
      course_id: courseId,
      module_id: moduleId,
      created_at: new Date(),
      updated_at: new Date()
    });
    return await this.findById(result.insertedId);
  }

  async findAll(filter = {}, { summary = false } = {}) {
    const query = { ...filter };
    // Keep course and module constraints together while accepting both stored ID types.
    for (const field of ['course_id', 'module_id']) {
      const value = query[field];
      if (typeof value === 'string' && ObjectId.isValid(value)) {
        query[field] = { $in: [new ObjectId(value), value] };
      }
    }
    // Whiteboard scenes are large. List screens only need the lesson outline,
    // so `summary` leaves the scenes and plans out of the response.
    const projection = summary
      ? { 'versions.sections.whiteboard.scenes': 0, 'versions.sections.whiteboard.plan': 0 }
      : {};
    return await this.collection.find(query, { projection }).toArray();
  }

  async findById(id) {
    const queryId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: queryId });
  }

  async findByCourseIds(courseIds = []) {
    if (!courseIds || courseIds.length === 0) return [];
    const validIds = courseIds.map(id => typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id);
    const stringIds = courseIds.map(id => id.toString());
    return await this.collection.find({
      $or: [
        { course_id: { $in: validIds } },
        { course_id: { $in: stringIds } }
      ]
    }).toArray();
  }

  async findTeacherLessons(teacherId = null) {
    if (teacherId) {
      const tId = typeof teacherId === 'string' && ObjectId.isValid(teacherId) ? new ObjectId(teacherId) : teacherId;
      const results = await this.collection.find({
        $or: [
          { created_by: tId },
          { created_by: teacherId.toString() }
        ]
      }).toArray();
      if (results.length > 0) return results;
    }
    // Return any lessons created by teachers (created_by not null)
    return await this.collection.find({
      created_by: { $ne: null }
    }).toArray();
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

export default new LessonsRepository();
