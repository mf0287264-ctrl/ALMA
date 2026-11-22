import coursesService from './Courses.service.js';

class CoursesController {
  async create(req, res, next) {
    try {
      const course = await coursesService.createCourse(req.body);
      res.status(201).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const courses = await coursesService.getAllCourses(req.query, req.authUser);
      res.status(200).json({ success: true, data: courses });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const course = await coursesService.getCourseById(req.params.id, req.authUser);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async enroll(req, res, next) {
    try {
      const studentId = req.authUser?._id;
      if (!studentId) {
        const error = new Error('Authentication required');
        error.statusCode = 401;
        throw error;
      }
      const result = await coursesService.enrollStudent(req.params.id, studentId);
      res.status(200).json({ success: true, message: 'Enrolled successfully', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getEnrollmentStatus(req, res, next) {
    try {
      const studentId = req.authUser?._id;
      if (!studentId) {
        return res.status(200).json({ success: true, is_enrolled: false });
      }
      const isEnrolled = await coursesService.checkStudentEnrollment(req.params.id, studentId);
      res.status(200).json({ success: true, is_enrolled: isEnrolled });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const course = await coursesService.updateCourse(req.params.id, req.body);
      res.status(200).json({ success: true, data: course });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await coursesService.deleteCourse(req.params.id);
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new CoursesController();
