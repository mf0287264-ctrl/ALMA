import studentsRepository from './Students.repository.js';
import { hashPassword } from '../../Utils/argon2.util.js';

class StudentsService {
  async createStudent(data) {
    const rawPassword = data.password || 'StudentPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;
    
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
    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
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

export default new StudentsService();
