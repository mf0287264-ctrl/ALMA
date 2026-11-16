import teachersRepository from './Teachers.repository.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import { generateToken, generateRefreshToken } from '../../Utils/jwt.util.js';

class TeachersService {
  async createTeacher(data) {
    if (data.name && (!data.first_name || data.first_name === 'Teacher')) {
      const parts = data.name.trim().split(' ');
      data.first_name = parts[0] || 'Teacher';
      data.last_name = parts.slice(1).join(' ') || parts[0];
    }
    delete data.name;

    if (!data.teacher_code) {
      data.teacher_code = `TEA-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!data.specialization) {
      data.specialization = 'Computer Science';
    }
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    if (data.role === undefined) {
      data.role = 'teacher';
    }
    if (data.school_name === undefined) {
      data.school_name = null;
    }
    if (data.profile_image === undefined) {
      data.profile_image = null;
    }
    if (data.phone_number === undefined) {
      data.phone_number = null;
    }

    if (data.email) {
      const existingTeacher = await teachersRepository.findByEmail(data.email);
      if (existingTeacher) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const rawPassword = data.password || 'TeacherPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

    const createdTeacher = await teachersRepository.create(data);

    const payload = {
      id: createdTeacher._id,
      name: `${createdTeacher.first_name || ''} ${createdTeacher.last_name || ''}`.trim(),
      email: createdTeacher.email,
      role: 'teacher',
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { password_hash, ...teacherWithoutPassword } = createdTeacher;

    return {
      teacher: teacherWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const teacher = await teachersRepository.findByEmail(email);
    if (!teacher) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(teacher.password_hash, password);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: teacher._id,
      name: `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim(),
      email: teacher.email,
      role: 'teacher',
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const { password_hash, ...teacherWithoutPassword } = teacher;

    return {
      teacher: teacherWithoutPassword,
      accessToken,
      refreshToken,
    };
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
    if (data.email) {
      const existingTeacher = await teachersRepository.findByEmail(data.email);
      if (existingTeacher && existingTeacher._id.toString() !== id.toString()) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

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
    const result = await teachersRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Teacher not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
}

export default new TeachersService();
