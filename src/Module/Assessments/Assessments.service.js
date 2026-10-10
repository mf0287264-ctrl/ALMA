import assessmentsRepository from './Assessments.repository.js';

class AssessmentsService {
  async createAssessment(data) {
    return await assessmentsRepository.create(data);
  }

  async getAllAssessments(filter) {
    return await assessmentsRepository.findAll(filter);
  }

  async getAssessmentById(id) {
    const assessment = await assessmentsRepository.findById(id);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }
    return assessment;
  }

  async updateAssessment(id, data) {
    const assessment = await assessmentsRepository.update(id, data);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }
    return assessment;
  }

  async deleteAssessment(id) {
    const assessment = await assessmentsRepository.delete(id);
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.statusCode = 404;
      throw error;
    }
    return assessment;
  }
}

export default new AssessmentsService();
