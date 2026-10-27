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

  async getProfile(req, res, next) {
    try {
      // req.authUser was attached by the authenticate middleware directly from the database
      res.status(200).json({ success: true, data: req.authUser });
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
      const studentId = req.authUser?._id || req.params.id;
      const student = await studentsService.updateStudent(studentId, req.body);
      res.status(200).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const studentId = req.authUser?._id || req.params.id;
      await studentsService.deleteStudent(studentId);
      res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentsController();
