import adminsRepository from './Admins.repository.js';
import { hashPassword } from '../../Utils/argon2.util.js';

class AdminsService {
  async createAdmin(data) {
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

    return await adminsRepository.create(data);
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
    const admin = await adminsRepository.delete(id);
    if (!admin) {
      const error = new Error('Admin not found');
      error.statusCode = 404;
      throw error;
    }
    return admin;
  }
}

export default new AdminsService();
