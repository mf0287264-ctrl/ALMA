const lessonGenerationsService = require('./LessonGenerations.service');

class LessonGenerationsController {
  async create(req, res, next) {
    try {
      const generation = await lessonGenerationsService.createGenerationRequest(req.body);
      res.status(201).json({ success: true, data: generation });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const generations = await lessonGenerationsService.getAllGenerations(req.query);
      res.status(200).json({ success: true, data: generations });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const generation = await lessonGenerationsService.getGenerationById(req.params.id);
      res.status(200).json({ success: true, data: generation });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const generation = await lessonGenerationsService.updateGeneration(req.params.id, req.body);
      res.status(200).json({ success: true, data: generation });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await lessonGenerationsService.deleteGeneration(req.params.id);
      res.status(200).json({ success: true, message: 'Lesson generation job deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LessonGenerationsController();
