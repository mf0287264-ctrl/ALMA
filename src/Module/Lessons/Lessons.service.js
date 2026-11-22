import lessonsRepository from './Lessons.repository.js';
import { prepareLessonWhiteboards } from '../../Whiteboard/prepareLessonWhiteboards.js';

class LessonsService {
  async createLesson(data) {
    return await lessonsRepository.create(prepareLessonWhiteboards(data));
  }

  async getAllLessons(filter, options) {
    return await lessonsRepository.findAll(filter, options);
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
    const lesson = await lessonsRepository.update(id, prepareLessonWhiteboards(data));
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

export default new LessonsService();
