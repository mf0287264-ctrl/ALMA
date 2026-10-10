const adminsRepository = require('./Admins.repository');

class AdminsService {
  async createAdmin(data) {
    if (!data.password_hash) {
      data.password_hash = 'default_hashed_pass';
    }
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

module.exports = new AdminsService();
