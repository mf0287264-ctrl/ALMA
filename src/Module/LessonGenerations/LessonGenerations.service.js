import crypto from 'crypto';
import lessonGenerationsRepository from './LessonGenerations.repository.js';
import { WHITEBOARD_GENERATION_DEFAULTS } from '../../Whiteboard/generationDefaults.js';
import { runLessonGeneration } from './generationWorker.js';
import { validateGenerationInput, scheduleGeneration } from '../../Security/generation.js';

class LessonGenerationsService {
  async createGenerationRequest(data) {
    validateGenerationInput(data);
    data = { ...data, whiteboard_generation: { ...structuredClone(WHITEBOARD_GENERATION_DEFAULTS), ...data?.whiteboard_generation } };
    data.job_id = data.job_id || `job_${crypto.randomBytes(5).toString('hex')}`;
    data.status = data.status || 'pending';
    data.current_step = data.current_step || 'queued';
    data.progress_percent = data.progress_percent ?? 0.0;
    data.step_message = data.step_message || 'Generation initialized...';
    data.programming_language = data.programming_language || 'Python';
    data.grade_level = data.grade_level || 'Grade 8';
    data.model = data.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    // Credentials are server configuration, never job metadata.
    for (const field of ['api_key', 'gemini_api_key', 'geminiApiKey', 'hf_api_token']) delete data[field];
    if (!process.env.GEMINI_API_KEY && !process.env.LESSON_GENERATION_EXTERNAL_WORKER) {
      data.status = 'failed';
      data.current_step = 'failed';
      data.error = 'The lesson generation service is not connected. Ask your administrator to configure the model provider.';
      data.step_message = data.error;
    }
    const job = await lessonGenerationsRepository.create(data);
    if (process.env.GEMINI_API_KEY && job.status === 'pending') {
      try { scheduleGeneration(() => runLessonGeneration(job)); }
      catch { return await lessonGenerationsRepository.update(job._id, { status: 'failed', current_step: 'failed', error: 'The generation queue is full. Try again shortly.' }); }
    }
    return job;
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
