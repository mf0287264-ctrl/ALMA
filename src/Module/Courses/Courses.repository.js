import { escapeSearch } from '../../Security/input.js';
import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class CoursesRepository {
  get collection() {
    return db.collection('courses');
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
    return await this.collection.find(filter).limit(200).toArray();
  }

  async findById(id) {
    if (!id) return null;

    // 1. Try finding by ObjectId
    if (typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id) {
      const found = await this.collection.findOne({ _id: new ObjectId(id) });
      if (found) return found;
    } else if (id instanceof ObjectId) {
      const found = await this.collection.findOne({ _id: id });
      if (found) return found;
    }

    // 2. Try finding by title slug (e.g. "intro-to-python" -> regex for "intro.*python")
    if (typeof id === 'string') {
      const slugPattern = id.split(/[-_]+/).map(escapeSearch).join('[^a-z0-9]+');
      const foundByTitle = await this.collection.findOne({
        title: { $regex: new RegExp(`^${slugPattern}$`, 'i') }
      });
      if (foundByTitle) return foundByTitle;

      // Relaxed match
      return await this.collection.findOne({
        title: { $regex: new RegExp(slugPattern, 'i') }
      });
    }

    return null;
  }

  async update(id, data) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await this.collection.updateOne(
      { _id: existing._id },
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(existing._id);
  }

  async delete(id) {
    const existing = await this.findById(id);
    if (!existing) return null;

    return await this.collection.deleteOne({ _id: existing._id });
  }
}

export default new CoursesRepository();
