const teachersService = require('./Teachers.service');

class TeachersController {
  async create(req, res, next) {
    try {
      const teacher = await teachersService.createTeacher(req.body);
      res.status(201).json({ success: true, data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const teachers = await teachersService.getAllTeachers(req.query);
      res.status(200).json({ success: true, data: teachers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const teacher = await teachersService.getTeacherById(req.params.id);
      res.status(200).json({ success: true, data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const teacher = await teachersService.updateTeacher(req.params.id, req.body);
      res.status(200).json({ success: true, data: teacher });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await teachersService.deleteTeacher(req.params.id);
      res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeachersController();
