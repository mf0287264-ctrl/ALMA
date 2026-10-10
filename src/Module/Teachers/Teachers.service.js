import teachersRepository from './Teachers.repository.js';
import { hashPassword } from '../../Utils/argon2.util.js';

class TeachersService {
  async createTeacher(data) {
    const rawPassword = data.password || 'TeacherPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

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
    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
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

export default new TeachersService();
