import adminsRepository from './Admins.repository.js';
import { hashPassword, verifyPassword } from '../../Utils/argon2.util.js';
import { generateToken, generateRefreshToken } from '../../Utils/jwt.util.js';

class AdminsService {
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

    const rawPassword = data.password || 'AdminPass123!';
    data.password_hash = await hashPassword(rawPassword);
    delete data.password;

    const createdAdmin = await adminsRepository.create(data);

    const payload = {
      id: createdAdmin._id,
      name: `${createdAdmin.first_name || ''} ${createdAdmin.last_name || ''}`.trim(),
      email: createdAdmin.email,
      role: 'admin',
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
    if (!admin) {
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
      name: `${admin.first_name || ''} ${admin.last_name || ''}`.trim(),
      email: admin.email,
      role: 'admin',
    };

    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

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

    if (data.password) {
      data.password_hash = await hashPassword(data.password);
      delete data.password;
    }
    const admin = await adminsRepository.update(id, data);
    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }
    return admin;
  }

  async deleteAdmin(id) {
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
