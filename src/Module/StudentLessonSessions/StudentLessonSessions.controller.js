import studentLessonSessionsService from './StudentLessonSessions.service.js';

class StudentLessonSessionsController {
  async create(req, res, next) {
    try {
      const session = await studentLessonSessionsService.createSession(req.body);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const sessions = await studentLessonSessionsService.getAllSessions(req.query);
      res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const session = await studentLessonSessionsService.getSessionById(req.params.id);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const session = await studentLessonSessionsService.updateSession(req.params.id, req.body);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async logCheckpoint(req, res, next) {
    try {
      const session = await studentLessonSessionsService.logCheckpoint(req.params.id, req.body);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async logDialogue(req, res, next) {
    try {
      const session = await studentLessonSessionsService.logDialogue(req.params.id, req.body);
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await studentLessonSessionsService.deleteSession(req.params.id);
      res.status(200).json({ success: true, message: 'Student lesson session deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentLessonSessionsController();
