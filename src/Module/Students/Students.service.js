import studentsRepository from './Students.repository.js';
import { hashPassword } from '../../Utils/argon2.util.js';
import { generateToken } from '../../Utils/jwt.util.js';

class StudentsService {
  async createStudent(data) {
    if (data.email) {
      const existingStudent = await studentsRepository.findByEmail(data.email);
      if (existingStudent) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const rawPassword = data.password || 'StudentPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;
    
    const createdStudent = await studentsRepository.create(data);

    const token = generateToken({
      id: createdStudent._id,
      name: `${createdStudent.first_name || ''} ${createdStudent.last_name || ''}`.trim(),
      email: createdStudent.email,
      role: 'student'
    });

    return {
      student: createdStudent,
      token
    };
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
    if (data.email) {
      const existingStudent = await studentsRepository.findByEmail(data.email);
      if (existingStudent && existingStudent._id.toString() !== id.toString()) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

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
    const result = await studentsRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Student not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
}

export default new StudentsService();
