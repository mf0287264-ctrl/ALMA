const teachersRepository = require('./Teachers.repository');

class TeachersService {
  async createTeacher(data) {
    if (!data.password_hash) {
      data.password_hash = 'default_hashed_pass';
    }
    return await teachersRepository.create(data);
  }

  async getAllTeachers(filter) {
    return await teachersRepository.findAll(filter);
  }

  async getTeacherById(id) {
    const teacher = await teachersRepository.findById(id);
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    return teacher;
  }

  async updateTeacher(id, data) {
    const teacher = await teachersRepository.update(id, data);
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    return teacher;
  }

  async deleteTeacher(id) {
    const teacher = await teachersRepository.delete(id);
    if (!teacher) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    return teacher;
  }
}

module.exports = new TeachersService();
