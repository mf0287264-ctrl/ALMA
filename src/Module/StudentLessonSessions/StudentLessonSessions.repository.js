import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class StudentLessonSessionsRepository {
  get collection() {
    return db.collection('student_lesson_sessions');
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
        $or: [{ session_id: id }, { _id: id }]
      });
    }
    return await this.collection.findOne({ _id: id });
  }

  async findBySessionId(sessionId) {
    return await this.collection.findOne({ session_id: sessionId });
  }

  async update(id, data) {
    const query = typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id
      ? { _id: new ObjectId(id) }
      : { $or: [{ session_id: id }, { _id: id }] };

    await this.collection.updateOne(
      query,
      { $set: { ...data, updated_at: new Date() } }
    );
    return await this.findById(id);
  }

  async addCheckpointLog(id, checkpointData) {
    const query = typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id
      ? { _id: new ObjectId(id) }
      : { $or: [{ session_id: id }, { _id: id }] };

    await this.collection.updateOne(
      query,
      {
        $push: { checkpoint_logs: { ...checkpointData, answered_at: new Date() } },
        $set: { updated_at: new Date() }
      }
    );
    return await this.findById(id);
  }

  async addDialogueLog(id, dialogueData) {
    const query = typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id
      ? { _id: new ObjectId(id) }
      : { $or: [{ session_id: id }, { _id: id }] };

    await this.collection.updateOne(
      query,
      {
        $push: { dialogue_logs: { ...dialogueData, asked_at: new Date() } },
        $set: { updated_at: new Date() }
      }
    );
    return await this.findById(id);
  }

  async delete(id) {
    const query = typeof id === 'string' && ObjectId.isValid(id) && String(new ObjectId(id)) === id
      ? { _id: new ObjectId(id) }
      : { $or: [{ session_id: id }, { _id: id }] };

    return await this.collection.deleteOne(query);
  }
}

export default new StudentLessonSessionsRepository();
