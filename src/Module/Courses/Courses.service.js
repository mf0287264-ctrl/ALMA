import coursesRepository from './Courses.repository.js';

class CoursesService {
  async createCourse(data) {
    return await coursesRepository.create(data);
  }

  async getAllCourses(filter) {
    return await coursesRepository.findAll(filter);
  }

  async getCourseById(id) {
    const course = await coursesRepository.findById(id);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    return course;
  }

  async updateCourse(id, data) {
    const course = await coursesRepository.update(id, data);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    return course;
  }

  async deleteCourse(id) {
    const result = await coursesRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
}

export default new CoursesService();
