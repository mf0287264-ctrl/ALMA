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

  async login(req, res, next) {
    try {
      const result = await studentsService.login(req.body);
      res.status(200).json({ success: true, data: result });
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

  async toggleFollow(req, res, next) {
    try {
      const currentStudentId = req.authUser._id;
      const targetStudentId = req.params.id;
      const result = await studentsService.toggleFollow(currentStudentId, targetStudentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async sendFriendRequest(req, res, next) {
    try {
      const currentStudentId = req.authUser._id;
      const targetStudentId = req.params.id;
      const result = await studentsService.sendFriendRequest(currentStudentId, targetStudentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async acceptFriendRequest(req, res, next) {
    try {
      const currentStudentId = req.authUser._id;
      const fromStudentId = req.params.id;
      const result = await studentsService.acceptFriendRequest(currentStudentId, fromStudentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async rejectFriendRequest(req, res, next) {
    try {
      const currentStudentId = req.authUser._id;
      const fromStudentId = req.params.id;
      const result = await studentsService.rejectFriendRequest(currentStudentId, fromStudentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyFriends(req, res, next) {
    try {
      const studentId = req.authUser._id;
      const result = await studentsService.getMyFriends(studentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowing(req, res, next) {
    try {
      const studentId = req.params.id;
      const result = await studentsService.getFollowing(studentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getFollowers(req, res, next) {
    try {
      const studentId = req.params.id;
      const result = await studentsService.getFollowers(studentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async searchStudents(req, res, next) {
    try {
      const currentStudentId = req.authUser._id;
      const query = req.query.q || '';
      const result = await studentsService.searchStudents(currentStudentId, query);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const currentStudentId = req.authUser._id;
      const result = await studentsService.getDashboardSummary(currentStudentId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new StudentsController();
