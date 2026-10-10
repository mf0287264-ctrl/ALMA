const assessmentsService = require('./Assessments.service');

class AssessmentsController {
  async create(req, res, next) {
    try {
      const assessment = await assessmentsService.createAssessment(req.body);
      res.status(201).json({ success: true, data: assessment });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const assessments = await assessmentsService.getAllAssessments(req.query);
      res.status(200).json({ success: true, data: assessments });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const assessment = await assessmentsService.getAssessmentById(req.params.id);
      res.status(200).json({ success: true, data: assessment });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const assessment = await assessmentsService.updateAssessment(req.params.id, req.body);
      res.status(200).json({ success: true, data: assessment });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await assessmentsService.deleteAssessment(req.params.id);
      res.status(200).json({ success: true, message: 'Assessment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentsController();
