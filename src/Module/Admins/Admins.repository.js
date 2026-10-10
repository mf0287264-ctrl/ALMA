import Admin from '../../DB/Models/Admin.model.js';

class AdminsRepository {
  async create(data) {
    return await Admin.create(data);
  }

  async findAll(filter = {}) {
    return await Admin.find(filter).select('-password_hash');
  }

  async findById(id) {
    return await Admin.findById(id).select('-password_hash');
  }

  async update(id, data) {
    return await Admin.findByIdAndUpdate(id, data, { new: true }).select('-password_hash');
  }

  async delete(id) {
    return await Admin.findByIdAndDelete(id);
  }
}

export default new AdminsRepository();
