const lessonGenerationsRepository = require('./LessonGenerations.repository');

class LessonGenerationsService {
  async createGenerationRequest(data) {
    data.status = 'pending';
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

module.exports = new LessonGenerationsService();
