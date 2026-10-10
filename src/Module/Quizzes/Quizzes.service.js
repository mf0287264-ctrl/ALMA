import quizzesRepository from './Quizzes.repository.js';

class QuizzesService {
  async createQuiz(data) {
    return await quizzesRepository.create(data);
  }

  async getAllQuizzes(filter) {
    return await quizzesRepository.findAll(filter);
  }

  async getQuizById(id) {
    const quiz = await quizzesRepository.findById(id);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }
    return quiz;
  }

  async updateQuiz(id, data) {
    const quiz = await quizzesRepository.update(id, data);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }
    return quiz;
  }

  async deleteQuiz(id) {
    const quiz = await quizzesRepository.delete(id);
    if (!quiz) {
      const error = new Error('Quiz not found');
      error.statusCode = 404;
      throw error;
    }
    return quiz;
  }
}

export default new QuizzesService();
