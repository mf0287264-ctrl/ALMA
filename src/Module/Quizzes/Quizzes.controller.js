const quizzesService = require('./Quizzes.service');

class QuizzesController {
  async create(req, res, next) {
    try {
      const quiz = await quizzesService.createQuiz(req.body);
      res.status(201).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const quizzes = await quizzesService.getAllQuizzes(req.query);
      res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const quiz = await quizzesService.getQuizById(req.params.id);
      res.status(200).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const quiz = await quizzesService.updateQuiz(req.params.id, req.body);
      res.status(200).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await quizzesService.deleteQuiz(req.params.id);
      res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuizzesController();
