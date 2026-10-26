import crypto from 'crypto';
import lessonGenerationsRepository from './LessonGenerations.repository.js';

class LessonGenerationsService {
  async createGenerationRequest(data) {
    data.job_id = data.job_id || `job_${crypto.randomBytes(5).toString('hex')}`;
    data.status = data.status || 'pending';
    data.current_step = data.current_step || 'queued';
    data.progress_percent = data.progress_percent ?? 0.0;
    data.step_message = data.step_message || 'Generation initialized...';
    data.programming_language = data.programming_language || 'Python';
    data.grade_level = data.grade_level || 'Grade 8';
    data.model = data.model || 'gemini-3.5-flash-lite';
    return await lessonGenerationsRepository.create(data);
  }

  async getAllGenerations(filter) {
    return await lessonGenerationsRepository.findAll(filter);
  }

  async getGenerationById(id) {
    const generation = await lessonGenerationsRepository.findById(id);
    if (!generation) {
      const error = new Error('Lesson generation job not found');
      error.statusCode = 404;
      throw error;
    }
    return generation;
  }

  async getGenerationByJobId(jobId) {
    const generation = await lessonGenerationsRepository.findByJobId(jobId);
    if (!generation) {
      const error = new Error('Lesson generation job not found');
      error.statusCode = 404;
      throw error;
    }
    return generation;
  }

  async updateGeneration(id, data) {
    const generation = await lessonGenerationsRepository.update(id, data);
    if (!generation) {
      const error = new Error('Lesson generation job not found');
      error.statusCode = 404;
      throw error;
    }
    return generation;
  }

  async deleteGeneration(id) {
    const generation = await lessonGenerationsRepository.delete(id);
    if (!generation) {
      const error = new Error('Lesson generation job not found');
      error.statusCode = 404;
      throw error;
    }
    return generation;
  }
}

export default new LessonGenerationsService();
