const lessonsService = require('./Lessons.service');

class LessonsController {
  async create(req, res, next) {
    try {
      const lesson = await lessonsService.createLesson(req.body);
      res.status(201).json({ success: true, data: lesson });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const lessons = await lessonsService.getAllLessons(req.query);
      res.status(200).json({ success: true, data: lessons });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const lesson = await lessonsService.getLessonById(req.params.id);
      res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const lesson = await lessonsService.updateLesson(req.params.id, req.body);
      res.status(200).json({ success: true, data: lesson });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await lessonsService.deleteLesson(req.params.id);
      res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LessonsController();
