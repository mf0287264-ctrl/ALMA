import studentsRepository from './Students.repository.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import { generateToken } from '../../Utils/jwt.util.js';

class StudentsService {
  async createStudent(data) {
    if (data.name && (!data.first_name || data.first_name === 'Student')) {
      const parts = data.name.trim().split(' ');
      data.first_name = parts[0] || 'Student';
      data.last_name = parts.slice(1).join(' ') || parts[0];
    }
    delete data.name;

    if (!data.student_code) {
      data.student_code = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!data.grade_level) {
      data.grade_level = 'Grade 8';
    }
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    if (data.school_name === undefined) {
      data.school_name = null;
    }
    if (data.profile_image === undefined) {
      data.profile_image = null;
    }
    if (data.national_id === undefined) {
      data.national_id = null;
    }
    if (data.address === undefined) {
      data.address = null;
    }
    if (data.gender === undefined) {
      data.gender = null;
    }

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

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const student = await studentsRepository.findByEmail(email);
    if (!student) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(student.password_hash, password);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      id: student._id,
      name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
      email: student.email,
      role: 'student'
    });

    const { password_hash, ...studentWithoutPassword } = student;

    return {
      student: studentWithoutPassword,
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
