import adminsRepository from './Admins.repository.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import authService from '../Auth/Auth.service.js';
import sessions from '../Auth/AuthSessions.repository.js';
import { ObjectId } from 'mongodb';
import studentsRepository from '../Students/Students.repository.js';
import parentsRepository from '../Parents/Parents.repository.js';
import teachersRepository from '../Teachers/Teachers.repository.js';

class AdminsService {
  async verifyTeacher(adminId, teacherId) {
    if (typeof teacherId !== 'string' || !ObjectId.isValid(teacherId)) throw Object.assign(new Error('A valid teacher identifier is required.'), { statusCode: 400 });
    const teacher = await teachersRepository.update(teacherId, { is_verified: true, teacher_verified_at: new Date(), teacher_verified_by: new ObjectId(String(adminId)) });
    if (!teacher) throw Object.assign(new Error('Teacher not found.'), { statusCode: 404 });
    return { teacher_id: teacherId, verified: true };
  }
  async linkGuardian(adminId, { student_id, parent_id }) {
    if (typeof student_id !== 'string' || typeof parent_id !== 'string' || !ObjectId.isValid(student_id) || !ObjectId.isValid(parent_id)) throw Object.assign(new Error('Valid parent and student identifiers are required.'), { statusCode: 400 });
    const student = await studentsRepository.findById(student_id), parent = await parentsRepository.findById(parent_id);
    if (!student || !parent) throw Object.assign(new Error('Account not found.'), { statusCode: 404 });
    if (student.parent_id && String(student.parent_id) !== parent_id) throw Object.assign(new Error('Remove the existing guardian link before assigning another guardian.'), { statusCode: 409 });
    await studentsRepository.update(student_id, { parent_id: new ObjectId(parent_id), guardian_verified_at: new Date(), guardian_verified_by: new ObjectId(String(adminId)), parent_name: `${parent.first_name || ''} ${parent.last_name || ''}`.trim(), parent_email: parent.email, parent_phone: parent.phone_number || null });
    await parentsRepository.addChild(parent_id, student_id);
    return { student_id, parent_id, verified: true };
  }
  async createAdmin(data) {
    if (data.name && (!data.first_name || data.first_name === 'Admin')) {
      const parts = data.name.trim().split(' ');
      data.first_name = parts[0] || 'Admin';
      data.last_name = parts.slice(1).join(' ') || parts[0];
    }
    delete data.name;

    if (!data.admin_code) {
      data.admin_code = `ADM-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!data.permissions) {
      data.permissions = ['all'];
    }
    if (data.is_active === undefined) {
      data.is_active = true;
    }
    if (data.role === undefined) {
      data.role = 'admin';
    }
    if (data.profile_image === undefined) {
      data.profile_image = null;
    }

    if (data.email) {
      const existingAdmin = await adminsRepository.findByEmail(data.email);
      if (existingAdmin) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    if (!data.password) throw Object.assign(new Error('A password is required.'), { statusCode: 400 });
    const rawPassword = data.password;
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

    const createdAdmin = await adminsRepository.create(data);

    const payload = {
      id: createdAdmin._id,
      auth_version: createdAdmin.auth_version || 0,
      name: `${createdAdmin.first_name || ''} ${createdAdmin.last_name || ''}`.trim(),
      email: createdAdmin.email,
      role: 'admin',
    };

    const { accessToken, refreshToken } = await authService.generateTokenPair(payload);

    const { password_hash, ...adminWithoutPassword } = createdAdmin;

    return {
      admin: adminWithoutPassword,
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

    const admin = await adminsRepository.findByEmail(email);
    if (!admin || admin.is_active === false || !admin.password_hash) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isValid = await verifyPassword(admin.password_hash, password);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: admin._id,
      auth_version: admin.auth_version || 0,
      name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim(),
      email: admin.email,
      role: 'admin',
    };

    const { accessToken, refreshToken } = await authService.generateTokenPair(payload);

    const { password_hash, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async getAllAdmins(filter) {
    return await adminsRepository.findAll(filter);
  }

  async getAdminById(id) {
    const admin = await adminsRepository.findById(id);
    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }
    return admin;
  }

  async updateAdmin(id, data) {
    if (data.email) {
      const existingAdmin = await adminsRepository.findByEmail(data.email);
      if (existingAdmin && existingAdmin._id.toString() !== id.toString()) {
        const error = new Error('Email already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const before = data.email ? await adminsRepository.findById(id) : null;
    const revokeSessions = Boolean(data.password || data.is_active === false || (data.email && data.email !== before?.email));
    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
    const admin = await (revokeSessions ? adminsRepository.updateCredentials(id, data) : adminsRepository.update(id, data));
    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }
    if (revokeSessions) await sessions.revokeUser(id, admin.auth_version);
    return admin;
  }

  async deleteAdmin(id) {
    await sessions.revokeUser(id);
    const result = await adminsRepository.delete(id);
    if (!result || result.deletedCount === 0) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }
    return result;
  }
}

export default new AdminsService();
