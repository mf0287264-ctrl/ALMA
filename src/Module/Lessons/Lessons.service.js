const lessonsRepository = require('./Lessons.repository');

class LessonsService {
  async createLesson(data) {
    return await lessonsRepository.create(data);
  }

  async getAllLessons(filter) {
    return await lessonsRepository.findAll(filter);
  }

  async getLessonById(id) {
    const lesson = await lessonsRepository.findById(id);
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }
    return lesson;
  }

  async updateLesson(id, data) {
    const lesson = await lessonsRepository.update(id, data);
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }
    return lesson;
  }

  async deleteLesson(id) {
    const lesson = await lessonsRepository.delete(id);
    if (!lesson) {
      const error = new Error('Lesson not found');
      error.statusCode = 404;
      throw error;
    }
    return lesson;
  }
}

module.exports = new LessonsService();
