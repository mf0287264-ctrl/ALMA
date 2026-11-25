import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class QuizzesRepository {
  get collection() {
    return db.collection('quizzes');
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
    const query = { ...filter };
    if (query.course_id && typeof query.course_id === 'string' && ObjectId.isValid(query.course_id)) {
      query.$or = [
        { course_id: new ObjectId(query.course_id) },
        { course_id: query.course_id }
      ];
      delete query.course_id;
    }
    return await this.collection.find(query).limit(200).toArray();
  }

  async findById(id) {
    const queryId = typeof id === 'string' && ObjectId.isValid(id) ? new ObjectId(id) : id;
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

  get attemptsCollection() {
    return db.collection('quiz_attempts');
  }

  async saveAttempt(data) {
    const sId = typeof data.student_id === 'string' && ObjectId.isValid(data.student_id) ? new ObjectId(data.student_id) : data.student_id;
    const qId = typeof data.quiz_id === 'string' && ObjectId.isValid(data.quiz_id) ? new ObjectId(data.quiz_id) : data.quiz_id;
    const cId = data.course_id && typeof data.course_id === 'string' && ObjectId.isValid(data.course_id) ? new ObjectId(data.course_id) : data.course_id;

    const doc = {
      ...data,
      student_id: sId,
      quiz_id: qId,
      course_id: cId,
      completed_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };
    const res = await this.attemptsCollection.insertOne(doc);
    return { ...doc, _id: res.insertedId };
  }

  async findLatestAttempt(studentId, quizId) {
    const sId = typeof studentId === 'string' && ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId;
    const qId = typeof quizId === 'string' && ObjectId.isValid(quizId) ? new ObjectId(quizId) : quizId;

    return await this.attemptsCollection.findOne(
      { student_id: sId, quiz_id: qId },
      { sort: { completed_at: -1 } }
    );
  }

  async findAttemptsByStudent(studentId) {
    const sId = typeof studentId === 'string' && ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId;
    return await this.attemptsCollection.find({ student_id: sId }).toArray();
  }
}

export default new QuizzesRepository();
