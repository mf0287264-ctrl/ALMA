import { ObjectId } from 'mongodb';
import { db } from '../../DB/db.connection.js';

class AssessmentsRepository {
  get collection() {
    return db.collection('assessments');
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
    return await this.collection.find(query).toArray();
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

  get submissionsCollection() {
    return db.collection('assessment_submissions');
  }

  async saveSubmission(data) {
    const sId = typeof data.student_id === 'string' && ObjectId.isValid(data.student_id) ? new ObjectId(data.student_id) : data.student_id;
    const aId = typeof data.assessment_id === 'string' && ObjectId.isValid(data.assessment_id) ? new ObjectId(data.assessment_id) : data.assessment_id;
    const cId = data.course_id && typeof data.course_id === 'string' && ObjectId.isValid(data.course_id) ? new ObjectId(data.course_id) : data.course_id;

    const doc = {
      ...data,
      student_id: sId,
      assessment_id: aId,
      course_id: cId,
      submitted_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const res = await this.submissionsCollection.insertOne(doc);
    return { ...doc, _id: res.insertedId };
  }

  async findLatestSubmission(studentId, assessmentId) {
    const sId = typeof studentId === 'string' && ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId;
    const aId = typeof assessmentId === 'string' && ObjectId.isValid(assessmentId) ? new ObjectId(assessmentId) : assessmentId;

    return await this.submissionsCollection.findOne(
      { student_id: sId, assessment_id: aId },
      { sort: { submitted_at: -1 } }
    );
  }

  async findSubmissionsByStudent(studentId) {
    const sId = typeof studentId === 'string' && ObjectId.isValid(studentId) ? new ObjectId(studentId) : studentId;
    return await this.submissionsCollection.find({ student_id: sId }).toArray();
  }
}

export default new AssessmentsRepository();
