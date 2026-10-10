const studentsRepository = require('./Students.repository');

class StudentsService {
  async createStudent(data) {
    // Generate default password_hash if not provided for testing
    if (!data.password_hash) {
      data.password_hash = 'default_hashed_pass';
    }
    return await studentsRepository.create(data);
  }

  async getAllStudents(filter) {
    return await studentsRepository.findAll(filter);
  }

  async getStudentById(id) {
    const student = await studentsRepository.findById(id);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return student;
  }

  async updateStudent(id, data) {
    const student = await studentsRepository.update(id, data);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return student;
  }

  async deleteStudent(id) {
    const student = await studentsRepository.delete(id);
    if (!student) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return student;
  }
}

module.exports = new StudentsService();
