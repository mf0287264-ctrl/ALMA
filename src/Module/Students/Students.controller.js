import studentsService from './Students.service.js';

class StudentsController {
  async create(req, res, next) {
    try {
      const student = await studentsService.createStudent(req.body);
      res.status(201).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const students = await studentsService.getAllStudents(req.query);
      res.status(200).json({ success: true, data: students });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const student = await studentsService.getStudentById(req.params.id);
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const student = await studentsService.updateStudent(req.params.id, req.body);
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await studentsService.deleteStudent(req.params.id);
      res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentsController();
