import assessmentsService from './Assessments.service.js';

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
      const assessments = await assessmentsService.getAllAssessments(req.query, req.authUser);
      res.status(200).json({ success: true, data: assessments });
    } catch (error) {
      next(error);
    }
  }

  async submit(req, res, next) {
    try {
      const studentId = req.authUser?._id;
      if (!studentId) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        throw error;
      }
      const submission = await assessmentsService.submitAssessment(req.params.id, studentId, req.body);
      res.status(201).json({ success: true, message: 'Assessment submitted successfully', data: submission });
    } catch (error) {
      next(error);
    }
  }

  async getMyResult(req, res, next) {
    try {
      const studentId = req.authUser?._id;
      if (!studentId) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        throw error;
      }
      const result = await assessmentsService.getMyResult(req.params.id, studentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const assessment = await assessmentsService.getAssessmentById(req.params.id, req.authUser);
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

export default new AssessmentsController();
