import quizzesService from './Quizzes.service.js';

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
      const quizzes = await quizzesService.getAllQuizzes(req.query, req.authUser);
      res.status(200).json({ success: true, data: quizzes });
    } catch (error) {
      next(error);
    }
  }

  async recordAttempt(req, res, next) {
    try {
      const studentId = req.authUser?._id;
      if (!studentId) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        throw error;
      }
      const attempt = await quizzesService.recordAttempt(req.params.id, studentId, req.body);
      res.status(201).json({ success: true, message: 'Quiz attempt saved', data: attempt });
    } catch (error) {
      next(error);
    }
  }

  async getMyAttempt(req, res, next) {
    try {
      const studentId = req.authUser?._id;
      if (!studentId) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        throw error;
      }
      const attempt = await quizzesService.getMyAttempt(req.params.id, studentId);
      res.status(200).json({ success: true, data: attempt });
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

export default new QuizzesController();
